export interface CodeExecutionRequest {
  language: string;
  code: string;
  stdin?: string;
  tests?: Array<[string | null, string]>;
}

export interface TestCaseResult {
  input: string | null;
  expected: string;
  actual: string;
  passed: boolean;
}

export interface CodeExecutionResponse {
  stdout: string;
  stderr: string;
  exit_code: number;
  tests?: TestCaseResult[];
  execution_time_ms: number;
  language: string;
}

export interface LanguageInfo {
  id: string;
  label: string;
  mode: string;
  sample: string;
  engine: 'local' | 'piston';
}

export interface CodeChallengeLessonData {
  language: string;
  starter: string;
  solution?: string;
  tests: Array<[string | null, string]>;
  hint?: string;
}

// Extend LessonDetail to include code_challenge fields
export interface LessonDetailCodeChallenge extends LessonDetail {
  language?: string;
  starter_code?: string;
  solution?: string;
  test_cases?: any;
  hint?: string;
}

// Re-export LessonDetail for convenience
import { LessonDetail } from './index';