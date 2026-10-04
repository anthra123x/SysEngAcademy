export interface ResearchComment {
  id: string;
  author: string;
  avatar?: string;
  text: string;
  timeAgo: string;
  isCurrentUser?: boolean;
  isTeacher?: boolean;
}

export interface TeacherEndorsement {
  teacherName: string;
  note: string;
  date: string;
  xpAwarded: number;
}

export interface ResearchLogEntry {
  id: string;
  author: string;
  authorRole: string;
  avatar?: string;
  type: 'hallazgo' | 'pregunta' | 'paper' | 'benchmark' | 'propuesta' | 'standup' | 'mision_docente';
  title: string;
  content: string;
  codeSnippet?: string;
  codeLanguage?: string;
  upvotes: number;
  hasUpvoted?: boolean;
  comments: ResearchComment[];
  timeAgo: string;
  isCurrentUser?: boolean;
  teacherEndorsement?: TeacherEndorsement;
}

export interface ResearchProjectTask {
  id: string;
  title: string;
  completed: boolean;
  status?: 'pending' | 'in_progress' | 'review' | 'completed';
  type?: 'feature' | 'bug' | 'perf' | 'security' | 'arch';
  assignedTo?: string;
  xpReward?: number;
}

export interface GitCommit {
  id?: string;
  hash: string;
  message: string;
  author: string;
  branch: string;
  timeAgo: string;
  timestamp?: string;
  filesChanged?: number;
  insertions?: number;
  deletions?: number;
}

export interface GitPullRequestReview {
  id?: string;
  reviewer: string;
  isTeacher?: boolean;
  verdict: 'approved' | 'changes_requested' | 'comment';
  comment: string;
  timeAgo: string;
  createdAt?: string;
}

export interface GitPullRequest {
  id: string;
  number: number;
  title: string;
  description: string;
  author: string;
  authorRole: string;
  sourceBranch: string;
  targetBranch: string;
  status: 'open' | 'merged' | 'closed';
  ciStatus: 'pending' | 'passed' | 'failed';
  type?: 'feat' | 'test' | 'perf' | 'fix' | 'docs';
  filename?: string;
  codeSnippet?: string;
  linesAdded?: number;
  linesDeleted?: number;
  createdAt?: string;
  codeDiff?: {
    filename: string;
    additions: string[];
    deletions: string[];
  };
  reviews: GitPullRequestReview[];
  xpReward: number;
  linkedIssueId?: string;
  timeAgo: string;
  mergedAt?: string;
  mergedBy?: string;
}

export interface GitBranch {
  name: string;
  isDefault?: boolean;
  aheadCount?: number;
  behindCount?: number;
  lastCommit?: string;
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
  teacherApproved?: boolean;
  teacherReviewNote?: string;
  activeBranch?: string;
  branches?: GitBranch[];
  commits?: GitCommit[];
  pullRequests?: GitPullRequest[];
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

export interface ChallengeTestCase {
  input: string;
  expected: string;
  description: string;
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
  starterCode?: Record<string, string>;
  testCases?: ChallengeTestCase[];
  solutionTemplate?: string;
  isSolvedByCurrentUser?: boolean;
}

export interface TeacherMission {
  id: string;
  teacherName: string;
  title: string;
  description: string;
  deadline: string;
  xpReward: number;
  completed: boolean;
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
  teacherMissions?: TeacherMission[];
  dailyStandupDoneToday?: boolean;
  isMember: boolean;
  userRole?: 'founder' | 'lead' | 'researcher' | 'apprentice';
}
