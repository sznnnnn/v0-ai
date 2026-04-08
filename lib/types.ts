// 用户问卷数据类型
export interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  nationality: string;
  targetCountry: string[];
  intendedMajor: string;
  targetDegree: "bachelor" | "master" | "phd" | "";
  targetSemester: string;
}

export interface Education {
  school: string;
  degree: string;
  major: string;
  gpa: string;
  gpaScale: "4.0" | "5.0" | "100" | "";
  startDate: string;
  endDate: string;
  achievements?: string;
}

export interface StandardizedTest {
  toefl?: { total: string; reading: string; listening: string; speaking: string; writing: string };
  ielts?: { overall: string; reading: string; listening: string; speaking: string; writing: string };
  gre?: { verbal: string; quantitative: string; analyticalWriting: string };
  gmat?: { total: string; verbal: string; quantitative: string; integratedReasoning: string; analyticalWriting: string };
}

export interface WorkExperience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  // STAR 法则
  situation: string;
  task: string;
  action: string;
  result: string;
}

export interface ProjectExperience {
  id: string;
  name: string;
  role: string;
  startDate: string;
  endDate: string;
  // STAR 法则
  situation: string;
  task: string;
  action: string;
  result: string;
}

export interface Honor {
  id: string;
  name: string;
  issuer: string;
  date: string;
  description?: string;
}

export interface Skill {
  id: string;
  name: string;
  level: "beginner" | "intermediate" | "advanced" | "expert";
  category: "technical" | "language" | "soft" | "other";
}

export interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: string;
  url?: string;
}

export interface QuestionnaireData {
  personalInfo: PersonalInfo;
  education: Education[];
  tests: StandardizedTest;
  workExperience: WorkExperience[];
  projects: ProjectExperience[];
  honors: Honor[];
  skills: Skill[];
  files: UploadedFile[];
  completedSteps: number[];
  currentStep: number;
  lastUpdated: string;
}

// 学校和项目类型
export interface School {
  id: string;
  name: string;
  nameEn: string;
  country: string;
  city: string;
  ranking: number;
  logo?: string;
  category: "reach" | "match" | "safety"; // 冲刺 | 主申 | 保底
}

export interface Program {
  id: string;
  schoolId: string;
  name: string;
  nameEn: string;
  degree: string;
  department: string;
  duration: string;
  deadline: string;
  applicationFee: string;
  tuition: string;
  requirements: string[];
  description: string;
  matchScore: number;
  matchReasons: string[];
  category: "reach" | "match" | "safety";
}

export interface MatchResult {
  schools: School[];
  programs: Program[];
  generatedAt: string;
}

// 初始问卷数据
export const initialQuestionnaireData: QuestionnaireData = {
  personalInfo: {
    fullName: "",
    email: "",
    phone: "",
    nationality: "",
    targetCountry: [],
    intendedMajor: "",
    targetDegree: "",
    targetSemester: "",
  },
  education: [],
  tests: {},
  workExperience: [],
  projects: [],
  honors: [],
  skills: [],
  files: [],
  completedSteps: [],
  currentStep: 1,
  lastUpdated: new Date().toISOString(),
};
