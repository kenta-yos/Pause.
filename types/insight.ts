// --- Legacy types (kept for reference) ---
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

// --- v2: Person-centric types ---

export interface ScriptPattern {
  situation: string;
  script: string;
  note: string;
}

export interface PersonCentricInsight {
  supported?: boolean;
  beliefReason: string;
  resonantAngles: string[];
  scripts: ScriptPattern[];
  avoidWords: string[];
  sources: SourceItem[];
  portraitUpdate?: string;
}

export interface TargetData {
  id: number;
  userId: number;
  nickname: string;
  ageGroup: string | null;
  lifeContext: string | null;
  values: string | null;
  infoSources: string | null;
  relationship: string | null;
  dialoguePattern: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TargetInsightData {
  id: number;
  targetId: number;
  summary: string;
  updatedAt: string;
}

export interface DialogueHistoryEntry {
  id: number;
  targetId: number;
  claim: string;
  output: PersonCentricInsight;
  createdAt: string;
}

export interface AnalyzeRequestV2 {
  claim: string;
  targetId: number;
}

export interface CreateTargetRequest {
  nickname: string;
  ageGroup?: string;
  lifeContext?: string;
  values?: string;
  infoSources?: string;
  relationship?: string;
  dialoguePattern?: string;
}

export interface UpdateTargetRequest extends CreateTargetRequest {}
