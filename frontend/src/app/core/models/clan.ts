export interface ResearchComment {
  id: string;
  author: string;
  avatar?: string;
  text: string;
  timeAgo: string;
  isCurrentUser?: boolean;
}

export interface ResearchLogEntry {
  id: string;
  author: string;
  authorRole: string;
  avatar?: string;
  type: 'hallazgo' | 'pregunta' | 'paper' | 'benchmark' | 'propuesta';
  title: string;
  content: string;
  codeSnippet?: string;
  codeLanguage?: string;
  upvotes: number;
  hasUpvoted?: boolean;
  comments: ResearchComment[];
  timeAgo: string;
  isCurrentUser?: boolean;
}

export interface ResearchProjectTask {
  id: string;
  title: string;
  completed: boolean;
  assignedTo?: string;
}

export interface ResearchProject {
  id: string;
  title: string;
  description: string;
  leadResearcher: string;
  status: 'propuesta' | 'en_progreso' | 'revision' | 'concluido';
  repoUrl?: string;
  techStack: string[];
  membersJoined: string[];
  tasks?: ResearchProjectTask[];
  createdAt: string;
}

export interface ResearchPaper {
  id: string;
  title: string;
  authors: string;
  doiOrUrl: string;
  summary: string;
  addedBy: string;
  tags: string[];
}

export interface ResearchSession {
  id: string;
  title: string;
  dateStr: string;
  topic: string;
  speaker: string;
  attendeesCount: number;
  userAttending: boolean;
}

export interface ResearchMember {
  id: string;
  name: string;
  role: string;
  level: number;
  contributionsCount: number;
  xpContributed: number;
  isCurrentUser?: boolean;
  avatar?: string;
}

export interface ClanWeeklyQuest {
  title: string;
  description: string;
  targetCount: number;
  currentCount: number;
  xpReward: number;
  completed: boolean;
}

export interface ClanBattleChallenge {
  id: string;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  description: string;
  timeLimitMinutes: number;
  xpReward: number;
  completedCount: number;
}

export interface StudyGroup {
  id: string;
  name: string;
  tag: string;
  category: string;
  description: string;
  linesOfResearch: string[];
  membersCount: number;
  streakDays: number;
  level: number;
  levelTitle: string;
  currentXp: number;
  nextLevelXp: number;
  weeklyChallenge: {
    title: string;
    xpReward: number;
    completed: boolean;
  };
  weeklyQuest: ClanWeeklyQuest;
  clanPerks: string[];
  recentLogs: { author: string; message: string; timeAgo: string }[];
  projects: ResearchProject[];
  researchFeed: ResearchLogEntry[];
  libraryPapers: ResearchPaper[];
  upcomingSessions: ResearchSession[];
  researchers: ResearchMember[];
  battleChallenges?: ClanBattleChallenge[];
  isMember: boolean;
  userRole?: 'founder' | 'lead' | 'researcher' | 'apprentice';
}
