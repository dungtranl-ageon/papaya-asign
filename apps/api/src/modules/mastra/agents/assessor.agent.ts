import { Injectable, Logger } from '@nestjs/common';
import { Agent } from '@mastra/core/agent';
import { createOpenAI } from '@ai-sdk/openai';
import { generateText, streamText } from 'ai';
import { ASSESSOR_COPILOT_SYSTEM_PROMPT } from '../prompts/assessor.prompts';
import { PolicyRagService } from '../rag/policy-rag.service';
import { Claim, Policy, AssessmentReport } from '@papaya/shared';
import { sanitizeUserFacingText } from '../guardrails/jargon-filter.guardrail';

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

/**
 * Explicit Mastra Agent Instance Factory
 */
export function createAssessorCopilotAgent(model = getMastraLanguageModel()) {
  return new Agent({
    id: 'assessorCopilotAgent',
    name: 'assessorCopilotAgent',
    description: 'Trợ lý Thẩm định Bồi thường Bảo hiểm Y tế chuyên sâu',
    instructions: ASSESSOR_COPILOT_SYSTEM_PROMPT,
    model,
  });
}

/**
 * Global singleton Mastra Agent instance
 */
export const assessorCopilotAgent = createAssessorCopilotAgent();

/**
 * NestJS Injectable Wrapper for Assessor Copilot Agent
 * Integrates RAG retrieval, guardrails, and streaming response
 */
@Injectable()
export class AssessorCopilotAgent {
  private readonly logger = new Logger(AssessorCopilotAgent.name);

  constructor(private readonly ragService: PolicyRagService) {}

  /**
   * Conversational QA for Assessor with RAG-grounded policy context
   */
  async answerAssessorQuery(params: {
    query: string;
    claim: Claim;
    policy: Policy;
    assessmentReport?: AssessmentReport;
  }): Promise<string> {
    const { query, claim, policy, assessmentReport } = params;

    // 1. RAG retrieval of relevant policy clauses
    const relevantClauses = await this.ragService.retrieveClauses(policy, query);
    const clauseContext = relevantClauses
      .map(c => `[${c.clauseId}] ${c.title}\n${c.content}`)
      .join('\n\n');

    // 2. Prepare context prompt in strict insurance domain language
    const prompt = `
THÔNG TIN HỒ SƠ YÊU CẦU BỒI THƯỜNG:
- Mã hồ sơ: ${claim.claimId}
- Người được bảo hiểm: ${claim.patientName} (CCCD/CMND: ${claim.nationalId})
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
    : 'Hồ sơ chưa thực hiện thẩm định tự động.'
}

CÁC ĐIỀU KHOẢN HỢP ĐỒNG BẢO HIỂM ÁP DỤNG:
${clauseContext}

CÂU HỎI TỪ CHUYÊN VIÊN THẨM ĐỊNH:
"${query}"
`;

    try {
      const response = await generateText({
        model: getMastraLanguageModel(),
        system: ASSESSOR_COPILOT_SYSTEM_PROMPT,
        prompt,
      });

      // Apply Guardrail Sanitizer to guarantee no internal tech leaks
      return sanitizeUserFacingText(response.text);
    } catch (error) {
      this.logger.error('Lỗi kết nối bộ xử lý ngôn ngữ:', error);
      const fallback = `Hệ thống tạm thời không thể kết nối tới dịch vụ trí tuệ nhân tạo.
Dưới đây là các điều khoản hợp đồng tra cứu tự động cho câu hỏi của bạn:
${clauseContext}`;
      return sanitizeUserFacingText(fallback);
    }
  }

  /**
   * Stream response for Assessor chat box
   */
  async streamAssessorQuery(params: {
    query: string;
    claim: Claim;
    policy: Policy;
    assessmentReport?: AssessmentReport;
  }) {
    const { query, claim, policy, assessmentReport } = params;
    const relevantClauses = await this.ragService.retrieveClauses(policy, query);
    const clauseContext = relevantClauses
      .map(c => `[${c.clauseId}] ${c.title}\n${c.content}`)
      .join('\n\n');

    const prompt = `
HỒ SƠ BỒI THƯỜNG: ${claim.claimId} | BỆNH NHÂN: ${claim.patientName} | CHẨN ĐOÁN: ${claim.diagnosisIcd10}
ĐIỀU KHOẢN HỢP ĐỒNG LIÊN QUAN:
${clauseContext}

KẾT QUẢ THẨM ĐỊNH: ${assessmentReport ? `${assessmentReport.finalRecommendation} - Số tiền chi trả: ${assessmentReport.totalPayable.toLocaleString()} VND` : 'Chưa có'}
CÂU HỎI: "${query}"
`;

    return streamText({
      model: getMastraLanguageModel(),
      system: ASSESSOR_COPILOT_SYSTEM_PROMPT,
      prompt,
    });
  }
}
