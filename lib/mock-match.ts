import type { School, Program, MatchResult, QuestionnaireData } from "./types";
import { enrichSchool } from "./school-enrichment";
import { faviconUrlForSchoolId } from "./school-favicon";

// 模拟学校数据库（合并院校介绍文案）
const schoolsDatabase: School[] = ([
  // 冲刺校 (Reach)
  { id: "mit", name: "麻省理工学院", nameEn: "MIT", country: "美国", city: "波士顿", ranking: 1, category: "reach" },
  { id: "stanford", name: "斯坦福大学", nameEn: "Stanford University", country: "美国", city: "斯坦福", ranking: 3, category: "reach" },
  { id: "cmu", name: "卡内基梅隆大学", nameEn: "Carnegie Mellon University", country: "美国", city: "匹兹堡", ranking: 22, category: "reach" },
  { id: "oxford", name: "牛津大学", nameEn: "University of Oxford", country: "英国", city: "牛津", ranking: 4, category: "reach" },
  { id: "cambridge", name: "剑桥大学", nameEn: "University of Cambridge", country: "英国", city: "剑桥", ranking: 5, category: "reach" },
  
  // 主申校 (Match)
  { id: "columbia", name: "哥伦比亚大学", nameEn: "Columbia University", country: "美国", city: "纽约", ranking: 12, category: "match" },
  { id: "duke", name: "杜克大学", nameEn: "Duke University", country: "美国", city: "达勒姆", ranking: 10, category: "match" },
  { id: "nyu", name: "纽约大学", nameEn: "New York University", country: "美国", city: "纽约", ranking: 35, category: "match" },
  { id: "ucl", name: "伦敦大学学院", nameEn: "University College London", country: "英国", city: "伦敦", ranking: 9, category: "match" },
  { id: "imperial", name: "帝国理工学院", nameEn: "Imperial College London", country: "英国", city: "伦敦", ranking: 6, category: "match" },
  { id: "nus", name: "新加坡国立大学", nameEn: "National University of Singapore", country: "新加坡", city: "新加坡", ranking: 11, category: "match" },
  { id: "utoronto", name: "多伦多大学", nameEn: "University of Toronto", country: "加拿大", city: "多伦多", ranking: 21, category: "match" },
  { id: "hku", name: "香港大学", nameEn: "The University of Hong Kong", country: "中国香港", city: "香港", ranking: 26, category: "match" },
  
  // 保底校 (Safety)
  { id: "bu", name: "波士顿大学", nameEn: "Boston University", country: "美国", city: "波士顿", ranking: 93, category: "safety" },
  { id: "usc", name: "南加州大学", nameEn: "University of Southern California", country: "美国", city: "洛杉矶", ranking: 28, category: "safety" },
  { id: "manchester", name: "曼彻斯特大学", nameEn: "University of Manchester", country: "英国", city: "曼彻斯特", ranking: 28, category: "safety" },
  { id: "edinburgh", name: "爱丁堡大学", nameEn: "University of Edinburgh", country: "英国", city: "爱丁堡", ranking: 15, category: "safety" },
  { id: "ubc", name: "不列颠哥伦比亚大学", nameEn: "University of British Columbia", country: "加拿大", city: "温哥华", ranking: 34, category: "safety" },
] as School[])
  .map((s) => ({ ...s, logo: faviconUrlForSchoolId(s.id) ?? s.logo }))
  .map(enrichSchool);

type ProgramSeed = Omit<Program, "matchScore" | "matchReasons" | "curriculumNote">;

function buildCurriculumNote(p: ProgramSeed): string {
  if (p.degree === "MBA") {
    return "核心模块：财务、市场营销、运营管理、战略与领导力；案例教学、小组项目与国际模块。";
  }
  if (p.name.includes("金融") || p.id.includes("mfin") || p.id.includes("mfe")) {
    return "量化方法、衍生品与风险管理、资产定价与金融工程；常含项目或实习学分。";
  }
  if (p.name.includes("数据科学") || p.id.endsWith("-ds")) {
    return "统计学习、机器学习、大数据系统与可视化；毕业设计或行业项目。";
  }
  if (p.name.includes("人工智能") || p.id.includes("ai") || p.name.includes("机器学习")) {
    return "深度学习、概率与统计、NLP/视觉等专题；研究项目与论文环节。";
  }
  if (p.name.includes("计算机") || p.id.includes("-cs") || p.name.includes("计算")) {
    return "算法、计算机系统、软件工程与选修专题；Capstone 或科研训练。";
  }
  return `依托 ${p.department} 培养方案：核心课、选修与实践/论文环节，详见当年课程目录。`;
}

// 模拟项目数据库
const programsDatabaseRaw: ProgramSeed[] = [
  // CS 项目
  { id: "mit-cs", schoolId: "mit", name: "计算机科学硕士", nameEn: "Master of Computer Science", degree: "MS", department: "EECS", duration: "2年", deadline: "2025-12-15", applicationFee: "$75", tuition: "$77,168/年", requirements: ["GRE 330+", "TOEFL 100+", "CS背景"], description: "MIT CS项目是全球顶尖的计算机科学项目", category: "reach" },
  { id: "stanford-cs", schoolId: "stanford", name: "计算机科学硕士", nameEn: "MS in Computer Science", degree: "MS", department: "School of Engineering", duration: "2年", deadline: "2025-12-01", applicationFee: "$125", tuition: "$57,861/年", requirements: ["GRE 325+", "TOEFL 100+", "编程经验"], description: "斯坦福CS项目位于硅谷心脏地带", category: "reach" },
  { id: "cmu-mcs", schoolId: "cmu", name: "计算机科学硕士", nameEn: "Master of Computer Science", degree: "MS", department: "SCS", duration: "1.5年", deadline: "2025-12-15", applicationFee: "$75", tuition: "$50,100/年", requirements: ["GRE 325+", "TOEFL 100+"], description: "CMU CS在AI和系统方向全球领先", category: "reach" },
  { id: "columbia-cs", schoolId: "columbia", name: "计算机科学硕士", nameEn: "MS in Computer Science", degree: "MS", department: "Engineering", duration: "1.5年", deadline: "2025-02-15", applicationFee: "$85", tuition: "$52,000/年", requirements: ["GRE 320+", "TOEFL 100+"], description: "哥大CS项目地处纽约，就业资源丰富", category: "match" },
  { id: "nyu-cs", schoolId: "nyu", name: "计算机科学硕士", nameEn: "MS in Computer Science", degree: "MS", department: "Courant Institute", duration: "2年", deadline: "2025-02-01", applicationFee: "$80", tuition: "$45,000/年", requirements: ["GRE 315+", "TOEFL 90+"], description: "NYU CS项目注重理论与实践结合", category: "match" },
  
  // 数据科学项目
  { id: "mit-ds", schoolId: "mit", name: "数据科学硕士", nameEn: "Master in Data Science", degree: "MS", department: "IDSS", duration: "1年", deadline: "2025-12-15", applicationFee: "$75", tuition: "$77,168/年", requirements: ["GRE 325+", "TOEFL 100+", "统计背景"], description: "MIT数据科学项目跨学科整合", category: "reach" },
  { id: "columbia-ds", schoolId: "columbia", name: "数据科学硕士", nameEn: "MS in Data Science", degree: "MS", department: "DSI", duration: "1.5年", deadline: "2025-02-15", applicationFee: "$85", tuition: "$52,000/年", requirements: ["GRE 320+", "TOEFL 100+"], description: "哥大数据科学项目业界认可度高", category: "match" },
  { id: "duke-ds", schoolId: "duke", name: "数据科学硕士", nameEn: "Master of Data Science", degree: "MS", department: "Pratt School", duration: "1年", deadline: "2025-01-15", applicationFee: "$85", tuition: "$60,000/年", requirements: ["GRE 315+", "TOEFL 90+"], description: "杜克数据科学项目注重实践应用", category: "match" },
  
  // 商科项目
  { id: "mit-mba", schoolId: "mit", name: "工商管理硕士", nameEn: "MBA", degree: "MBA", department: "Sloan", duration: "2年", deadline: "2025-01-10", applicationFee: "$250", tuition: "$80,400/年", requirements: ["GMAT 720+", "TOEFL 105+", "工作经验"], description: "MIT Sloan MBA以科技创业著称", category: "reach" },
  { id: "columbia-mba", schoolId: "columbia", name: "工商管理硕士", nameEn: "MBA", degree: "MBA", department: "CBS", duration: "2年", deadline: "2025-01-05", applicationFee: "$275", tuition: "$82,000/年", requirements: ["GMAT 700+", "TOEFL 100+", "工作经验"], description: "哥大CBS位于纽约金融中心", category: "match" },
  { id: "nyu-mba", schoolId: "nyu", name: "工商管理硕士", nameEn: "MBA", degree: "MBA", department: "Stern", duration: "2年", deadline: "2025-01-15", applicationFee: "$250", tuition: "$76,000/年", requirements: ["GMAT 680+", "TOEFL 100+"], description: "NYU Stern以金融和市场营销闻名", category: "match" },
  
  // 金融项目
  { id: "mit-mfin", schoolId: "mit", name: "金融硕士", nameEn: "Master of Finance", degree: "MS", department: "Sloan", duration: "1年", deadline: "2025-01-10", applicationFee: "$150", tuition: "$85,000/年", requirements: ["GMAT 700+", "TOEFL 100+"], description: "MIT MFin注重量化金融", category: "reach" },
  { id: "columbia-mfe", schoolId: "columbia", name: "金融工程硕士", nameEn: "MS in Financial Engineering", degree: "MS", department: "IEOR", duration: "1年", deadline: "2025-02-15", applicationFee: "$85", tuition: "$52,000/年", requirements: ["GRE 325+", "TOEFL 100+"], description: "哥大金融工程项目华尔街就业率高", category: "match" },
  
  // 英国项目
  { id: "oxford-cs", schoolId: "oxford", name: "计算机科学硕士", nameEn: "MSc Computer Science", degree: "MSc", department: "CS", duration: "1年", deadline: "2025-01-15", applicationFee: "£75", tuition: "£34,250/年", requirements: ["IELTS 7.5+", "CS背景"], description: "牛津CS项目历史悠久", category: "reach" },
  { id: "cambridge-ml", schoolId: "cambridge", name: "机器学习硕士", nameEn: "MPhil in Machine Learning", degree: "MPhil", department: "Engineering", duration: "1年", deadline: "2025-12-01", applicationFee: "£75", tuition: "£33,000/年", requirements: ["IELTS 7.0+", "数学背景"], description: "剑桥机器学习项目研究导向", category: "reach" },
  { id: "ucl-ds", schoolId: "ucl", name: "数据科学硕士", nameEn: "MSc Data Science", degree: "MSc", department: "CS", duration: "1年", deadline: "2025-03-01", applicationFee: "£90", tuition: "£35,000/年", requirements: ["IELTS 7.0+", "数学背景"], description: "UCL数据科学项目实用性强", category: "match" },
  { id: "imperial-ml", schoolId: "imperial", name: "机器学习硕士", nameEn: "MSc Machine Learning", degree: "MSc", department: "Computing", duration: "1年", deadline: "2025-01-15", applicationFee: "£80", tuition: "£38,000/年", requirements: ["IELTS 7.0+"], description: "帝国理工ML项目业界认可度高", category: "match" },
  
  // 其他地区
  { id: "nus-cs", schoolId: "nus", name: "计算机科学硕士", nameEn: "Master of Computing", degree: "MS", department: "SoC", duration: "1.5年", deadline: "2025-03-15", applicationFee: "S$50", tuition: "S$45,000/年", requirements: ["TOEFL 90+", "CS背景"], description: "NUS CS是亚洲顶尖项目", category: "match" },
  { id: "hku-cs", schoolId: "hku", name: "计算机科学硕士", nameEn: "MSc in Computer Science", degree: "MSc", department: "CS", duration: "1年", deadline: "2025-04-30", applicationFee: "HK$300", tuition: "HK$168,000/年", requirements: ["IELTS 6.0+"], description: "港大CS性价比高", category: "match" },
  { id: "utoronto-cs", schoolId: "utoronto", name: "计算机科学硕士", nameEn: "MSc in Computer Science", degree: "MSc", department: "CS", duration: "2年", deadline: "2025-01-15", applicationFee: "C$125", tuition: "C$25,000/年", requirements: ["TOEFL 93+"], description: "多大CS在AI领域领先", category: "match" },
  
  // 保底项目
  { id: "bu-cs", schoolId: "bu", name: "计算机科学硕士", nameEn: "MS in Computer Science", degree: "MS", department: "CAS", duration: "1.5年", deadline: "2025-04-01", applicationFee: "$80", tuition: "$28,000/学期", requirements: ["GRE 310+", "TOEFL 84+"], description: "波士顿大学CS就业率高", category: "safety" },
  { id: "usc-cs", schoolId: "usc", name: "计算机科学硕士", nameEn: "MS in Computer Science", degree: "MS", department: "Viterbi", duration: "2年", deadline: "2025-01-15", applicationFee: "$90", tuition: "$62,000/年", requirements: ["GRE 315+", "TOEFL 90+"], description: "USC CS位于洛杉矶，科技公司众多", category: "safety" },
  { id: "manchester-ds", schoolId: "manchester", name: "数据科学硕士", nameEn: "MSc Data Science", degree: "MSc", department: "CS", duration: "1年", deadline: "2025-06-30", applicationFee: "£60", tuition: "£29,500/年", requirements: ["IELTS 6.5+"], description: "曼大数据科学项目实用导向", category: "safety" },
  { id: "edinburgh-ai", schoolId: "edinburgh", name: "人工智能硕士", nameEn: "MSc Artificial Intelligence", degree: "MSc", department: "Informatics", duration: "1年", deadline: "2025-04-01", applicationFee: "£60", tuition: "£36,000/年", requirements: ["IELTS 6.5+"], description: "爱丁堡大学AI历史悠久", category: "safety" },
  { id: "ubc-cs", schoolId: "ubc", name: "计算机科学硕士", nameEn: "MSc in Computer Science", degree: "MSc", department: "CS", duration: "2年", deadline: "2025-01-15", applicationFee: "C$110", tuition: "C$9,000/年", requirements: ["TOEFL 90+"], description: "UBC CS性价比极高", category: "safety" },
];

const programsDatabase: Omit<Program, "matchScore" | "matchReasons">[] = programsDatabaseRaw.map((p) => ({
  ...p,
  curriculumNote: buildCurriculumNote(p),
}));

const countryMapping: Record<string, string> = {
  us: "美国",
  uk: "英国",
  ca: "加拿大",
  au: "澳大利亚",
  sg: "新加坡",
  hk: "中国香港",
  de: "德国",
  jp: "日本",
};

const majorKeywordMapping: Array<{ keywords: string[]; programTags: string[] }> = [
  { keywords: ["计算机", "cs", "computer"], programTags: ["cs", "ml", "ai"] },
  { keywords: ["数据", "data"], programTags: ["ds", "ml", "cs"] },
  { keywords: ["人工智能", "ai", "machine learning", "机器学习"], programTags: ["ml", "ai", "cs"] },
  { keywords: ["金融", "finance", "fin"], programTags: ["mfin", "mfe", "mba"] },
  { keywords: ["商业", "business", "mba"], programTags: ["mba", "ds"] },
  { keywords: ["市场", "marketing"], programTags: ["mba"] },
];

function getProgramTagsByMajor(major: string): string[] {
  const lowerMajor = major.toLowerCase();
  const matched = majorKeywordMapping
    .filter((item) => item.keywords.some((keyword) => lowerMajor.includes(keyword)))
    .flatMap((item) => item.programTags);
  return [...new Set(matched.length > 0 ? matched : ["cs"])];
}

function firstYearInText(text: string): number | null {
  const m = text.match(/(\d+(?:\.\d+)?)\s*年?/);
  if (!m) return null;
  const n = parseFloat(m[1]);
  return Number.isFinite(n) ? n : null;
}

/** 从自由填写的成绩文本推断档位（演示用） */
function inferEducationGradeTier(raw: string): "high" | "mid" | null {
  const text = raw.trim();
  if (!text) return null;
  const looksPercent = /%|百分|均分|百分之/.test(text);
  const firstNum = text.match(/(\d+(?:\.\d+)?)/);
  if (!firstNum) return null;
  const v = parseFloat(firstNum[1]);
  if (!Number.isFinite(v)) return null;

  if (looksPercent || v > 10) {
    if (v >= 90) return "high";
    if (v >= 82) return "mid";
    return null;
  }

  const slash = text.match(/(\d+(?:\.\d+)?)\s*\/\s*(4(?:\.0)?|5(?:\.0)?)/i);
  if (slash) {
    const num = parseFloat(slash[1]);
    const denom = /^4/i.test(slash[2]) ? 4 : 5;
    const onFour = denom === 4 ? num : (num / 5) * 4;
    if (onFour >= 3.8) return "high";
    if (onFour >= 3.5) return "mid";
    return null;
  }

  if (v <= 5.5) {
    const onFour = v > 4.5 ? (v / 5) * 4 : v;
    if (onFour >= 3.8) return "high";
    if (onFour >= 3.5) return "mid";
  }
  return null;
}

function pickByCategory(schools: School[], category: School["category"], count: number): School[] {
  return schools
    .filter((school) => school.category === category)
    .sort((a, b) => a.ranking - b.ranking)
    .slice(0, count);
}

/** 用户填写的意向院校拆成多条 */
function splitKnownSchoolInput(raw: string): string[] {
  return raw
    .split(/[\n、,，;；|]+/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 2);
}

function schoolMatchesUserHint(school: School, hint: string): boolean {
  const h = hint.trim().toLowerCase();
  if (h.length < 2) return false;
  if (school.id === h) return true;
  const cn = school.name.toLowerCase();
  const en = school.nameEn.toLowerCase();
  return cn.includes(h) || en.includes(h);
}

/** 按填写顺序解析出在模拟库中可识别的学校（每条约取首个匹配） */
function resolveKnownTargetSchools(raw: string): School[] {
  const hints = splitKnownSchoolInput(raw);
  const out: School[] = [];
  const seen = new Set<string>();
  for (const hint of hints) {
    const found = schoolsDatabase.find((s) => schoolMatchesUserHint(s, hint));
    if (found && !seen.has(found.id)) {
      seen.add(found.id);
      out.push(found);
    }
  }
  return out;
}

/** 用问卷里的本科/教育块与目标方向拼首条说明，不写申请批次类建议 */
function buildProfileMatchHint(userData: QuestionnaireData): string | null {
  const p = userData.personalInfo;
  const edu0 = userData.education[0];
  const school = edu0?.school?.trim();
  const eduMajor = edu0?.major?.trim();
  const intended =
    p.intendedMajor?.trim() || p.intendedApplicationField?.trim();

  const undergradParts = [school, eduMajor].filter(Boolean);
  const research = p.researchInterestNote?.trim();
  const motivation = p.motivationNote?.trim();
  const knownSchoolsRaw = p.knownTargetSchools?.trim();

  const hasEduLine = undergradParts.length > 0 || !!intended;
  const hasSupplement = !!(research || motivation || knownSchoolsRaw);
  if (!hasEduLine && !hasSupplement) return null;

  let s = "";
  if (hasEduLine) {
    s = "已根据你在问卷里填写的基础信息";
    if (undergradParts.length > 0) {
      s += `：${undergradParts.join(" · ")}`;
    }
    if (intended) {
      s += undergradParts.length > 0 ? `；目标方向为「${intended}」` : `：目标方向为「${intended}」`;
    }
  } else {
    s = "已结合你在问卷中提供的补充信息";
  }
  const extras: string[] = [];
  if (research) {
    extras.push(
      research.length > 40 ? `研究兴趣：${research.slice(0, 40)}…` : `研究兴趣：${research}`
    );
  }
  if (motivation) {
    extras.push(
      motivation.length > 32 ? `动机：${motivation.slice(0, 32)}…` : `动机：${motivation}`
    );
  }
  if (extras.length > 0) {
    s += `（${extras.join("；")}）`;
  }
  if (knownSchoolsRaw) {
    const resolved = resolveKnownTargetSchools(knownSchoolsRaw);
    if (resolved.length > 0) {
      s += `（意向院校已对齐库内：${resolved.map((x) => x.nameEn).join("、")}）`;
    } else {
      const short =
        knownSchoolsRaw.length > 36 ? `${knownSchoolsRaw.slice(0, 36)}…` : knownSchoolsRaw;
      s += `（已记录意向院校：${short}）`;
    }
  }
  s += "，并据此筛选项目";
  return s;
}

function normalizeDefaultPsKeywords(defaultPs: string | null | undefined): string[] {
  if (!defaultPs) return [];
  const text = defaultPs.toLowerCase();
  const pairs: Array<{ keywords: string[]; tag: string }> = [
    { keywords: ["computer", "计算机", "cs", "软件", "algorithm"], tag: "cs" },
    { keywords: ["data", "数据", "analytics", "统计"], tag: "ds" },
    { keywords: ["ai", "人工智能", "machine learning", "ml", "deep learning"], tag: "ai" },
    { keywords: ["machine learning", "ml", "深度学习"], tag: "ml" },
    { keywords: ["finance", "金融", "asset", "quant"], tag: "mfin" },
    { keywords: ["financial engineering", "金融工程", "derivative"], tag: "mfe" },
    { keywords: ["mba", "business", "管理", "strategy"], tag: "mba" },
  ];
  const tags = pairs
    .filter((p) => p.keywords.some((k) => text.includes(k)))
    .map((p) => p.tag);
  return [...new Set(tags)];
}

// 根据用户背景生成匹配结果
export function generateMatchResult(
  userData: QuestionnaireData,
  opts?: { defaultPs?: string | null }
): MatchResult {
  const targetCountries = userData.personalInfo.targetCountry || [];
  const intendedMajor = userData.personalInfo.intendedMajor || "";
  const intendedField = userData.personalInfo.intendedApplicationField || "";
  const budgetEstimate = userData.personalInfo.budgetEstimate || "";
  const plannedStudyDuration = userData.personalInfo.plannedStudyDuration || "";

  const countryCodes = targetCountries.filter((c) => c !== "undecided");
  const targetCountryNames = countryCodes.map((c) => countryMapping[c] || c);
  const majorSearchText = [intendedMajor, intendedField].filter(Boolean).join(" ");
  const relevantProgramTypes = getProgramTagsByMajor(majorSearchText);
  const defaultPsTags = normalizeDefaultPsKeywords(opts?.defaultPs);
  const mergedProgramTypes = [...new Set([...relevantProgramTypes, ...defaultPsTags])];

  // 根据国家偏好筛选学校，若为空则回退到全量
  const countryMatchedSchools = schoolsDatabase.filter((school) =>
    targetCountryNames.length === 0 || targetCountryNames.includes(school.country)
  );
  const schoolPool = countryMatchedSchools.length > 0 ? countryMatchedSchools : schoolsDatabase;

  // 目标档位：冲刺2 + 主申4 + 保底2
  let selectedSchools = [
    ...pickByCategory(schoolPool, "reach", 2),
    ...pickByCategory(schoolPool, "match", 4),
    ...pickByCategory(schoolPool, "safety", 2),
  ];

  const userKnownSchools = resolveKnownTargetSchools(userData.personalInfo.knownTargetSchools || "");
  if (userKnownSchools.length > 0) {
    const hintedIds = new Set(userKnownSchools.map((s) => s.id));
    const rest = selectedSchools.filter((s) => !hintedIds.has(s.id));
    selectedSchools = [...userKnownSchools, ...rest].slice(0, 8);
  }

  // 若按国家筛选导致档位不足，补齐到总量 8 所
  if (selectedSchools.length < 8) {
    const selectedIds = new Set(selectedSchools.map((s) => s.id));
    const fallbackSchools = schoolsDatabase
      .filter((s) => !selectedIds.has(s.id))
      .sort((a, b) => a.ranking - b.ranking)
      .slice(0, 8 - selectedSchools.length);
    selectedSchools = [...selectedSchools, ...fallbackSchools];
  }

  const selectedSchoolIds = selectedSchools.map((s) => s.id);

  // 优先按专业关键词匹配项目
  let filteredPrograms = programsDatabase.filter((program) => {
    if (!selectedSchoolIds.includes(program.schoolId)) return false;
    const majorMatched = mergedProgramTypes.some((type) => program.id.includes(type));
    return majorMatched;
  });

  // 仍不足时放宽为学校范围内全量
  if (filteredPrograms.length < 12) {
    filteredPrograms = programsDatabase.filter((program) => selectedSchoolIds.includes(program.schoolId));
  }

  // 限制 12-15 个项目
  filteredPrograms = filteredPrograms
    .sort((a, b) => {
      const schoolA = selectedSchools.find((s) => s.id === a.schoolId)?.ranking || 999;
      const schoolB = selectedSchools.find((s) => s.id === b.schoolId)?.ranking || 999;
      return schoolA - schoolB;
    })
    .slice(0, 15);

  // 添加匹配分数和原因
  const profileHint = buildProfileMatchHint(userData);
  const hintedSchoolIdSet = new Set(userKnownSchools.map((s) => s.id));

  const programs: Program[] = filteredPrograms.map((program) => {
    const school = selectedSchools.find((s) => s.id === program.schoolId);
    let matchScore = 75;
    const matchReasons: string[] = [];
    if (profileHint) {
      matchReasons.push(profileHint);
    }

    if (hintedSchoolIdSet.has(program.schoolId)) {
      matchScore += 4;
      matchReasons.push("你已在问卷中填写该校为意向院校");
    }

    // 根据背景调整分数
    if (userData.education.length > 0) {
      const tier = inferEducationGradeTier(userData.education[0]?.gpa || "");
      if (tier === "high") {
        matchScore += 10;
        matchReasons.push("成绩表现突出，符合项目要求");
      } else if (tier === "mid") {
        matchScore += 5;
        matchReasons.push("成绩良好");
      }
    }
    
    if (userData.workExperience.length > 0) {
      matchScore += 5;
      matchReasons.push(`${userData.workExperience.length}段工作经历`);
    }
    
    if (userData.projects.length > 0) {
      matchScore += 5;
      matchReasons.push(`${userData.projects.length}个项目经历`);
    }
    
    if (userData.honors.length > 0) {
      matchScore += 3;
      matchReasons.push(`${userData.honors.length}项荣誉奖项`);
    }

    if (targetCountryNames.includes(school?.country || "")) {
      matchScore += 4;
      matchReasons.push("符合目标国家/地区偏好");
    }

    if (intendedMajor || intendedField) {
      const majorHit = relevantProgramTypes.some((type) => program.id.includes(type));
      if (majorHit) {
        matchScore += 4;
        matchReasons.push("专业方向匹配度高");
      }
    }
    if (defaultPsTags.length > 0) {
      const defaultPsHit = defaultPsTags.some((type) => program.id.includes(type));
      if (defaultPsHit) {
        matchScore += 3;
        matchReasons.push("已参考默认文书中的方向偏好");
      }
    }

    if (budgetEstimate) {
      matchReasons.push(`预算参考：${budgetEstimate}`);
    }

    const userYears = firstYearInText(plannedStudyDuration);
    const programYears = firstYearInText(program.duration);
    if (userYears != null && programYears != null && Math.abs(userYears - programYears) < 0.01) {
      matchScore += 2;
      matchReasons.push("项目学制与期望接近");
    } else if (plannedStudyDuration && /不限|flex|any/i.test(plannedStudyDuration)) {
      matchReasons.push("学制偏好较灵活");
    }

    // 根据学校类别调整
    if (school?.category === "reach") {
      matchScore -= 10;
      matchReasons.push("冲刺校，竞争激烈");
    } else if (school?.category === "safety") {
      matchScore += 10;
      matchReasons.push("保底校，录取把握较大");
    }
    
    matchScore = Math.min(98, Math.max(50, matchScore));
    
    return {
      ...program,
      matchScore,
      matchReasons,
    };
  });
  
  return {
    schools: selectedSchools,
    programs,
    generatedAt: new Date().toISOString(),
  };
}
