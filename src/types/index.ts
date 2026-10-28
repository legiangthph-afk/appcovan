export type TeamId = number;

export type StudentRole = 'Tổ trưởng' | 'Tổ phó' | 'Thành viên';

export type AttendanceStatus = 'present' | 'late' | 'excused' | 'unexcused';

export interface Student {
  id: string; // HS01 -> HS40
  name: string;
  gender: 'nam' | 'nu';
  teamId: TeamId;
  role: StudentRole;
  stars: number;
  weeklyStars: number;
  monthlyStars: number;
  attendance: AttendanceStatus;
  badges: string[];
  notes?: string;
}

export interface Team {
  id: TeamId;
  name: string;
  slogan: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  totalStars: number;
}

export interface StarTransaction {
  id: string;
  studentId: string;
  studentName: string;
  teamId: TeamId;
  delta: number;
  reason: string;
  category: string;
  timestamp: string;
  performer: string;
  undone?: boolean;
}

export interface TitleAward {
  id: string;
  studentId: string;
  studentName: string;
  teamId: TeamId;
  title: string;
  icon: string;
  date: string;
  citation: string;
  teacherSignature: string;
}

export interface QuizQuestion {
  id: string;
  subject: string;
  topic: string;
  gradeLevel: number;
  difficulty: 'Cơ bản' | 'Vận dụng' | 'Nâng cao';
  question: string;
  options: string[];
  correctAnswer: string | number;
  explanation: string;
  type?: 'multiple_choice' | 'true_false' | 'matching' | 'fill_blank';
  pairA?: string[];
  pairB?: string[];
}

export interface DifferentiatedTier {
  tierName: string;
  tierDescription: string;
  questions: {
    id: string;
    question: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
  }[];
}

export interface DifferentiatedQuiz {
  id: string;
  subject: string;
  topic: string;
  objective: string;
  createdAt: string;
  tiers: DifferentiatedTier[];
}

export interface KnowledgeDoc {
  id: string;
  subject: string;
  title: string;
  content: string;
  source: string;
  tags: string[];
}

export interface ShopItem {
  id: string;
  title: string;
  starsRequired: number;
  icon: string;
  description: string;
  stock: number;
}

export interface DiaryEntry {
  id: string;
  date: string;
  title: string;
  content: string;
  mood: 'Vui vẻ' | 'Tích cực' | 'Cần lưu ý' | 'Tự hào';
  category: 'Nề nếp' | 'Học tập' | 'Khen thưởng' | 'Ý tưởng mới';
}
