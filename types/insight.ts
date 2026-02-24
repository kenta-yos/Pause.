export type ClaimType = "type1" | "type2" | "type3";
export type ApproachKey =
  | "contradiction"
  | "perspective"
  | "prebunking"
  | "narrative"
  | "analogy";

export interface SourceItem {
  label: string;
  institution: string;
  sourceType: string;
  year?: string;
}

export interface InsightData {
  claimType: ClaimType;

  // Section 1: For the user (academic, objective)
  understanding: string; // なぜ信じてしまうのか
  evidence: string;      // 事実とデータ

  // Section 2: 5 structured conversation approaches
  approaches: {
    contradiction: string;      // ①矛盾に気づいてもらう
    perspective: string;        // ②立場を入れ替えてみる
    prebunking: string;         // ③なぜ広まるかを先に話す
    narrative: string;          // ④一人の人間の話をする
    analogy: string;            // ⑤相手の価値観から入る
    recommended: ApproachKey;   // この言説に特に有効なアプローチ
    recommendedReason: string;  // なぜ有効か（1〜2文）
  };

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
