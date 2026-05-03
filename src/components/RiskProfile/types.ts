export type RiskQuestionCategory =
  | "horizon"
  | "capacity"
  | "tolerance"
  | "knowledge"
  | "goals";

export interface RiskQuestionOption {
  id: string;
  text: string;
}

export interface RiskQuestion {
  id: string;
  order: number;
  category: RiskQuestionCategory;
  text: string;
  hint?: string;
  options: RiskQuestionOption[];
}

export type RiskBucket =
  | "Conservative"
  | "Moderate"
  | "Aggressive"
  | "Speculative";

export interface RiskProfileResult {
  id: number;
  userId: number;
  score: number;
  bucket: RiskBucket;
  bucketTitle: string;
  bucketDescription: string;
  targetAllocation: {
    stables: number;
    btc: number;
    eth: number;
    largeAlts: number;
    smallAlts: number;
  };
  acceptableDrawdownPct: number;
  answers: Array<{ questionId: string; optionId: string; weight: number }>;
  completedAt?: string;
}

export interface SubmitAnswer {
  questionId: string;
  optionId: string;
}
