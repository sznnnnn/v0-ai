import type { ParagraphBindingCard } from "@/lib/document-drafts";
import type { QuestionnaireData, Program, School } from "@/lib/types";

export type BackgroundMaterial = {
  id: string;
  title: string;
  detail: string;
};

export type ProgramSignalOption = {
  id: string;
  text: string;
};

export function normalizeLine(text: string, max = 120): string {
  const t = text.replace(/\s+/g, " ").trim();
  if (!t) return "";
  return t.length > max ? `${t.slice(0, max - 1)}...` : t;
}

export function pickBackgroundMaterials(q: QuestionnaireData): BackgroundMaterial[] {
  const out: BackgroundMaterial[] = [];
  if (q.personalInfo.motivationNote.trim()) {
    out.push({ id: "motivation", title: "申请动机", detail: q.personalInfo.motivationNote.trim() });
  }
  if (q.personalInfo.researchInterestNote.trim()) {
    out.push({ id: "research", title: "研究兴趣", detail: q.personalInfo.researchInterestNote.trim() });
  }
  q.education.slice(0, 3).forEach((e, i) => {
    const detail = [e.school, e.major, e.degree].filter(Boolean).join(" · ");
    if (detail) out.push({ id: `edu_${i}`, title: `教育经历 ${i + 1}`, detail });
  });
  q.workExperience.slice(0, 3).forEach((w, i) => {
    const detail = [w.company, w.position, w.result].filter(Boolean).join(" · ");
    if (detail) out.push({ id: `work_${i}`, title: `实习/工作 ${i + 1}`, detail });
  });
  q.projects.slice(0, 3).forEach((p, i) => {
    const detail = [p.name, p.role, p.result].filter(Boolean).join(" · ");
    if (detail) out.push({ id: `project_${i}`, title: `项目经历 ${i + 1}`, detail });
  });
  return out;
}

export function buildProgramSignalOptions(pair: { program: Program; school: School }): ProgramSignalOption[] {
  const { program, school } = pair;
  const out: ProgramSignalOption[] = [];
  if (program.curriculumNote?.trim()) out.push({ id: "signal_curriculum", text: `课程方向：${normalizeLine(program.curriculumNote, 80)}` });
  if (program.department?.trim()) out.push({ id: "signal_department", text: `院系定位：${program.department.trim()}` });
  if (program.description?.trim()) out.push({ id: "signal_description", text: `项目特点：${normalizeLine(program.description, 80)}` });
  if (school.campusStyle?.trim()) out.push({ id: "signal_campus", text: `培养氛围：${normalizeLine(school.campusStyle, 80)}` });
  if (school.studentLife?.trim()) out.push({ id: "signal_community", text: `社群资源：${normalizeLine(school.studentLife, 80)}` });
  return out.slice(0, 6);
}

export function recommendProjectSignalIds(
  signalOptions: ProgramSignalOption[],
  matchReasons: string[]
): string[] {
  if (signalOptions.length === 0) return [];
  const reasonText = matchReasons.join(" ").toLowerCase();
  const weighted = signalOptions.map((s, idx) => {
    let score = 0;
    if (s.id === "signal_curriculum") score += 4;
    if (s.id === "signal_department") score += 3;
    if (s.id === "signal_description") score += 2;
    if (reasonText && s.text.toLowerCase().split(/[：\s]+/).some((t) => t.length > 1 && reasonText.includes(t))) {
      score += 3;
    }
    score += Math.max(0, 1 - idx * 0.1);
    return { id: s.id, score };
  });
  return weighted
    .sort((a, b) => b.score - a.score)
    .slice(0, Math.min(2, signalOptions.length))
    .map((v) => v.id);
}

function tokenizeText(text: string): string[] {
  return (text.toLowerCase().match(/[a-z]{3,}/g) ?? []).slice(0, 80);
}

export function recommendMaterialIds(
  materials: BackgroundMaterial[],
  signals: ProgramSignalOption[],
  reasons: string[]
): string[] {
  const bag = tokenizeText(signals.map((s) => s.text).join(" ")).concat(tokenizeText(reasons.join(" ")));
  return materials
    .map((m) => {
      const text = `${m.title} ${m.detail}`.toLowerCase();
      const score = bag.reduce((acc, kw) => (text.includes(kw) ? acc + 1 : acc), 0);
      return { id: m.id, score };
    })
    .sort((a, b) => b.score - a.score)
    .filter((v) => v.score > 0)
    .slice(0, 5)
    .map((v) => v.id);
}

export function buildParagraphCards(
  selectedMaterialIds: string[],
  selectedSignalIds: string[],
  materials: BackgroundMaterial[],
  signals: ProgramSignalOption[]
): ParagraphBindingCard[] {
  const selected = materials.filter((m) => selectedMaterialIds.includes(m.id));
  const signalText = signals
    .filter((s) => selectedSignalIds.includes(s.id))
    .map((s) => s.text)
    .join("；");
  const cards = [
    { id: "motivation", title: "动机与目标" },
    { id: "preparation", title: "准备度与经历" },
    { id: "fit", title: "项目契合与贡献" },
  ];
  return cards.map((card, idx) => {
    const mat = selected[idx % Math.max(selected.length, 1)];
    const base = mat ? `${mat.title}：${normalizeLine(mat.detail, 150)}` : "待补充素材。";
    const aiDraft = `${base}${signalText ? ` 重点呼应：${normalizeLine(signalText, 120)}` : ""}`;
    return {
      id: card.id,
      title: card.title,
      targetRequirementIds: selectedSignalIds,
      materialIds: mat ? [mat.id] : [],
      aiDraft,
      editedDraft: aiDraft,
    };
  });
}

export type NarrativeQuestionId =
  | "who_and_opening"
  | "experience_shaping"
  | "domain_understanding"
  | "program_fit"
  | "future_plan";

export function buildNarrativeOptions(
  q: QuestionnaireData,
  pair: { program: Program; school: School } | null
): Record<NarrativeQuestionId, string[]> {
  const educationTop = q.education[0]
    ? `${q.education[0].school} 的 ${q.education[0].major} 学习经历`
    : "你的学术训练经历";
  const projectTop = q.projects[0]
    ? `${q.projects[0].name}（${q.projects[0].role || "核心参与"}）`
    : "你最能代表能力的项目";
  const workTop = q.workExperience[0]
    ? `${q.workExperience[0].company} 的 ${q.workExperience[0].position}`
    : "你的实习/协作经历";
  const major = q.personalInfo.intendedMajor || q.personalInfo.intendedApplicationField || "目标专业";
  const fitProgram = pair ? `${pair.program.nameEn} @ ${pair.school.nameEn}` : "目标项目";

  return {
    who_and_opening: [
      `从 ${projectTop} 开场，说明你为何走向 ${major}`,
      `从 ${educationTop} 开场，建立你的学术兴趣脉络`,
      `从一个真实问题开场，再引出你想解决的问题类型`,
    ],
    experience_shaping: [
      `用 ${projectTop} 说明“你如何做决策并承担结果”`,
      `用 ${workTop} 说明“你如何在约束下交付结果”`,
      `用“一次失败与修正”说明你的成长路径`,
    ],
    domain_understanding: [
      `用一个具体技术问题说明你对 ${major} 的理解深度`,
      "从系统、算法、工程权衡三层解释你的专业判断",
      "强调你如何把理论转化为可复现的工程实践",
    ],
    program_fit: [
      `将你的经历与 ${fitProgram} 的课程/资源逐项对应`,
      "用“我需要什么训练”与“项目提供什么支持”形成闭环",
      "从实验室/课程/社群三个维度说明匹配度",
    ],
    future_plan: [
      "写清短期研究目标 + 中期岗位方向 + 长期影响",
      "强调毕业后要解决的真实场景问题与路径",
      "用可执行里程碑表达你的规划可信度",
    ],
  };
}
