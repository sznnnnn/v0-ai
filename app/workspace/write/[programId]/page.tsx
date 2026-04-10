"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  DOCUMENT_DRAFT_PREVIEW_SCENES,
  buildDraftPreviewForScene,
  type DraftPreviewSceneId,
} from "@/lib/document-draft-demos";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  ChevronRight,
  Eye,
  FileText,
  Info,
  LoaderCircle,
  Languages,
  MessageSquare,
  Plus,
  SendHorizonal,
  Sparkles,
  TriangleAlert,
  XCircle,
} from "lucide-react";
import { useMatchResult, useQuestionnaire } from "@/hooks/use-questionnaire";
import {
  type DocumentDraftKind,
  type DraftWorkflowState,
  type IntentHistoryItem,
  type ParagraphBindingCard,
  type SourceTraceItem,
  buildDraftSeed,
  setDefaultPs,
  getResolvedDraftContent,
  getDraftExamplePreview,
  listDraftVersions,
  saveDraft,
  saveDraftWorkflow,
  saveDraftVersion,
  type MicroTaskStage,
  getDraft,
  getProgramIdsWithSavedDrafts,
  type DraftContext,
} from "@/lib/document-drafts";
import type { QuestionnaireData } from "@/lib/types";

function draftContextFromPair(pair: {
  program: { name: string; nameEn: string; degree: string; department: string; deadline: string };
  school: { name: string; nameEn: string };
}): DraftContext {
  const { program, school } = pair;
  return {
    schoolName: school.name,
    schoolNameEn: school.nameEn,
    programName: program.name,
    programNameEn: program.nameEn,
    degree: program.degree,
    department: program.department,
    deadline: program.deadline,
  };
}

function buildPsDraft(ctx: DraftContext, q: QuestionnaireData): string {
  return buildDraftSeed("ps", ctx, q);
}

type BackgroundMaterial = {
  id: string;
  title: string;
  detail: string;
};

type ProgramSignalOption = {
  id: string;
  text: string;
};

function pickBackgroundMaterials(q: QuestionnaireData): BackgroundMaterial[] {
  const out: BackgroundMaterial[] = [];
  if (q.personalInfo.motivationNote.trim()) {
    out.push({ id: "motivation", title: "申请动机", detail: q.personalInfo.motivationNote.trim() });
  }
  if (q.personalInfo.researchInterestNote.trim()) {
    out.push({ id: "research", title: "研究兴趣", detail: q.personalInfo.researchInterestNote.trim() });
  }
  if (q.personalInfo.otherApplicationNotes.trim()) {
    out.push({ id: "other_notes", title: "其他申请补充", detail: q.personalInfo.otherApplicationNotes.trim() });
  }
  q.education.slice(0, 2).forEach((e, i) => {
    const detail = [e.school, e.major, e.degree].filter(Boolean).join(" · ");
    if (detail) out.push({ id: `edu_${i}`, title: `教育经历 ${i + 1}`, detail });
  });
  q.workExperience.slice(0, 2).forEach((w, i) => {
    const detail = [w.company, w.position, w.result].filter(Boolean).join(" · ");
    if (detail) out.push({ id: `work_${i}`, title: `实习/工作 ${i + 1}`, detail });
  });
  q.projects.slice(0, 2).forEach((p, i) => {
    const detail = [p.name, p.role, p.result].filter(Boolean).join(" · ");
    if (detail) out.push({ id: `project_${i}`, title: `项目经历 ${i + 1}`, detail });
  });
  return out;
}

function normalizeLine(text: string, max = 120): string {
  const t = text.replace(/\s+/g, " ").trim();
  if (!t) return "";
  return t.length > max ? `${t.slice(0, max - 1)}…` : t;
}

function tokenizeText(text: string): string[] {
  return (text.toLowerCase().match(/[a-z]{3,}/g) ?? []).slice(0, 80);
}

function buildProgramSignalOptions(pair: {
  program: { department: string; curriculumNote?: string; description: string };
  school: { campusStyle?: string; studentLife?: string };
}): ProgramSignalOption[] {
  const out: ProgramSignalOption[] = [];
  const { program, school } = pair;
  if (program.curriculumNote?.trim()) {
    out.push({ id: "signal_curriculum", text: `课程方向：${normalizeLine(program.curriculumNote, 80)}` });
  }
  if (program.department?.trim()) {
    out.push({ id: "signal_department", text: `院系定位：${program.department.trim()}` });
  }
  if (program.description?.trim()) {
    out.push({ id: "signal_description", text: `项目特点：${normalizeLine(program.description, 80)}` });
  }
  if (school.campusStyle?.trim()) {
    out.push({ id: "signal_campus", text: `培养氛围：${normalizeLine(school.campusStyle, 80)}` });
  }
  if (school.studentLife?.trim()) {
    out.push({ id: "signal_community", text: `社群与资源：${normalizeLine(school.studentLife, 80)}` });
  }
  if (out.length === 0) {
    out.push(
      { id: "signal_course_default", text: "课程标签：补充该项目课程关键词（如 Distributed Systems）" },
      { id: "signal_prof_default", text: "教授方向：补充目标教授/实验室方向（如 HCI / Robotics）" },
      { id: "signal_goal_default", text: "目标能力：补充你希望通过项目获得的能力标签" }
    );
  }
  return out.slice(0, 6);
}

function recommendMaterialIds(
  materials: BackgroundMaterial[],
  requirements: ProgramSignalOption[],
  reasons: string[]
): string[] {
  if (materials.length === 0) return [];
  const bag = tokenizeText(requirements.map((r) => r.text).join(" ")) .concat(
    tokenizeText(reasons.join(" "))
  );
  const rank = materials
    .map((m) => {
      const text = `${m.title} ${m.detail}`.toLowerCase();
      const score = bag.reduce((acc, kw) => (text.includes(kw) ? acc + 1 : acc), 0);
      return { id: m.id, score };
    })
    .sort((a, b) => b.score - a.score);
  return rank.filter((r) => r.score > 0).slice(0, 5).map((r) => r.id);
}

function buildParagraphCards(
  selectedMaterialIds: string[],
  matchedRequirementIds: string[],
  materials: BackgroundMaterial[],
  requirements: ProgramSignalOption[]
): ParagraphBindingCard[] {
  const selected = materials.filter((m) => selectedMaterialIds.includes(m.id));
  const reqText = requirements
    .filter((r) => matchedRequirementIds.includes(r.id))
    .map((r) => r.text)
    .join("；");
  const cards: Array<{ id: string; title: string }> = [
    { id: "motivation", title: "动机与目标" },
    { id: "preparation", title: "准备度与经历" },
    { id: "fit", title: "项目契合与贡献" },
  ];
  return cards.map((card, idx) => {
    const mat = selected[idx % Math.max(selected.length, 1)];
    const base = mat
      ? `${mat.title}：${normalizeLine(mat.detail, 150)}`
      : "待补充具体素材。";
    const aiDraft = `${base}${reqText ? ` 重点呼应：${normalizeLine(reqText, 120)}` : ""}`;
    return {
      id: card.id,
      title: card.title,
      targetRequirementIds: matchedRequirementIds,
      materialIds: mat ? [mat.id] : [],
      aiDraft,
      editedDraft: aiDraft,
    };
  });
}

function applyIntentTransform(text: string, intent: IntentHistoryItem["intent"]): string {
  const trimmed = text.trim();
  if (!trimmed) return text;
  if (intent === "more_specific_results") {
    return `${trimmed}\n补充量化结果：请明确范围、指标与最终影响（如增长比例、覆盖人数、效率提升）。`;
  }
  if (intent === "stronger_motivation") {
    return `${trimmed}\n动机强化：补一句“为什么是现在、为什么是这个项目、毕业后如何落地”。`;
  }
  const words = trimmed.split(/\s+/).filter(Boolean);
  if (words.length <= 120) return trimmed;
  return `${words.slice(0, 120).join(" ")}...`;
}

type AiRewriteTone = "academic" | "reflective";
type AiRewriteFocus = "impact" | "fit";
type AiRewriteLength = "tight" | "balanced";
type DemoCritiqueColor = "red" | "amber" | "green";
type DemoCritique = {
  id: number;
  type: string;
  title: string;
  quote: string;
  harshComment: string;
  questions: string[];
  example: string;
  color: DemoCritiqueColor;
  suggestion?: { action: "replace"; text: string };
};
type CritiqueRange = { critique: DemoCritique; start: number; end: number };

function applyAiSuggestionPreset(
  text: string,
  tone: AiRewriteTone,
  focus: AiRewriteFocus,
  length: AiRewriteLength
): string {
  const trimmed = text.trim();
  if (!trimmed) return text;
  const hintTone = tone === "academic" ? "语气：更学术、客观。" : "语气：更个人、反思。";
  const hintFocus = focus === "impact" ? "重点：突出成果与量化影响。" : "重点：突出与项目课程/资源匹配。";
  const hintLength = length === "tight" ? "长度：整体再压缩约 20%。" : "长度：保持完整叙事。";
  return `${trimmed}\n\n[AI润色建议]\n${hintTone} ${hintFocus} ${hintLength}`;
}

type DemoWordRange = { min: number; max: number };

function getDemoWordRange(schoolNameEn?: string): DemoWordRange {
  const school = (schoolNameEn ?? "").toUpperCase();
  const isG5OrLse = ["OXFORD", "CAMBRIDGE", "IMPERIAL", "UCL", "LSE"].some((k) => school.includes(k));
  if (isG5OrLse) return { min: 1000, max: 1500 };
  const isKclOrWbs = ["KCL", "KING'S", "WARWICK", "WBS"].some((k) => school.includes(k));
  if (isKclOrWbs) return { min: 500, max: 800 };
  return { min: 800, max: 1200 };
}

function countEnWords(text: string): number {
  return (text.match(/[A-Za-z]+(?:'[A-Za-z]+)*/g) ?? []).length;
}

function countZhChars(text: string): number {
  return (text.match(/[\u4e00-\u9fff]/g) ?? []).length;
}

function estimateWords(text: string, lang: "zh-CN" | "en"): number {
  if (lang === "en") return countEnWords(text);
  // 中文演示稿按“汉字约折算 0.65 英文词”估算，兼容中英混排。
  return Math.round(countZhChars(text) * 0.65 + countEnWords(text));
}

function buildZhDemoDraft(targetMinWords: number): string {
  const base =
    "我从小就对人机交互充满热情，科技改变生活，所以我选择了这个专业。在大学期间，我参与了多个互联网项目。在最近的一段实习中，我独立开发了让公司营收翻倍的系统，极大提升了用户体验。我申请 Human-Computer Interaction 硕士并非出于抽象兴趣，而是基于一次可验证的研究结论：在校园心理支持场景中，用户流失并不主要源于信息缺失，而是源于关键交互节点的决策负担过高。在本科交互设计课程中，我负责将访谈记录、行为日志与任务流映射为可执行的改版方案。";
  const expansions = [
    "具体而言，我先对 32 份访谈逐条编码，抽取“犹豫停留”“路径回退”“预约中断”三类高频行为信号，再据此重构信息层级与引导文案。首轮测试显示，预约路径平均完成时长下降 18%，但高压力用户仍在身份确认步骤出现明显犹豫。",
    "针对该瓶颈，我引入分步披露和默认选项策略，减少单屏决策负荷，并在第二轮测试中通过任务成功率、误触率和主观负担评分联合评估。结果显示，关键任务完成率由 62% 提升到 81%，高压力用户组的误触率下降 27%。",
    "这段经历让我明确：HCI 不应停留在“界面美化”，而应以研究方法支撑可复现的行为改进。我由此形成了更务实的研究路径，即在复杂服务场景里将定性洞察转译为可量化设计假设，再通过实验验证其有效性与边界条件。",
    "在后续实习中，我将同样方法迁移到教育产品的学习路径优化任务中，围绕“首次任务完成”与“次日回访”两个核心指标进行漏斗拆解，并与工程同学协作完成事件埋点修正。该过程进一步训练了我在跨职能协作中的问题定义与证据表达能力。",
    "因此，我希望在硕士阶段系统补足实验设计、因果推断与交互评估框架，尤其是将用户研究与数据分析闭环化的能力。对我而言，课程价值不仅是知识扩展，更在于建立“问题定义—方法选择—结果解释—产品决策”这一可迁移的专业工作流。",
    "毕业后，我计划进入以复杂用户决策为核心的产品与研究岗位，优先聚焦数字健康或教育科技场景。短期目标是承担研究驱动的体验优化任务，长期目标是成长为能够主导证据型产品策略的 HCI 从业者，将严谨方法转化为可验证的真实用户价值。",
  ];
  let text = base;
  let i = 0;
  while (estimateWords(text, "zh-CN") < targetMinWords && i < expansions.length) {
    text = `${text}\n\n${expansions[i]}`;
    i += 1;
  }
  return text;
}

function buildEnDemoDraft(targetMinWords: number): string {
  const base =
    "My decision to pursue a master's degree in Human-Computer Interaction is driven by evidence from a concrete usability problem rather than a generic interest in technology.";
  const expansions = [
    "In an undergraduate design research project, I analyzed 32 semi-structured interviews and mapped user drop-off points along a counseling appointment flow. The key issue was not information scarcity, but cognitive overload at decision-heavy screens. I translated this finding into a redesign plan that simplified navigation, reduced simultaneous choices, and introduced progressive disclosure for sensitive steps.",
    "To validate the redesign, I conducted two rounds of usability testing and tracked task completion, time-on-task, and error frequency. After the second iteration, completion rate improved from 62% to 81%, while high-stress users showed a 27% reduction in misclicks. These results taught me to treat interaction design as a hypothesis-driven process where every interface decision must be testable and measurable.",
    "The project also sharpened my methodological discipline. I learned to connect qualitative evidence to measurable design variables, define evaluation metrics before implementation, and report findings in a way that engineering and product stakeholders could act on. This workflow shifted my mindset from feature thinking to evidence-based decision making.",
    "During a subsequent internship in an education product team, I applied the same approach to optimize first-session onboarding. I collaborated with developers to correct event instrumentation, rebuilt the funnel definitions for key milestones, and supported weekly review meetings with structured analysis. This experience strengthened my ability to frame design questions in operational terms and align cross-functional teams around measurable outcomes.",
    "At the master's level, I need formal training in experimental design, causal reasoning, and advanced interaction evaluation to move from local optimization to robust, generalizable solutions. I am particularly interested in coursework that integrates user research, analytics, and decision frameworks, because this combination directly addresses my current gap between insightful diagnosis and scalable implementation.",
    "In the short term, I aim to work in research-driven product roles in digital health or education technology, focusing on high-stakes user journeys where trust and comprehension are critical. In the longer term, I plan to lead evidence-centered product strategy, ensuring that design decisions are grounded in reproducible methods and meaningful user outcomes.",
  ];
  let text = base;
  let i = 0;
  while (estimateWords(text, "en") < targetMinWords && i < expansions.length) {
    text = `${text}\n\n${expansions[i]}`;
    i += 1;
  }
  return text;
}

function buildCritiqueRanges(text: string, critiques: DemoCritique[]): CritiqueRange[] {
  const draft = text.trim();
  if (!draft) return [];
  return critiques
    .map((critique) => {
      const start = draft.indexOf(critique.quote);
      return start >= 0 ? { critique, start, end: start + critique.quote.length } : null;
    })
    .filter((v): v is CritiqueRange => Boolean(v))
    .sort((a, b) => a.start - b.start);
}

export default function WriteDocumentPage() {
  const pathname = usePathname();
  const router = useRouter();
  const programId = useMemo(() => {
    const parts = pathname.split("/").filter(Boolean);
    const raw = parts[parts.length - 1] ?? "";
    return decodeURIComponent(raw);
  }, [pathname]);
  const { result, isLoaded: matchLoaded } = useMatchResult();
  const { data: questionnaireData, isLoaded: questionnaireLoaded } = useQuestionnaire();

  const [addedIds, setAddedIds] = useState<string[]>([]);
  const [addedIdsReady, setAddedIdsReady] = useState(false);
  const [hasLocalDraft, setHasLocalDraft] = useState(false);
  const kind: DocumentDraftKind = "ps";
  const [content, setContent] = useState("");
  const [zhContent, setZhContent] = useState("");
  const [enContent, setEnContent] = useState("");
  const [activeLanguage, setActiveLanguage] = useState<"zh-CN" | "en">("zh-CN");
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const [translateState, setTranslateState] = useState<"idle" | "translating">("idle");
  const [draftPreviewScene, setDraftPreviewScene] = useState<DraftPreviewSceneId>("current");
  const [selectedMaterialIds, setSelectedMaterialIds] = useState<string[]>([]);
  const [matchedRequirementIds, setMatchedRequirementIds] = useState<string[]>([]);
  const [customSignalInput, setCustomSignalInput] = useState("");
  const [customSignals, setCustomSignals] = useState<Array<{ id: string; text: string }>>([]);
  const [paragraphCards, setParagraphCards] = useState<ParagraphBindingCard[]>([]);
  const [intentHistory, setIntentHistory] = useState<IntentHistoryItem[]>([]);
  const [sourceTrace, setSourceTrace] = useState<SourceTraceItem[]>([]);
  const [currentStage, setCurrentStage] = useState<MicroTaskStage>("select_materials");
  const [structure, setStructure] = useState<"classic" | "story" | "impact">("classic");
  const [versionDialogOpen, setVersionDialogOpen] = useState(false);
  const [versionRefreshTick, setVersionRefreshTick] = useState(0);
  const [defaultDocState, setDefaultDocState] = useState<"idle" | "saved">("idle");
  const [materialView, setMaterialView] = useState<"all" | "selected">("all");
  const [seedReady, setSeedReady] = useState(false);
  const [demoState, setDemoState] = useState<"idle" | "loading" | "done">("idle");
  const [activeCritiqueId, setActiveCritiqueId] = useState<number>(1);
  const [userReply, setUserReply] = useState("");
  const [flashCritiqueId, setFlashCritiqueId] = useState<number | null>(null);
  const [guideCritiqueId, setGuideCritiqueId] = useState<number | null>(null);
  const [critiqueStatus, setCritiqueStatus] = useState<Record<number, "open" | "resolved" | "dismissed">>({});
  const [critiqueRanges, setCritiqueRanges] = useState<CritiqueRange[]>([]);
  const [scanState, setScanState] = useState<"idle" | "scanning">("idle");
  const [feedbackText, setFeedbackText] = useState<string | null>(null);
  const [hoveredCritiqueId, setHoveredCritiqueId] = useState<number | null>(null);
  const [applyingCritiqueId, setApplyingCritiqueId] = useState<number | null>(null);
  const [applyProgress, setApplyProgress] = useState(0);
  const saveIdleTimer = useRef<number | null>(null);
  const defaultDocTimer = useRef<number | null>(null);
  const demoTimer = useRef<number | null>(null);
  const flashTimer = useRef<number | null>(null);
  const feedbackTimer = useRef<number | null>(null);
  const applyTimer = useRef<number | null>(null);
  const critiqueCardRefs = useRef<Record<number, HTMLDivElement | null>>({});
  function focusCritique(id: number, guided = false) {
    setActiveCritiqueId(id);
    if (guided) setGuideCritiqueId(id);
  }

  function updateContentAndLanguage(next: string, options?: { updateRanges?: boolean }) {
    setContent(next);
    if (activeLanguage === "zh-CN") setZhContent(next);
    if (activeLanguage === "en") setEnContent(next);
    if (options?.updateRanges !== false) {
      setCritiqueRanges(buildCritiqueRanges(next, demoCritiques));
    }
  }

  /** 避免问卷 data 引用变化时重复覆盖编辑器；换项目时重置 */
  const seededProgramRef = useRef<string | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("edumatch_added_programs");
    if (raw) {
      try {
        setAddedIds(JSON.parse(raw) as string[]);
      } catch {
        setAddedIds([]);
      }
    }
    setAddedIdsReady(true);
  }, []);

  useEffect(() => {
    setHasLocalDraft(getProgramIdsWithSavedDrafts().has(programId));
  }, [programId]);

  const pair = useMemo(() => {
    if (!result || !programId) return null;
    const program = result.programs.find((p) => p.id === programId);
    if (!program) return null;
    const school = result.schools.find((s) => s.id === program.schoolId);
    if (!school) return null;
    return { program, school };
  }, [result, programId]);

  const draftExample = useMemo(() => {
    if (!pair || !questionnaireLoaded) return null;
    const ctx = draftContextFromPair(pair);
    return getDraftExamplePreview(kind, ctx, questionnaireData);
  }, [pair, kind, questionnaireLoaded, questionnaireData]);

  const draftPreviewPanel = useMemo(() => {
    if (!pair || !draftExample) return null;
    return buildDraftPreviewForScene(draftPreviewScene, kind, draftContextFromPair(pair), draftExample);
  }, [draftPreviewScene, kind, pair, draftExample]);

  const materialPool = useMemo(
    () => (questionnaireLoaded ? pickBackgroundMaterials(questionnaireData) : []),
    [questionnaireLoaded, questionnaireData]
  );
  const baseSignalOptions = useMemo(
    () => (pair ? buildProgramSignalOptions(pair) : []),
    [pair]
  );
  const requirementOptions = useMemo(
    () => [...baseSignalOptions, ...customSignals],
    [baseSignalOptions, customSignals]
  );
  const recommendedMaterialIds = useMemo(
    () =>
      pair
        ? recommendMaterialIds(materialPool, requirementOptions, pair.program.matchReasons ?? [])
        : [],
    [materialPool, pair, requirementOptions]
  );
  const visibleMaterials = useMemo(
    () =>
      materialView === "selected"
        ? materialPool.filter((m) => selectedMaterialIds.includes(m.id))
        : materialPool,
    [materialPool, materialView, selectedMaterialIds]
  );

  useEffect(() => {
    setSelectedMaterialIds((prev) => prev.filter((id) => materialPool.some((m) => m.id === id)));
  }, [materialPool]);

  useEffect(() => {
    if (materialView === "selected" && selectedMaterialIds.length === 0) {
      setMaterialView("all");
    }
  }, [materialView, selectedMaterialIds.length]);

  const step1Done = selectedMaterialIds.length > 0;
  const step2Done = matchedRequirementIds.length > 0;
  const step3Done = paragraphCards.length > 0;
  const step4Done = content.trim().length > 0;
  const zhCharCount = useMemo(
    () => (content.match(/[\u4e00-\u9fff]/g) ?? []).length,
    [content]
  );
  const enWordCount = useMemo(
    () => (content.match(/[A-Za-z]+(?:'[A-Za-z]+)*/g) ?? []).length,
    [content]
  );
  const totalCharsNoSpace = useMemo(() => content.replace(/\s+/g, "").length, [content]);
  const demoCritiques: DemoCritique[] = useMemo(
    () => [
      {
        id: 1,
        type: "Fatal Red Flag",
        title: "数据夸大与造假嫌疑",
        quote: "我独立开发了让公司营收翻倍的系统，极大提升了用户体验。",
        harshComment:
          "这句话在招生官视角里是高风险信号。本科实习生的职责边界通常不支持这种宏观业务归因，夸张叙述会直接伤害可信度与诚信判断。",
        questions: [
          "在这个项目中，你具体负责的是哪一个细分模块？",
          "是否有更真实可验证的微观指标（如响应时延、完成率、误触率）？",
        ],
        example:
          "作为数据实习生，我参与清理了约 2 万条脏数据，并用 Python 搭建基础可视化看板，为分析师后续优化转化率提供数据支持。",
        color: "red",
        suggestion: {
          action: "replace",
          text: "在【公司/团队名称】实习期间，我负责【具体模块】的数据处理与分析工作，基于【工具/方法】完成了【任务内容】。该工作使【微观指标，如页面加载时延/任务完成率】从【原始值】优化至【结果值】，并为【后续决策场景】提供了可执行依据。",
        },
      },
      {
        id: 2,
        type: "The Vague Dreamer",
        title: "动机泛泛而谈",
        quote: "我从小就对人机交互充满热情，科技改变生活，所以我选择了这个专业。",
        harshComment:
          "这种开头信息密度太低，不能支持学术评估。招生官需要看到的是具体触发点与问题意识，而不是口号式动机。",
        questions: ["是哪门课、哪次实验或哪段实习中的具体冲突，让你明确转向这个专业？"],
        example:
          "在一次适老化应用调研中，我发现现有无障碍设计忽略了认知负荷差异，这推动我进一步研究人因工程与交互评估。",
        color: "amber",
        suggestion: {
          action: "replace",
          text: "在【课程/项目名称】中，我通过【研究方法，如访谈/可用性测试】发现【具体痛点】是影响用户体验的关键因素。这一发现促使我将研究重心转向【目标领域】，并希望在硕士阶段进一步系统训练【方法或能力模块】。",
        },
      },
      {
        id: 3,
        type: "Strong Evidence",
        title: "量化结果表达有效",
        quote: "结果显示，关键任务完成率由 62% 提升到 81%，高压力用户组的误触率下降 27%。",
        harshComment:
          "这句是加分项：方法-指标-结果链条完整，招生官可以快速判断你具备证据驱动的分析能力。建议保留并前置。",
        questions: ["这句建议保留。可再补一句：该结果如何引出你申请该项目的下一步研究目标？"],
        example:
          "可强化为：该结果促使我进一步关注高压力场景下的认知负荷建模，并希望在硕士阶段系统训练实验设计与评估框架。",
        color: "green",
        suggestion: {
          action: "replace",
          text: "结果显示，关键任务完成率由【原始值】提升到【结果值】，【辅助指标】下降【比例】。这说明【你的方法/策略】在【场景】中具有可验证效果，也进一步引出我希望在硕士阶段深入研究【具体研究方向】。",
        },
      },
    ],
    []
  );
  const activeCritique = demoCritiques.find((c) => c.id === activeCritiqueId) ?? demoCritiques[0];
  const visibleCritiques = useMemo(
    () => demoCritiques.filter((c) => (critiqueStatus[c.id] ?? "open") === "open"),
    [critiqueStatus, demoCritiques]
  );
  const critiqueStats = useMemo(() => {
    const total = visibleCritiques.length;
    const resolved = demoCritiques.filter((c) => critiqueStatus[c.id] === "resolved").length;
    const dismissed = demoCritiques.filter((c) => critiqueStatus[c.id] === "dismissed").length;
    const open = total;
    return { total, resolved, dismissed, open };
  }, [critiqueStatus, demoCritiques, visibleCritiques]);
  const annotatedDraftPreview = useMemo(() => {
    const draft = content.trim();
    if (!draft) return null;
    const paragraphs = draft.split(/\n{2,}/).filter(Boolean);
    let totalHits = 0;
    let globalOffset = 0;
    let rangeCursor = 0;
    const rendered = paragraphs.map((para, pIdx) => {
      const pieces: React.JSX.Element[] = [];
      let cursor = 0;
      let pieceIdx = 0;
      const paraStart = globalOffset;
      const paraEnd = paraStart + para.length;
      while (cursor < para.length) {
        const nextRange = critiqueRanges.slice(rangeCursor).find((r) => r.start >= paraStart && r.start < paraEnd);
        if (!nextRange) {
          pieces.push(<span key={`txt-${pIdx}-${pieceIdx++}`}>{para.slice(cursor)}</span>);
          break;
        }
        const localStart = nextRange.start - paraStart;
        const localEnd = nextRange.end - paraStart;
        if (localStart > cursor) {
          pieces.push(<span key={`txt-${pIdx}-${pieceIdx++}`}>{para.slice(cursor, localStart)}</span>);
        }
        const isActive = activeCritiqueId === nextRange.critique.id;
        totalHits += 1;
        pieces.push(
          <button
            key={`hl-${pIdx}-${pieceIdx++}`}
            type="button"
            onClick={() => focusCritique(nextRange.critique.id, true)}
            onMouseEnter={() => setHoveredCritiqueId(nextRange.critique.id)}
            onMouseLeave={() => setHoveredCritiqueId((curr) => (curr === nextRange.critique.id ? null : curr))}
            className={`rounded px-0.5 text-left transition-colors ${
              nextRange.critique.color === "red"
                ? isActive
                  ? "bg-red-200/80"
                  : "bg-red-100/70 hover:bg-red-200/70"
                : nextRange.critique.color === "amber"
                  ? isActive
                    ? "bg-amber-200/80"
                    : "bg-amber-100/70 hover:bg-amber-200/70"
                  : isActive
                    ? "bg-emerald-200/80"
                    : "bg-emerald-100/70 hover:bg-emerald-200/70"
            } ${hoveredCritiqueId === nextRange.critique.id ? "ring-1 ring-primary/40" : ""}`}
          >
            {para.slice(localStart, localEnd)}
          </button>
        );
        cursor = localEnd;
        rangeCursor += 1;
      }
      globalOffset = paraEnd + 2;
      return (
        <p key={`p-${pIdx}`} className="text-sm leading-7 text-foreground/90">
          {pieces}
        </p>
      );
    });
    if (totalHits > 0) return rendered;
    return [
      <p key="fallback-hl" className="text-sm leading-7 text-foreground/90">
        <button
          type="button"
          onClick={() => focusCritique(2, true)}
          onMouseEnter={() => setHoveredCritiqueId(2)}
          onMouseLeave={() => setHoveredCritiqueId((curr) => (curr === 2 ? null : curr))}
          className={`rounded px-0.5 text-left transition-colors ${
            activeCritiqueId === 2 ? "bg-amber-200/80" : "bg-amber-100/70 hover:bg-amber-200/70"
          } ${hoveredCritiqueId === 2 ? "ring-1 ring-primary/40" : ""}`}
        >
          {demoCritiques[1]?.quote}
        </button>
        {" "}
        <button
          type="button"
          onClick={() => focusCritique(1, true)}
          onMouseEnter={() => setHoveredCritiqueId(1)}
          onMouseLeave={() => setHoveredCritiqueId((curr) => (curr === 1 ? null : curr))}
          className={`rounded px-0.5 text-left transition-colors ${
            activeCritiqueId === 1 ? "bg-red-200/80" : "bg-red-100/70 hover:bg-red-200/70"
          } ${hoveredCritiqueId === 1 ? "ring-1 ring-primary/40" : ""}`}
        >
          {demoCritiques[0]?.quote}
        </button>
        {" "}
        <button
          type="button"
          onClick={() => focusCritique(3, true)}
          onMouseEnter={() => setHoveredCritiqueId(3)}
          onMouseLeave={() => setHoveredCritiqueId((curr) => (curr === 3 ? null : curr))}
          className={`rounded px-0.5 text-left transition-colors ${
            activeCritiqueId === 3 ? "bg-emerald-200/80" : "bg-emerald-100/70 hover:bg-emerald-200/70"
          } ${hoveredCritiqueId === 3 ? "ring-1 ring-primary/40" : ""}`}
        >
          {demoCritiques[2]?.quote}
        </button>
      </p>,
    ];
  }, [activeCritiqueId, content, critiqueRanges, demoCritiques]);
  const draftVersions = useMemo(
    () => (programId ? listDraftVersions(programId, kind) : []),
    [programId, kind, versionRefreshTick]
  );

  async function switchLanguage(target: "en" | "zh-CN") {
    if (target === activeLanguage) return;

    if (activeLanguage === "zh-CN") setZhContent(content);
    if (activeLanguage === "en") setEnContent(content);

    if (target === "zh-CN") {
      setContent(zhContent);
      setActiveLanguage("zh-CN");
      return;
    }

    if (enContent.trim()) {
      setContent(enContent);
      setActiveLanguage("en");
      return;
    }

    const source = (activeLanguage === "zh-CN" ? content : zhContent).trim();
    if (!source) return;

    setTranslateState("translating");
    try {
      const r = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: source, target: "en" }),
      });
      const data = (await r.json()) as { translatedText?: string };
      if (r.ok && data.translatedText) {
        setEnContent(data.translatedText);
        setContent(data.translatedText);
        setActiveLanguage("en");
      }
    } finally {
      setTranslateState("idle");
    }
  }

  function toggleLanguage() {
    if (activeLanguage === "zh-CN") {
      void switchLanguage("en");
      return;
    }
    void switchLanguage("zh-CN");
  }

  function handleSaveVersion() {
    if (!programId) return;
    const saved = saveDraftVersion(programId, kind, content);
    if (!saved) return;
    setVersionRefreshTick((v) => v + 1);
  }

  function restoreVersion(versionContent: string) {
    setContent(versionContent);
    if (activeLanguage === "zh-CN") setZhContent(versionContent);
    if (activeLanguage === "en") setEnContent(versionContent);
    setVersionDialogOpen(false);
  }

  function runInitialDraftDemo() {
    if (demoState === "loading") return;
    setDemoState("loading");
    if (demoTimer.current != null) window.clearTimeout(demoTimer.current);
    demoTimer.current = window.setTimeout(() => {
      const range = getDemoWordRange(pair?.school.nameEn);
      const targetMin = range.min;
      const zhDraft = buildZhDemoDraft(targetMin);
      const enDraft = buildEnDemoDraft(targetMin);
      const draftForEditor = activeLanguage === "en" ? enDraft : zhDraft;
      setContent(draftForEditor);
      setZhContent(zhDraft);
      setEnContent(enDraft);
      setCurrentStage("refine_draft");
      setDemoState("done");
      demoTimer.current = null;
    }, 1800);
  }

  function applyCritiqueSuggestion(critique: DemoCritique) {
    if (!critique.suggestion || critique.suggestion.action !== "replace") return;
    setApplyingCritiqueId(critique.id);
    setApplyProgress(8);
    if (applyTimer.current != null) window.clearTimeout(applyTimer.current);
    applyTimer.current = window.setTimeout(() => setApplyProgress(36), 120);
    window.setTimeout(() => setApplyProgress(68), 260);
    window.setTimeout(() => setApplyProgress(92), 420);
    const target = critiqueRanges.find((r) => r.critique.id === critique.id);
    const replacement = critique.suggestion.text;
    if (!target) {
      window.setTimeout(() => {
        const next = `${content.trim()}\n\n${replacement}`;
        updateContentAndLanguage(next);
        setCritiqueStatus((prev) => ({ ...prev, [critique.id]: "resolved" }));
        setFeedbackText(`已插入AI范例：${critique.title}`);
        setApplyProgress(100);
        window.setTimeout(() => {
          setApplyingCritiqueId(null);
          setApplyProgress(0);
        }, 160);
      }, 520);
      return;
    }
    window.setTimeout(() => {
      const next = `${content.slice(0, target.start)}${replacement}${content.slice(target.end)}`;
      const delta = replacement.length - (target.end - target.start);
      updateContentAndLanguage(next, { updateRanges: false });
      setCritiqueRanges((prev) =>
        prev.map((r) => {
          if (r.critique.id === critique.id) {
            return { ...r, end: r.start + replacement.length };
          }
          if (r.start > target.start) {
            return { ...r, start: r.start + delta, end: r.end + delta };
          }
          return r;
        })
      );
      setCritiqueStatus((prev) => ({ ...prev, [critique.id]: "resolved" }));
      setFeedbackText(`已应用建议：${critique.title}`);
      setApplyProgress(100);
      window.setTimeout(() => {
        setApplyingCritiqueId(null);
        setApplyProgress(0);
      }, 160);
    }, 520);
  }

  function dismissCritique(id: number) {
    setCritiqueStatus((prev) => ({ ...prev, [id]: "dismissed" }));
    const c = demoCritiques.find((item) => item.id === id);
    setFeedbackText(`已忽略建议：${c?.title ?? "未命名建议"}`);
  }

  function runCritiqueScan() {
    if (scanState === "scanning") return;
    setScanState("scanning");
    window.setTimeout(() => {
      setCritiqueRanges(buildCritiqueRanges(content, demoCritiques));
      setCritiqueStatus((prev) => {
        const next = { ...prev };
        demoCritiques.forEach((c) => {
          if (!next[c.id]) next[c.id] = "open";
        });
        return next;
      });
      setFeedbackText("已完成重扫，建议状态已更新");
      setScanState("idle");
    }, 500);
  }

  useEffect(() => {
    if (!pair || !questionnaireLoaded) return;
    const pid = pair.program.id;
    if (seededProgramRef.current === pid) return;
    seededProgramRef.current = pid;
    setSeedReady(false);
    const ctx = draftContextFromPair(pair);
    const seeded = getResolvedDraftContent(pid, "ps", ctx, questionnaireData);
    setZhContent(seeded);
    setEnContent("");
    setActiveLanguage("zh-CN");
    setContent(seeded);
    const existing = getDraft(pid, kind);
    const workflow = existing?.workflow;
    if (workflow) {
      setSelectedMaterialIds(workflow.selectedMaterialIds ?? []);
      setMatchedRequirementIds(workflow.matchedRequirementIds ?? []);
      setParagraphCards(workflow.paragraphBindings ?? []);
      setIntentHistory(workflow.intentHistory ?? []);
      setSourceTrace(workflow.sourceTrace ?? []);
      setCurrentStage(workflow.microTaskState?.currentStage ?? "select_materials");
    } else {
      const recommended = recommendMaterialIds(
        materialPool,
        buildProgramSignalOptions(pair),
        pair.program.matchReasons ?? []
      );
      setSelectedMaterialIds(recommended);
      setMatchedRequirementIds([]);
      setCustomSignals([]);
      setCustomSignalInput("");
      setParagraphCards([]);
      setIntentHistory([]);
      setSourceTrace([]);
      setCurrentStage("select_materials");
    }
    setStructure("classic");
    setMaterialView("all");
    setSeedReady(true);
  }, [kind, materialPool, pair, questionnaireLoaded, questionnaireData]);

  useEffect(() => {
    if (!pair || !questionnaireLoaded || !seedReady) return;
    setSaveState("saving");
    const debounce = window.setTimeout(() => {
      saveDraft(pair.program.id, kind, content);
      setSaveState("saved");
      if (saveIdleTimer.current != null) window.clearTimeout(saveIdleTimer.current);
      saveIdleTimer.current = window.setTimeout(() => setSaveState("idle"), 1600);
    }, 500);
    return () => window.clearTimeout(debounce);
  }, [content, pair, questionnaireLoaded, seedReady]);

  useEffect(() => {
    if (!pair || !seedReady) return;
    const completedStages: MicroTaskStage[] = [];
    if (step1Done) completedStages.push("select_materials");
    if (step2Done) completedStages.push("match_requirements");
    if (step3Done) completedStages.push("bind_paragraphs");
    if (step4Done) completedStages.push("refine_draft");
    const workflow: DraftWorkflowState = {
      microTaskState: {
        currentStage,
        completedStages,
      },
      selectedMaterialIds,
      matchedRequirementIds,
      paragraphBindings: paragraphCards,
      intentHistory,
      sourceTrace,
      recommendationCache: recommendedMaterialIds,
    };
    saveDraftWorkflow(pair.program.id, kind, workflow);
  }, [
    currentStage,
    intentHistory,
    kind,
    matchedRequirementIds,
    pair,
    paragraphCards,
    recommendedMaterialIds,
    seedReady,
    selectedMaterialIds,
    sourceTrace,
    step1Done,
    step2Done,
    step3Done,
    step4Done,
  ]);

  useEffect(() => {
    return () => {
      if (saveIdleTimer.current != null) window.clearTimeout(saveIdleTimer.current);
      if (defaultDocTimer.current != null) window.clearTimeout(defaultDocTimer.current);
      if (demoTimer.current != null) window.clearTimeout(demoTimer.current);
      if (flashTimer.current != null) window.clearTimeout(flashTimer.current);
      if (feedbackTimer.current != null) window.clearTimeout(feedbackTimer.current);
      if (applyTimer.current != null) window.clearTimeout(applyTimer.current);
    };
  }, []);

  useEffect(() => {
    if (guideCritiqueId == null) return;
    const node = critiqueCardRefs.current[guideCritiqueId];
    if (node) {
      node.scrollIntoView({ behavior: "smooth", block: "center" });
      setFlashCritiqueId(guideCritiqueId);
      if (flashTimer.current != null) window.clearTimeout(flashTimer.current);
      flashTimer.current = window.setTimeout(() => {
        setFlashCritiqueId(null);
        flashTimer.current = null;
      }, 500);
    }
    setGuideCritiqueId(null);
  }, [guideCritiqueId]);

  useEffect(() => {
    const t = window.setTimeout(() => {
      setCritiqueRanges(buildCritiqueRanges(content, demoCritiques));
    }, 180);
    return () => window.clearTimeout(t);
  }, [content, demoCritiques]);

  useEffect(() => {
    if (!feedbackText) return;
    if (feedbackTimer.current != null) window.clearTimeout(feedbackTimer.current);
    feedbackTimer.current = window.setTimeout(() => {
      setFeedbackText(null);
      feedbackTimer.current = null;
    }, 1800);
  }, [feedbackText]);

  const notAdded = addedIdsReady && !addedIds.includes(programId);
  const canUseEditor = !notAdded || hasLocalDraft;
  const missingMatch = matchLoaded && !result;
  const missingProgram = matchLoaded && result && !pair;

  if (!programId) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-50">
        <div className="flex h-8 items-center justify-center border-b border-border bg-muted">
          <p className="text-xs text-muted-foreground">游客模式 · 数据仅本地保存</p>
        </div>
        <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <div className="mx-auto flex h-14 max-w-4xl items-center justify-between gap-3 px-4 sm:px-6">
            <div className="flex min-w-0 items-center gap-2">
              <Button type="button" variant="ghost" size="icon" className="shrink-0" asChild>
                <Link href="/workspace" aria-label="返回工作台">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">文书草稿</p>
                {pair ? (
                  <p className="truncate text-xs text-muted-foreground">
                    {pair.school.nameEn} · {pair.program.nameEn}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">—</p>
                )}
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
              {saveState === "saving" && <span>保存中…</span>}
              {saveState === "saved" && (
                <span className="flex items-center gap-1 text-foreground">
                  <Check className="h-3.5 w-3.5" />
                  已保存
                </span>
              )}
            </div>
          </div>
        </header>
      </div>

      <main className="px-4 py-6 sm:px-6 sm:py-8">
        {missingMatch && (
          <div className="rounded-lg border border-dashed border-border p-10 text-center">
            <Sparkles className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
            <p className="mb-4 text-sm text-muted-foreground">请先在匹配页生成结果，再把项目加入工作台。</p>
            <Button onClick={() => router.push("/match")}>去匹配</Button>
          </div>
        )}

        {!missingMatch && missingProgram && (
          <div className="rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            未找到该项目，可能匹配结果已更新。请返回工作台重新选择。
            <div className="mt-4">
              <Button variant="outline" asChild>
                <Link href="/workspace">回工作台</Link>
              </Button>
            </div>
          </div>
        )}

        {!missingMatch && !missingProgram && addedIdsReady && notAdded && !hasLocalDraft && (
          <div className="rounded-lg border border-dashed border-border p-10 text-center">
            <p className="mb-4 text-sm text-muted-foreground">
              请先将该项目加入工作台后再写文书；若已有草稿，可从匹配页对应项目的「文书」入口进入。
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <Button variant="outline" asChild>
                <Link href="/match">去匹配</Link>
              </Button>
              <Button asChild>
                <Link href="/workspace">回工作台</Link>
              </Button>
            </div>
          </div>
        )}

        {pair && (!addedIdsReady || !questionnaireLoaded) && (
          <p className="text-sm text-muted-foreground">加载中…</p>
        )}

        {pair && addedIdsReady && questionnaireLoaded && canUseEditor && (
          <div className="mx-auto max-w-7xl">
            {notAdded && hasLocalDraft && (
              <p className="mb-3 rounded-md border border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                该项目未在工作台列表中，当前仅编辑已保存草稿。
              </p>
            )}
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
              <section className="rounded-lg border border-border bg-card">
                <div className="flex items-center justify-between border-b border-border px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">个人陈述（PS）</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      aria-label={activeLanguage === "zh-CN" ? "切换到英文" : "切换到中文"}
                      title={activeLanguage === "zh-CN" ? "切换到英文" : "切换到中文"}
                      onClick={toggleLanguage}
                      disabled={translateState === "translating"}
                    >
                      {translateState === "translating" ? (
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                      ) : (
                        <Languages className="h-4 w-4" />
                      )}
                    </Button>
                    <div className="text-right text-xs text-muted-foreground">
                      <p>{activeLanguage === "zh-CN" ? `字数 ${totalCharsNoSpace}` : `Words ${enWordCount}`}</p>
                      {saveState === "saving" && <span>保存中…</span>}
                      {saveState === "saved" && (
                        <span className="inline-flex items-center gap-1 text-foreground">
                          <Check className="h-3.5 w-3.5" />
                          已保存
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="mb-2 space-y-2">
                    {annotatedDraftPreview}
                  </div>
                  <Textarea
                    value={content}
                    onChange={(e) => {
                      const next = e.target.value;
                      setContent(next);
                      if (activeLanguage === "zh-CN") setZhContent(next);
                      if (activeLanguage === "en") setEnContent(next);
                    }}
                    placeholder="开始撰写你的文书。"
                    className="min-h-[72vh] resize-y border-border/80 font-mono text-sm leading-relaxed shadow-none"
                    spellCheck={false}
                  />
                  <div className="mt-3 rounded-md border border-border/70 bg-muted/20 px-3 py-2">
                    <div className="flex items-center justify-end">
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        disabled={!content.trim()}
                        aria-label="重新生成"
                        title="重新生成"
                        onClick={() => {
                          const next = applyAiSuggestionPreset(content, "academic", "fit", "balanced");
                          setContent(next);
                          if (activeLanguage === "zh-CN") setZhContent(next);
                          if (activeLanguage === "en") setEnContent(next);
                        }}
                      >
                        <Sparkles className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </section>

              <aside className="space-y-2 lg:sticky lg:top-24 lg:self-start">
                {applyingCritiqueId != null && (
                  <div className="rounded-lg border border-border bg-card px-3 py-2">
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full bg-primary transition-all duration-200 ease-out"
                        style={{ width: `${applyProgress}%` }}
                      />
                    </div>
                    <p className="mt-1 text-[11px] text-muted-foreground">AI 正在生成范例句...</p>
                  </div>
                )}
                {feedbackText && (
                  <div className="rounded-lg border border-border bg-card px-3 py-2">
                    <p className="text-xs text-primary">{feedbackText}</p>
                  </div>
                )}
                <AnimatePresence initial={false}>
                  {visibleCritiques.map((critique) => {
                    const active = critique.id === activeCritiqueId;
                    const danger = critique.color === "red";
                    const warning = critique.color === "amber";
                    const status = critiqueStatus[critique.id] ?? "open";
                    const hovering = hoveredCritiqueId === critique.id;
                    return (
                      <motion.div
                        key={critique.id}
                        layout
                        ref={(el) => {
                          critiqueCardRefs.current[critique.id] = el;
                        }}
                        initial={{ opacity: 0, x: 16 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: "100%", transition: { duration: 0.22, ease: "easeIn" } }}
                        transition={{ duration: 0.2 }}
                        whileHover={{ scale: 1.02 }}
                        className={`w-full rounded-lg border bg-card p-3 text-left transition-all duration-200 ease-out ${
                          active ? "border-primary/50 ring-1 ring-primary/30" : "border-border hover:bg-muted/20"
                        } ${flashCritiqueId === critique.id ? "bg-primary/10 ring-2 ring-primary/40" : ""} ${
                          hovering ? "shadow-lg bg-primary/5" : "shadow-sm"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => focusCritique(critique.id)}
                          onMouseEnter={() => setHoveredCritiqueId(critique.id)}
                          onMouseLeave={() => setHoveredCritiqueId((curr) => (curr === critique.id ? null : curr))}
                          className="w-full text-left"
                        >
                          <div className="flex items-center justify-between gap-2 text-xs">
                            <div className="flex items-center gap-2">
                              {danger ? (
                                <XCircle className="h-3.5 w-3.5 text-destructive" />
                              ) : warning ? (
                                <TriangleAlert className="h-3.5 w-3.5 text-amber-600" />
                              ) : (
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                              )}
                              <span
                                className={
                                  danger ? "text-destructive" : warning ? "text-amber-700" : "text-emerald-700"
                                }
                              >
                                {critique.type}
                              </span>
                            </div>
                            <span className="text-[11px] text-muted-foreground">
                              {status === "resolved" ? "已处理" : status === "dismissed" ? "已忽略" : "待处理"}
                            </span>
                          </div>
                          <p className="mt-2 text-sm font-medium text-foreground">{critique.title}</p>
                          <p className="mt-2 rounded-md bg-muted/40 px-2 py-1.5 text-sm leading-6 text-foreground">
                            {critique.questions[0]}
                          </p>
                        </button>
                        <motion.div
                          initial={false}
                          animate={
                            active
                              ? { height: "auto", opacity: 1, y: 0 }
                              : { height: 0, opacity: 0, y: 10 }
                          }
                          transition={{ duration: 0.3, ease: "easeOut" }}
                          className="mt-2 overflow-hidden"
                        >
                          <p className="mb-2 rounded-md border border-primary/20 bg-primary/5 px-2 py-1 text-xs text-foreground">
                            {critique.example}
                          </p>
                          <div className="flex items-center gap-2">
                            {critique.suggestion ? (
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                disabled={status === "resolved" || applyingCritiqueId === critique.id}
                                onClick={() => applyCritiqueSuggestion(critique)}
                              >
                                {applyingCritiqueId === critique.id ? "生成中..." : "Accept"}
                              </Button>
                            ) : (
                              <Button type="button" size="sm" variant="outline" disabled>
                                无需改动
                              </Button>
                            )}
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              disabled={status === "resolved" || applyingCritiqueId === critique.id}
                              onClick={() => dismissCritique(critique.id)}
                            >
                              Dismiss
                            </Button>
                          </div>
                        </motion.div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
                {critiqueStats.open === 0 && (
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
                    已完成本轮批注处理。你可以继续润色正文后点击“重扫”获取下一轮建议。
                  </div>
                )}
              </aside>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
