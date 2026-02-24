export type Mode = "self" | "others";

export interface FactItem {
  claim: string;
  source: {
    title: string;
    url: string;
    institution: string;
    verified: boolean;
  };
}

export interface InsightData {
  inputSummary: string;
  background: string;
  facts: FactItem[];
  perspectives: string[];
  conversationTips: {
    forSelf: string[];
    forOthers: string[];
  };
  references: Array<{
    title: string;
    url: string;
    institution: string;
    verified: boolean;
  }>;
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
