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

export interface AcademicInsight {
  argument: string;   // 主張・論点
  author: string;     // 著者名
  work: string;       // 著作・論文名
  year?: string;      // 発表年
  field: string;      // 分野（社会学・哲学・経済学 等）
}

export interface InsightData {
  inputSummary: string;
  background: string;
  facts: FactItem[];
  academicInsights: AcademicInsight[];
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
