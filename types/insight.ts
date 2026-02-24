export type Mode = "self" | "others";
export type ClaimType = "type1" | "type2" | "type3";

export interface SourceItem {
  label: string;       // このソースが示すことの一言説明
  url: string;
  institution: string;
  sourceType: string;  // 統計 / 学術研究 / 政府文書 / 報道
  verified: boolean;
}

export interface RecommendedRead {
  title: string;
  author: string;
  year: string;
  reason: string;  // なぜこの本がこの主張に関連するか（1文）
  type: "book" | "article";
}

export interface InsightData {
  claimType: ClaimType;
  receive: string;     // 受け止める
  context: string;     // 文脈を広げる
  evidence: string;    // 事実と知見を届ける
  elevation: string;   // 視野を一段上げる
  landing: string;     // 静かに着地させる
  sources: SourceItem[];
  recommendedReads: RecommendedRead[];
  language: string;
  hasUnverifiedSources: boolean;
}

export interface AnalyzeRequest {
  claim: string;
  mode: Mode;
}

export interface AnalyzeResponse {
  success: boolean;
  data?: InsightData;
  error?: string;
}
