// Types for DevElevate AI Platform

// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: Date;
  provider?: 'email' | 'google' | 'github';
}

// Interview Module Types
export interface InterviewQuestion {
  id: string;
  role: string;
  question: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface InterviewFeedback {
  clarityScore: number;
  technicalDepthScore: number;
  missingConcepts: string[];
  suggestedAnswer: string;
  overallFeedback: string;
}

export interface InterviewSession {
  id: string;
  role: string;
  question: string;
  userAnswer: string;
  feedback: InterviewFeedback;
  timestamp: Date;
}

// Code Review Room Types
export interface CodeRoom {
  id: string;
  name: string;
  code: string;
  language: string;
  participants: Participant[];
  comments: CodeComment[];
  activityLog: ActivityLogEntry[];
  status: 'active' | 'approved' | 'changes-requested';
  createdAt: Date;
}

export interface Participant {
  id: string;
  name: string;
  color: string;
  cursorPosition?: { line: number; column: number };
  isOnline: boolean;
}

export interface CodeComment {
  id: string;
  lineNumber: number;
  content: string;
  author: string;
  timestamp: Date;
}

export interface ActivityLogEntry {
  id: string;
  type: 'join' | 'leave' | 'code-update' | 'comment' | 'approve' | 'request-changes';
  user: string;
  message: string;
  timestamp: Date;
}

// Resume Analyzer Types
export interface ResumeAnalysis {
  id: string;
  fileName: string;
  atsScore: number;
  missingKeywords: string[];
  skillGaps: string[];
  improvements: string[];
  careerPath: CareerPath;
  strengths: string[];
  timestamp: Date;
}

export interface CareerPath {
  recommended: string;
  roadmap: RoadmapStep[];
}

export interface RoadmapStep {
  step: number;
  title: string;
  skills: string[];
  duration: string;
}

// Productivity Tracker Types
export interface DailyLog {
  id: string;
  userId?: string;
  date: string;
  codingTime: number; // in minutes
  dsaPractice: number; // problems solved
  studyHours: number;
  githubCommits: number;
  notes?: string;
}

export interface WeeklyStats {
  week: string;
  totalCodingTime: number;
  totalDsaProblems: number;
  totalStudyHours: number;
  totalCommits: number;
}

export interface ProductivityInsights {
  currentStreak: number;
  longestStreak: number;
  averageDailyCoding: number;
  mostProductiveDay: string;
  weeklyTrend: 'improving' | 'stable' | 'declining';
}

// Navigation Types
export type NavItem = {
  id: string;
  label: string;
  icon: string;
  path: string;
};
