export interface CreditRiskNarrative {
  customerId: number;
  narrative: string;
  model: string;
  cached: boolean;
  fallbackUsed: boolean;
  generatedAt: string;
}
