// src/processor/interfaces/process-options.interface.ts
export interface ProcessOptions {
  resolution?: string;
  subtitle?: boolean;
  onlyShortVideo?: boolean;
}

export interface ValidationResult {
  valid: string[];
  invalid: string[];
}