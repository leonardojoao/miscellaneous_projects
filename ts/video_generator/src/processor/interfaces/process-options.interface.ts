// src/processor/interfaces/process-options.interface.ts
export interface ProcessOptions {
  resolution?: string;
  subtitle?: boolean;
  onlyShortVideo?: boolean;
  onlyLongVideo?: boolean;
}

export interface ValidationResult {
  valid: string[];
  invalid: string[];
}