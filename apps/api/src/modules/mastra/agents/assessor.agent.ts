import { Injectable, Logger } from '@nestjs/common';
import { Agent } from '@mastra/core/agent';
import { createOpenAI } from '@ai-sdk/openai';
import { generateText, streamText } from 'ai';
import { ASSESSOR_COPILOT_SYSTEM_PROMPT } from '../prompts/assessor.prompts';
import { PolicyRagService } from '../rag/policy-rag.service';
import { ConversationMemoryService } from '../memory/conversation-memory.service';
import { Claim, Policy, AssessmentReport } from '@papaya/shared';
import { sanitizeUserFacingText } from '../guardrails/jargon-filter.guardrail';
import {
  sanitizePiiFromPrompt,
  maskNationalId,
  maskPatientName,
} from '../guardrails/pii-masker.guardrail';

import * as fs from 'fs';
import * as path from 'path';

/**
 * Creates the provider model instance for Mastra
 */
export function getMastraLanguageModel() {
  let baseURL = process.env.OPENAI_BASE_URL || 'http://localhost:11434/v1';
  let apiKey = process.env.OPENAI_API_KEY || 'ollama';
  let modelName = process.env.MODEL_NAME || 'gemma4:31b-cloud';

  // Read latest .env directly if process.env has stale or uninitialized values
  try {
    const candidatePaths = [
      path.resolve(process.cwd(), '../../.env'),
      path.resolve(process.cwd(), '../.env'),
      path.resolve(process.cwd(), '.env'),
      path.resolve(__dirname, '../../../../../../.env'),
    ];
    for (const envPath of candidatePaths) {
      if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf8');
        const baseMatch = content.match(/OPENAI_BASE_URL=["']?([^"'\r\n]+)["']?/);
        if (baseMatch && baseMatch[1]) baseURL = baseMatch[1].trim();
        const keyMatch = content.match(/OPENAI_API_KEY=["']?([^"'\r\n]+)["']?/);
        if (keyMatch && keyMatch[1]) apiKey = keyMatch[1].trim();
        const modelMatch = content.match(/MODEL_NAME=["']?([^"'\r\n]+)["']?/);
        if (modelMatch && modelMatch[1]) modelName = modelMatch[1].trim();
        break;
      }
    }
  } catch {
    // Continue with existing process.env
  }

  // Defensive auto-correction: ollama.com requires HTTPS to prevent HTTP 301 redirect failure on POST
  if (baseURL.startsWith('http://ollama.com')) {
    baseURL = baseURL.replace('http://ollama.com', 'https://ollama.com');
  }

  // Defensive fallback: muse-spark-open requires a paid Pro plan on Ollama Cloud.
  // Use gemma4:31b-cloud (confirmed available on Free plan).
  if (
    baseURL.includes('ollama.com') &&
    (modelName.includes('muse-spark-open') || modelName === 'llama3.3')
  ) {
    modelName = 'gemma4:31b-cloud';
  }

  const provider = createOpenAI({
    baseURL,
    apiKey,
  });

  return provider(modelName);
}

import { copilotApiTools } from '../tools/copilot-api.tools';

/**
 * Explicit Mastra Agent Instance Factory
 */
export function createAssessorCopilotAgent(model = getMastraLanguageModel()) {
  return new Agent({
    id: 'assessorCopilotAgent',
    name: 'assessorCopilotAgent',
    description:
      'Trợ lý Thẩm định Bồi thường Bảo hiểm Y tế chuyên sâu có công cụ tra cứu cơ sở dữ liệu và chiết tính',
    instructions: ASSESSOR_COPILOT_SYSTEM_PROMPT,
    model,
    tools: copilotApiTools as any,
  });
}

/**
 * Global singleton Mastra Agent instance
 */
export const assessorCopilotAgent = createAssessorCopilotAgent();

/**
 * NestJS Injectable Wrapper for Assessor Copilot Agent
 * Integrates RAG retrieval, guardrails, database tools, memory and streaming response
 */
@Injectable()
export class AssessorCopilotAgent {
  private readonly logger = new Logger(AssessorCopilotAgent.name);

  constructor(
    private readonly ragService: PolicyRagService,
    private readonly memoryService?: ConversationMemoryService,
  ) {}

  /**
   * Conversational QA for Assessor with RAG-grounded policy context, memory and API/DB tools
   */
  async answerAssessorQuery(params: {
    query: string;
    claim: Claim;
    policy: Policy;
    assessmentReport?: AssessmentReport;
  }): Promise<string> {
    const { query, claim, policy, assessmentReport } = params;

    // 1. Persist the current incoming user query into claim-scoped memory
    if (this.memoryService) {
      await this.memoryService.saveMessage({
        claimId: claim.claimId,
        role: 'user',
        content: query,
      });
    }

    // 2. Retrieve multi-turn conversation history for sliding window memory
    const history = this.memoryService
      ? await this.memoryService.getRecentMessages(claim.claimId, 10)
      : [];

    // 1. RAG retrieval of relevant policy clauses
    const relevantClauses = await this.ragService.retrieveClauses(policy, query);
    const clauseContext = relevantClauses
      .map(c => `[${c.clauseId}] ${c.title}\n${c.content}`)
      .join('\n\n');

    // 2. Prepare context prompt with PII Masking Guardrail enforced
    const maskedCccd = maskNationalId(claim.nationalId);
    const maskedPatient = maskPatientName(claim.patientName);
    const rawPrompt = `
THÔNG TIN HỒ SƠ YÊU CẦU BỒI THƯỜNG:
- Mã hồ sơ: ${claim.claimId}
- Người được bảo hiểm (PII Masked): ${maskedPatient} (CCCD/CMND đã mã hóa PII: ${maskedCccd})
- Chẩn đoán y khoa: ${claim.diagnosisIcd10} - ${claim.diagnosisDescription}
- Cơ sở y tế điều trị: ${claim.hospitalName}
- Tổng số tiền đề nghị bồi thường: ${claim.totalRequested.toLocaleString()} VND

KẾT QUẢ THẨM ĐỊNH HIỆN TẠI (NẾU CÓ):
${
  assessmentReport
    ? `- Kết luận khuyến nghị: ${assessmentReport.finalRecommendation}
- Số tiền bảo hiểm chấp thuận chi trả: ${assessmentReport.totalPayable.toLocaleString()} VND
- Số tiền khấu trừ / đồng chi trả: ${assessmentReport.totalDeductions.toLocaleString()} VND
- Mức độ tin cậy đánh giá: ${assessmentReport.confidenceScore}%
- Tóm tắt giám định: ${assessmentReport.executiveSummary}`
    : 'Hồ sơ chưa có báo cáo thẩm định sẵn trong bộ nhớ; bạn có thể dùng công cụ getLatestAssessment hoặc getClaimDetails để tra cứu.'
}

CÁC ĐIỀU KHOẢN HỢP ĐỒNG BẢO HIỂM LIÊN QUAN:
${clauseContext}

HƯỚNG DẪN DÀNH CHO BẠN (AI ASSESSOR COPILOT):
Bạn có quyền truy cập vào các công cụ (tools) tra cứu dữ liệu ứng dụng:
- getClaimDetails: Xem chi tiết ngày nằm viện, viện phí, trạng thái hồ sơ.
- getClaimDocuments: Xem danh mục chứng từ, tính hợp lệ từng file.
- getClaimItems: Xem từng khoản bóc tách viện phí (tiền phòng, mổ, thuốc, xét nghiệm).
- getPolicySchedule: Xem bảng quyền lợi, hạn mức năm, danh mục loại trừ ICD-10.
- getLatestAssessment: Xem báo cáo thẩm định mới nhất của workflow.
- simulateBenefitCalculation: Mô phỏng lại quyền lợi và số tiền chi trả khi thay đổi tỷ lệ đồng chi trả.
Hãy chủ động gọi các công cụ này nếu cần thêm số liệu thực tế chính xác để trả lời chuyên viên.

CÂU HỎI TỪ CHUYÊN VIÊN THẨM ĐỊNH:
"${query}"
`;

    const prompt = sanitizePiiFromPrompt(rawPrompt, claim.patientName);

    try {
      let response;
      if (this.memoryService && history.length > 0) {
        const fullSystem = `${ASSESSOR_COPILOT_SYSTEM_PROMPT}\n\n${prompt}`;
        const llmMessages = this.memoryService.formatToLlmMessages({
          systemPrompt: fullSystem,
          history,
          currentQuery: query,
        });

        response = await generateText({
          model: getMastraLanguageModel(),
          messages: llmMessages,
          tools: copilotApiTools,
          maxSteps: 5,
        });
      } else {
        response = await generateText({
          model: getMastraLanguageModel(),
          system: ASSESSOR_COPILOT_SYSTEM_PROMPT,
          prompt,
          tools: copilotApiTools,
          maxSteps: 5,
        });
      }

      // Apply Dual Guardrails: PII Sanitizer + Internal Jargon Sanitizer
      const piiSanitized = sanitizePiiFromPrompt(response.text, claim.patientName);
      const finalReply = sanitizeUserFacingText(piiSanitized);

      // Persist assistant reply to conversation memory
      if (this.memoryService) {
        await this.memoryService.saveMessage({
          claimId: claim.claimId,
          role: 'assistant',
          content: finalReply,
        });
      }

      return finalReply;
    } catch (error) {
      this.logger.error('Lỗi kết nối bộ xử lý ngôn ngữ:', error);
      const fallback = `Hệ thống tạm thời không thể kết nối tới dịch vụ trí tuệ nhân tạo.
Dưới đây là các điều khoản hợp đồng tra cứu tự động cho câu hỏi của bạn:
${clauseContext}`;
      const finalFallback = sanitizeUserFacingText(fallback);
      if (this.memoryService) {
        await this.memoryService.saveMessage({
          claimId: claim.claimId,
          role: 'assistant',
          content: finalFallback,
        });
      }
      return finalFallback;
    }
  }

  /**
   * Stream response for Assessor chat box with DB/API tools and conversation memory
   */
  async streamAssessorQuery(params: {
    query: string;
    claim: Claim;
    policy: Policy;
    assessmentReport?: AssessmentReport;
  }) {
    const { query, claim, policy, assessmentReport } = params;

    // Persist user query to memory
    if (this.memoryService) {
      await this.memoryService.saveMessage({
        claimId: claim.claimId,
        role: 'user',
        content: query,
      });
    }

    const history = this.memoryService
      ? await this.memoryService.getRecentMessages(claim.claimId, 10)
      : [];

    const relevantClauses = await this.ragService.retrieveClauses(policy, query);
    const clauseContext = relevantClauses
      .map(c => `[${c.clauseId}] ${c.title}\n${c.content}`)
      .join('\n\n');

    const maskedPatient = maskPatientName(claim.patientName);
    const rawPrompt = `
HỒ SƠ BỒI THƯỜNG: ${claim.claimId} | BỆNH NHÂN (PII MASKED): ${maskedPatient} | CHẨN ĐOÁN: ${claim.diagnosisIcd10}
ĐIỀU KHOẢN HỢP ĐỒNG LIÊN QUAN:
${clauseContext}

KẾT QUẢ THẨM ĐỊNH: ${assessmentReport ? `${assessmentReport.finalRecommendation} - Số tiền chi trả: ${assessmentReport.totalPayable.toLocaleString()} VND` : 'Chưa có'}

Bạn có các công cụ tra cứu số liệu thực tế từ hệ thống (getClaimDetails, getClaimDocuments, getClaimItems, getPolicySchedule, getLatestAssessment, simulateBenefitCalculation).
CÂU HỎI: "${query}"
`;

    const prompt = sanitizePiiFromPrompt(rawPrompt, claim.patientName);

    if (this.memoryService && history.length > 0) {
      const fullSystem = `${ASSESSOR_COPILOT_SYSTEM_PROMPT}\n\n${prompt}`;
      const llmMessages = this.memoryService.formatToLlmMessages({
        systemPrompt: fullSystem,
        history,
        currentQuery: query,
      });

      return streamText({
        model: getMastraLanguageModel(),
        messages: llmMessages,
        tools: copilotApiTools,
        maxSteps: 5,
      });
    }

    return streamText({
      model: getMastraLanguageModel(),
      system: ASSESSOR_COPILOT_SYSTEM_PROMPT,
      prompt,
      tools: copilotApiTools,
      maxSteps: 5,
    });
  }
}
