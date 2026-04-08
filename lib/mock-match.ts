import type { School, Program, MatchResult, QuestionnaireData } from "./types";

// 模拟学校数据库
const schoolsDatabase: School[] = [
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
];

// 模拟项目数据库
const programsDatabase: Omit<Program, "matchScore" | "matchReasons">[] = [
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

// 根据用户背景生成匹配结果
export function generateMatchResult(userData: QuestionnaireData): MatchResult {
  const targetCountries = userData.personalInfo.targetCountry || [];
  const intendedMajor = userData.personalInfo.intendedMajor || "";
  
  // 筛选符合目标国家的学校
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
  
  const targetCountryNames = targetCountries.map((c) => countryMapping[c] || c);
  
  // 根据专业筛选项目
  const majorMapping: Record<string, string[]> = {
    "计算机科学": ["cs", "ml", "ai"],
    "数据科学": ["ds", "ml", "cs"],
    "人工智能": ["ml", "ai", "cs"],
    "金融": ["mfin", "mfe", "mba"],
    "商业分析": ["ds", "mba"],
    "市场营销": ["mba"],
  };
  
  const relevantProgramTypes = majorMapping[intendedMajor] || ["cs"];
  
  // 筛选学校
  let filteredSchools = schoolsDatabase.filter((school) =>
    targetCountryNames.length === 0 || targetCountryNames.includes(school.country)
  );
  
  // 确保有足够的学校：冲刺2 + 主申3-4 + 保底2
  const reachSchools = filteredSchools.filter((s) => s.category === "reach").slice(0, 2);
  const matchSchools = filteredSchools.filter((s) => s.category === "match").slice(0, 4);
  const safetySchools = filteredSchools.filter((s) => s.category === "safety").slice(0, 2);
  
  const selectedSchools = [...reachSchools, ...matchSchools, ...safetySchools];
  const selectedSchoolIds = selectedSchools.map((s) => s.id);
  
  // 筛选项目
  let filteredPrograms = programsDatabase.filter((program) =>
    selectedSchoolIds.includes(program.schoolId) &&
    relevantProgramTypes.some((type) => program.id.includes(type))
  );
  
  // 如果项目不够，放宽条件
  if (filteredPrograms.length < 12) {
    filteredPrograms = programsDatabase.filter((program) =>
      selectedSchoolIds.includes(program.schoolId)
    );
  }
  
  // 限制12-15个项目
  filteredPrograms = filteredPrograms.slice(0, 15);
  
  // 添加匹配分数和原因
  const programs: Program[] = filteredPrograms.map((program) => {
    const school = selectedSchools.find((s) => s.id === program.schoolId);
    let matchScore = 75;
    const matchReasons: string[] = [];
    
    // 根据背景调整分数
    if (userData.education.length > 0) {
      const gpa = parseFloat(userData.education[0]?.gpa || "0");
      if (gpa >= 3.8) {
        matchScore += 10;
        matchReasons.push("GPA优秀，符合项目要求");
      } else if (gpa >= 3.5) {
        matchScore += 5;
        matchReasons.push("GPA良好");
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
