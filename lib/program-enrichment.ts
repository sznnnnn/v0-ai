import type { Program, School } from "./types";

export type ProgramEnrichment = {
  orientation: string;
  highlights: string[];
  curriculum: string[];
  applicationChecklist: string[];
  timeline: string[];
  careerPaths: string[];
  links: Array<{ label: string; url: string }>;
};

const PROGRAM_ENRICHMENT_MAP: Record<string, Partial<ProgramEnrichment>> = {
  "utoronto-cs": {
    orientation:
      "研究导向，建议尽早联系导师。",
    highlights: ["CV/ML 活跃", "与 Vector Institute 关联强", "重视复现与写作"],
    curriculum: ["Advanced Algorithms", "Machine Learning", "Computer Vision", "Distributed Systems", "Research Seminar"],
    careerPaths: ["算法工程师", "Research Engineer", "软件工程师（平台/基础设施）", "博士项目继续深造"],
    links: [{ label: "UofT CS Graduate Programs", url: "https://web.cs.toronto.edu/graduate" }],
  },
  "mit-mfin": {
    orientation:
      "节奏快，量化导向明显。",
    highlights: ["可选 12/18 个月", "行业项目多", "重视数理与编程"],
    curriculum: ["Asset Pricing", "Financial Engineering", "Machine Learning in Finance", "Derivatives", "Risk Analytics"],
    careerPaths: ["Quant Analyst", "Risk Analyst", "Strats", "资产管理/投研"],
    links: [{ label: "MIT Sloan MFin", url: "https://mitsloan.mit.edu/master-of-finance" }],
  },
};

function inferCurriculum(program: Program) {
  if (program.id.includes("cs")) return ["算法与系统", "软件工程", "分布式/云计算", "AI/ML 选修", "Capstone/论文"];
  if (program.id.includes("ds")) return ["统计学习", "机器学习", "数据工程", "可视化", "行业项目"];
  if (program.id.includes("mba")) return ["战略管理", "公司金融", "市场营销", "组织与领导力", "实战咨询项目"];
  if (program.id.includes("mfin") || program.id.includes("mfe"))
    return ["资产定价", "衍生品", "风险管理", "量化交易", "金融数据建模"];
  return ["核心必修", "方向选修", "实践项目", "毕业汇报"];
}

function inferCareer(program: Program) {
  if (program.id.includes("cs") || program.id.includes("ai")) return ["软件工程师", "算法工程师", "ML Engineer", "技术产品岗位"];
  if (program.id.includes("ds")) return ["Data Scientist", "Data Analyst", "MLE", "BI / 决策分析"];
  if (program.id.includes("mba")) return ["咨询", "产品经理", "运营管理", "投融资与战略岗位"];
  if (program.id.includes("mfin") || program.id.includes("mfe")) return ["量化分析", "风控", "交易支持", "资管投研"];
  return ["行业岗位", "研究岗位", "继续深造"];
}

function inferChecklist(program: Program) {
  return [
    "网申表",
    "成绩单（中/英）",
    "个人陈述",
    "推荐信（2-3 封）",
    ...program.requirements,
  ];
}

function inferTimeline(program: Program) {
  return [
    "提前 3-4 个月准备文书",
    "提前 2-3 个月完成标化",
    `截止前 1-2 周提交（${program.deadline}）`,
    "提交后跟进补件",
  ];
}

function inferLinks(program: Program, school: School): Array<{ label: string; url: string }> {
  if (PROGRAM_ENRICHMENT_MAP[program.id]?.links) {
    return PROGRAM_ENRICHMENT_MAP[program.id].links ?? [];
  }
  const q = encodeURIComponent(`${school.nameEn} ${program.nameEn} official`);
  return [{ label: "官方信息", url: `https://www.google.com/search?q=${q}` }];
}

export function getProgramEnrichment(program: Program, school: School): ProgramEnrichment {
  const custom = PROGRAM_ENRICHMENT_MAP[program.id] ?? {};
  return {
    orientation:
      custom.orientation ??
      `${program.department} 体系，课程与项目并重。`,
    highlights: custom.highlights ?? ["已按背景匹配", "请核对当年要求", "建议尽早准备"],
    curriculum: custom.curriculum ?? inferCurriculum(program),
    applicationChecklist: custom.applicationChecklist ?? inferChecklist(program),
    timeline: custom.timeline ?? inferTimeline(program),
    careerPaths: custom.careerPaths ?? inferCareer(program),
    links: inferLinks(program, school),
  };
}

