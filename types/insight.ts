export type Mode = "self" | "others";
export type ClaimType = "type1" | "type2" | "type3";

export interface SourceItem {
  label: string;
  url: string;
  institution: string;
  sourceType: string;
  verified: boolean;
}

export interface InsightData {
  claimType: ClaimType;
  receive: string;    // その感覚の根っこ
  context: string;    // なぜこの言説は広まるのか / なぜこの視点が重要か
  evidence: string;   // データと研究が示すこと
  elevation: string;  // 構造的に見ると
  question: string;   // 思考に揺さぶりをかける問い
  sources: SourceItem[];
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
