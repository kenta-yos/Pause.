export type ClaimType = "type1" | "type2" | "type3";

export interface SourceItem {
  label: string;
  institution: string;
  sourceType: string;
  year?: string;
}

export interface InsightData {
  claimType: ClaimType;

  // Section 1: For the user (academic, objective)
  understanding: string; // ①その人の現実・心理を理解する
  evidence: string;      // ②対抗するための事実・学術知見

  // Section 2: How to talk to your loved one
  conversation: string;  // 具体的な伝え方・例え話・視点転換
  question: string;      // 問いかけの例

  sources: SourceItem[];
  language: string;
}

export interface AnalyzeRequest {
  claim: string;
}

export interface AnalyzeResponse {
  success: boolean;
  data?: InsightData;
  error?: string;
}
