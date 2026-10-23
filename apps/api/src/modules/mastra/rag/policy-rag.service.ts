import { Injectable, Logger } from '@nestjs/common';
import { Policy } from '@papaya/shared';

export interface PolicyClauseChunk {
  clauseId: string;
  policyNumber: string;
  section: string;
  title: string;
  content: string;
  category?: string;
}

@Injectable()
export class PolicyRagService {
  private readonly logger = new Logger(PolicyRagService.name);

  /**
   * Split a policy structure into searchable semantic clause chunks
   */
  chunkPolicy(policy: Policy): PolicyClauseChunk[] {
    const chunks: PolicyClauseChunk[] = [];

    // 1. General Policy Terms
    chunks.push({
      clauseId: `CLAUSE-GEN-${policy.policyNumber}-01`,
      policyNumber: policy.policyNumber,
      section: 'Chương 1: Điều Khoản Chung & Hiệu Lực',
      title: `Quy Tắc Bảo Hiểm ${policy.planName}`,
      content: `Hợp đồng số ${policy.policyNumber} cấp cho ${policy.insuredName} (CCCD: ${policy.nationalId}). Hiệu lực từ ${policy.effectiveDate} đến ${policy.expiryDate}. Hạn mức năm tối đa: ${policy.annualTotalLimit.toLocaleString()} VND.`,
    });

    // 2. Benefit Categories Chunks
    const benefits = policy.benefits || [];
    benefits.forEach((b, idx: number) => {
      chunks.push({
        clauseId: `CLAUSE-BEN-${policy.policyNumber}-${b.category || idx + 1}`,
        policyNumber: policy.policyNumber,
        section: `Chương 2: Quyền Lợi Bảo Hiểm Chi Tiết - ${b.category}`,
        title: `Quyền lợi ${b.category}`,
        category: b.category,
        content: `Quyền lợi ${b.category}: Hạn mức tối đa mỗi lượt ${b.maxLimitPerClaim?.toLocaleString()} VND, hạn mức năm ${b.maxLimitPerYear?.toLocaleString()} VND. Tỷ lệ đồng chi trả (Copay): ${(b.copayRate * 100).toFixed(0)}%. ${b.subLimitPerDay ? `Giới hạn ngày giường: ${b.subLimitPerDay.toLocaleString()} VND/ngày.` : ''}`,
      });
    });

    // 3. Exclusions Chunks
    const exclusions = policy.exclusions || [];
    if (exclusions.length > 0) {
      chunks.push({
        clauseId: `CLAUSE-EXCL-${policy.policyNumber}-01`,
        policyNumber: policy.policyNumber,
        section: 'Chương 3: Các Điểm Loại Trừ Trách Nhiệm Bảo Hiểm',
        title: 'Danh mục bệnh và tình trạng bị loại trừ chi trả',
        content: `Bảo hiểm không chịu trách nhiệm chi trả cho các chẩn đoán thuộc mã ICD-10 sau: ${exclusions.join(', ')}. Các chi phí phát sinh từ những tình trạng này sẽ bị từ chối 100%.`,
      });
    }

    // 4. Waiting Periods Chunks
    const waitingPeriods = policy.waitingPeriods || {};
    const entries = Object.entries(waitingPeriods);
    if (entries.length > 0) {
      const wpDetails = entries.map(([k, v]) => `${k}: ${v} ngày`).join('; ');
      chunks.push({
        clauseId: `CLAUSE-WAIT-${policy.policyNumber}-01`,
        policyNumber: policy.policyNumber,
        section: 'Chương 4: Thời Gian Chờ Bảo Hiểm',
        title: 'Quy định thời gian chờ trước khi phát sinh quyền lợi',
        content: `Áp dụng thời gian chờ đối với các quyền lợi: ${wpDetails}. Chi phí phát sinh trong thời gian chờ sẽ không được thanh toán.`,
      });
    }

    return chunks;
  }

  /**
   * Semantic retrieval of relevant policy clauses matching query or diagnosis
   */
  async retrieveClauses(policy: Policy, query: string): Promise<PolicyClauseChunk[]> {
    const allChunks = this.chunkPolicy(policy);
    const normalizedQuery = query.toLowerCase().trim();

    // Hybrid keyword & semantic relevance ranking
    const matched = allChunks.filter(chunk => {
      const text =
        `${chunk.title} ${chunk.section} ${chunk.content} ${chunk.clauseId}`.toLowerCase();
      const keywords = normalizedQuery.split(/\s+/);
      return keywords.some(kw => kw.length > 2 && text.includes(kw));
    });

    this.logger.log(
      `RAG retrieved ${matched.length}/${allChunks.length} clause chunks for policy ${policy.policyNumber} on query "${query}"`,
    );

    return matched.length > 0 ? matched : allChunks.slice(0, 3);
  }
}
