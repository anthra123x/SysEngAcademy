export interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  role: 'student' | 'instructor' | 'admin';
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color: string;
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
  category?: Category;
  instructor?: User;
  thumbnail?: string;
  is_published: boolean;
  is_free: boolean;
  duration_hours: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  learning_path?: LearningPath;
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

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
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

/** Bloque de contenido tipo ProseMirror doc (heading | paragraph | code | list | ...) */
export interface LessonDocBlock {
  type: string;
  level?: number;
  text?: string;
  language?: string;
  items?: string[];
}

export interface LessonContentDoc {
  type: string;
  blocks: LessonDocBlock[];
}

export interface LessonQuizAnswer {
  id: number;
  answer_text: string;
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
  course_id?: number;
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
