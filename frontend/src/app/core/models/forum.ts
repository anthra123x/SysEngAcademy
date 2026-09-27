import { User, CourseModule, Lesson } from './index';

export type ForumCategory = 'question' | 'solution' | 'exam' | 'discussion';

export interface ForumPost {
  id: number;
  user_id: number;
  course_id: number;
  module_id?: number;
  lesson_id?: number;
  title: string;
  content: string;
  category: ForumCategory;
  upvotes: number;
  is_solved: boolean;
  created_at: string;
  updated_at: string;
  user?: User;
  module?: CourseModule;
  lesson?: Lesson;
  replies_count?: number;
  replies?: ForumReply[];
}

export interface ForumReply {
  id: number;
  post_id: number;
  user_id: number;
  content: string;
  is_solution: boolean;
  upvotes: number;
  created_at: string;
  updated_at: string;
  user?: User;
}

export interface CreateForumPostData {
  title: string;
  content: string;
  category?: ForumCategory;
  module_id?: number;
  lesson_id?: number;
}
