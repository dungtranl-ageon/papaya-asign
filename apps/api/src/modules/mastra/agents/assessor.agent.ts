import { Injectable, Logger } from '@nestjs/common';
import { createOpenAI } from '@ai-sdk/openai';
import { generateText, streamText } from 'ai';
import { ASSESSOR_COPILOT_SYSTEM_PROMPT } from '../prompts/assessor.prompts';
import { PolicyRagService } from '../rag/policy-rag.service';
import { Claim, Policy, AssessmentReport } from '@papaya/shared';

@Injectable()
export class AssessorCopilotAgent {
  private readonly logger = new Logger(AssessorCopilotAgent.name);

  constructor(private readonly ragService: PolicyRagService) {}

  private getModel() {
    const baseURL = process.env.OPENAI_BASE_URL || 'http://localhost:11434/v1';
    const apiKey = process.env.OPENAI_API_KEY || 'ollama';
    const modelName = process.env.MODEL_NAME || 'llama3.3';

    const provider = createOpenAI({
      baseURL,
      apiKey,
    });

    return provider(modelName);
  }

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

    // 2. Prepare context prompt
    const prompt = `
THÔNG TIN HỒ SƠ CLAIM HIỆN TẠI:
- Mã hồ sơ: ${claim.claimId}
- Người bệnh: ${claim.patientName} (CCCD: ${claim.nationalId})
- Chẩn đoán: ${claim.diagnosisIcd10} - ${claim.diagnosisDescription}
- Bệnh viện: ${claim.hospitalName}
- Tổng tiền yêu cầu: ${claim.totalRequested.toLocaleString()} VND

KẾT QUẢ THẨM ĐỊNH (NẾU CÓ):
${
  assessmentReport
    ? `- Khuyến nghị: ${assessmentReport.finalRecommendation}
- Số tiền duyệt: ${assessmentReport.totalPayable.toLocaleString()} VND
- Số tiền khấu trừ/đồng chi trả: ${assessmentReport.totalDeductions.toLocaleString()} VND
- Điểm tin cậy: ${assessmentReport.confidenceScore}%
- Tóm tắt: ${assessmentReport.executiveSummary}`
    : 'Chưa chạy thẩm định tự động.'
}

ĐIỀU KHOẢN HỢP ĐỒNG LIÊN QUAN (RAG RETRIEVED):
${clauseContext}

CÂU HỎI CỦA CHUYÊN VIÊN:
"${query}"
`;

    try {
      const response = await generateText({
        model: this.getModel(),
        system: ASSESSOR_COPILOT_SYSTEM_PROMPT,
        prompt,
      });

      return response.text;
    } catch (error) {
      this.logger.error('Error generating response from LLM Gateway:', error);
      // Fallback response with grounded RAG clauses
      return `Không thể kết nối đến LLM Gateway (${process.env.OPENAI_BASE_URL}). 
Dưới đây là các điều khoản hợp đồng tra cứu tự động cho câu hỏi của bạn:
${clauseContext}`;
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
HỒ SƠ: ${claim.claimId} | BỆNH NHÂN: ${claim.patientName} | CHẨN ĐOÁN: ${claim.diagnosisIcd10}
ĐIỀU KHOẢN HỢP ĐỒNG:
${clauseContext}

BÁO CÁO: ${assessmentReport ? `${assessmentReport.finalRecommendation} - Duyệt: ${assessmentReport.totalPayable.toLocaleString()} VND` : 'N/A'}
CÂU HỎI: "${query}"
`;

    return streamText({
      model: this.getModel(),
      system: ASSESSOR_COPILOT_SYSTEM_PROMPT,
      prompt,
    });
  }
}
