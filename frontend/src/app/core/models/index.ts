export interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  role: 'student' | 'instructor' | 'admin';
  email_verified_at?: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color: string;
  courses_count?: number;
}

export interface LearningPath {
  id: number;
  title: string;
  slug: string;
  description: string;
  category?: Category;
  category_id?: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  thumbnail?: string;
  is_published: boolean;
  estimated_hours: number;
  levels?: LearningPathLevel[];
  courses_count?: number;
}

export interface LearningPathLevel {
  id: number;
  learning_path_id: number;
  title: string;
  order: number;
  description?: string;
  courses?: Course[];
}

export interface Course {
  id: number;
  title: string;
  slug: string;
  description: string;
  category_id?: number | null;
  category?: Category;
  instructor?: User;
  thumbnail?: string | null;
  is_published: boolean;
  is_free: boolean;
  price?: number;
  duration_hours: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  learning_path_id?: number | null;
  learning_path_level_id?: number | null;
  learning_path?: LearningPath;
  order?: number;
  modules?: CourseModule[];
  lessons_count?: number;
  enrolled?: boolean;
  progress_percent?: number;
}

export interface CourseModule {
  id: number;
  course_id: number;
  title: string;
  description?: string;
  order: number;
  lessons?: Lesson[];
}

export interface Lesson {
  id: number;
  module_id: number;
  title: string;
  slug: string;
  order: number;
  type: 'video' | 'article' | 'quiz' | 'code_challenge';
  duration_minutes: number;
  is_preview: boolean;
  content?: unknown;
  completed?: boolean;
  language?: string | null;
  starter_code?: string | null;
  solution?: string | null;
  hint?: string | null;
  test_cases?: Array<{ input?: string; expected: string }> | Array<[string | null, string]> | any;
}

export interface Enrollment {
  id: number;
  user_id: number;
  course_id: number;
  enrolled_at: string;
  completed_at?: string;
  progress_percent: number;
  course?: Course;
}

export interface AiConversation {
  id: number;
  user_id: number;
  title: string;
  created_at: string;
  messages?: AiMessage[];
}

export interface AiMessage {
  id: number;
  conversation_id: number;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

/**
 * Respuesta paginada de Laravel: los metadatos vienen en la raíz, no anidados
 * en `meta` (a diferencia del resource collection de Laravel 11+).
 */
export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from?: number | null;
  to?: number | null;
}

export interface CourseFilters {
  search?: string;
  difficulty?: string;
  category?: string;
  is_free?: boolean;
  learning_path_id?: number;
  independent?: boolean;
  page?: number;
}

// === Lesson Player ===

export interface DiagramStep {
  step: string | number;
  label: string;
  desc: string;
  tone?: string;
  icon?: string;
  codeSnippet?: string;
}

export interface DiagramCell {
  address?: string;
  label: string;
  value: string;
  type?: string;
  color?: string;
}

/** Bloque de contenido tipo ProseMirror doc (heading | paragraph | code | list | diagram | ...) */
export interface LessonDocBlock {
  type: string;
  level?: number;
  text?: string;
  language?: string;
  items?: string[];
  /** Título opcional de callout / quote / keypoints / diagram. */
  title?: string;
  /** Subtítulo o leyenda pedagógica del diagrama o bloque. */
  caption?: string;
  /** Lista ordenada. */
  ordered?: boolean;
  /** Tono del callout: info | tip | warning | danger. */
  tone?: string;
  /** Subtipo de diagrama gráfico: 'flow' | 'memory' | 'comparison' | 'architecture' | 'svg' */
  diagram_type?: 'flow' | 'memory' | 'comparison' | 'architecture' | 'svg';
  steps?: DiagramStep[];
  cells?: DiagramCell[];
  leftLabel?: string;
  leftItems?: string[];
  rightLabel?: string;
  rightItems?: string[];
  svg_content?: string;
}

export interface LessonContentDoc {
  type: string;
  blocks: LessonDocBlock[];
}

export interface LessonQuizAnswer {
  id: number;
  answer_text: string;
  answer?: string;
}

export interface LessonQuizQuestion {
  id: number;
  /** 'single' | 'multiple' | 'code' (el backend puede enviar 'code' además de single/multiple) */
  type: string;
  question: string;
  answers: LessonQuizAnswer[];
}

export interface LessonQuiz {
  id: number;
  title: string;
  questions: LessonQuizQuestion[];
}

export interface LessonModuleRef {
  id: number;
  title: string;
  order?: number;
  course_id?: number;
  course_slug?: string;
  course_title?: string;
  course?: Pick<Course, 'id' | 'slug' | 'title'>;
}

export interface LessonRef {
  slug: string;
  title?: string;
}

export interface LessonDetail extends Lesson {
  module: LessonModuleRef;
  quiz: LessonQuiz | null;
  prev_lesson?: LessonRef | null;
  next_lesson?: LessonRef | null;
}

export interface QuizAttemptQuestionResult {
  question_id: number;
  correct: boolean;
  correct_answer_ids: number[];
  selected_ids: number[];
  explanation: string;
}

export interface QuizAttemptResult {
  score: number;
  correct: number;
  total: number;
  /** Backend: true si score >= 60 (aprobado). */
  passed?: boolean;
  results: QuizAttemptQuestionResult[];
}

// === AI Companion (Byte) ===

export interface AiAskReply {
  reply: string;
}

export interface AiPracticeQuestion {
  question: string;
  /** 'single' por ahora: el backend genera opciones con una única correcta. */
  type: 'single' | string;
  answers: string[];
  correct_index: number;
  explanation: string;
}

export interface AiPracticeQuiz {
  title: string;
  questions: AiPracticeQuestion[];
}

export * from './forum';

