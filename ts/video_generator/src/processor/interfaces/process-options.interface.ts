// src/processor/interfaces/process-options.interface.ts
export interface ProcessOptions {
  resolution?: string;
  subtitle?: boolean;
}

export interface ValidationResult {
  valid: string[];
  invalid: string[];
}