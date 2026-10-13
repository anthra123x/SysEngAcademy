export type ChallengeDifficulty = 'facil' | 'media' | 'dificil' | 'hardcore';

export type ChallengeStatus = 'pending' | 'solved' | 'attempted' | 'my_creation';

export interface TestCaseModel {
  input?: string;
  expected: string;
  isHidden?: boolean;
  label?: string;
}

export interface ChallengeAuthor {
  name: string;
  username: string;
  role: string;
  avatarInitial?: string;
  isOfficial?: boolean;
  isCurrentUser?: boolean;
  isTopContributor?: boolean;
  isMonitor?: boolean;
  isAi?: boolean;
}

export interface Challenge {
  id: string;
  slug: string;
  title: string;
  description: string;
  difficulty: ChallengeDifficulty;
  acceptanceRate: number;
  xp: number;
  category: 'algoritmos' | 'estructuras' | 'concurrencia' | 'so' | 'bd' | 'compiladores';
  tags: string[];
  languages: string[];
  author: ChallengeAuthor;
  status: ChallengeStatus;
  upvotes: number;
  commentsCount: number;
  userVoted?: boolean;
  isOfficial: boolean;
  isCommunity: boolean;
  isSpotlight?: boolean;
  testCasesCount: number;
  testCases: TestCaseModel[];
  starterCode: Record<string, string>;
  academicTrack?: 'sem1-3' | 'sem4-5' | 'sem6-7' | 'sem8-10';
  solutionPreview?: {
    filename: string;
    benchmark: string;
    passedCases: string;
    memoryMb: string;
    percentileSpeed?: string;
    percentileMemory?: string;
    code: string;
  };
  publishedAt?: string;
}

export interface PodiumMember {
  rank: number;
  name: string;
  username: string;
  role: string;
  xp: number;
  avatar: string;
  isCurrentUser?: boolean;
}

export interface ActivityFeedItem {
  icon: string;
  user?: string;
  text: string;
  time: string;
}

export interface CodelabStats {
  totalStudents?: number;
  solvedToday: number;
  solvedTodayTrend: string;
  communityChallengesCount: number;
  topRankUser: string;
  topRankXp: number;
  topRankPosition: number;
  latencyMs: number;
  sandboxHealthPercent: number;
  podium?: PodiumMember[];
  activityFeed?: ActivityFeedItem[];
}

export interface CodelabComment {
  id: string;
  challengeId: string;
  author: {
    name: string;
    username: string;
    role: string;
    avatarInitial?: string;
    isAi?: boolean;
    isOfficial?: boolean;
    isCurrentUser?: boolean;
  };
  content: string;
  codeSnippet?: string;
  upvotes: number;
  userVoted?: boolean;
  createdAt: string;
}
