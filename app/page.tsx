"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import {
  ExternalLink,
  FileText,
  GitCompare,
  Headset,
  Languages,
  Rocket,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

/** 与 BingyanStudio/Buddyup-website 官网保持一致 */
const BUDDYUP_SITE = "https://buddyup.studio";
const BUDDYUP_BETA_FORM =
  "https://bingyanstudio.feishu.cn/share/base/form/shrcnvWwvuWgN7XYJANy0yn2Rod";
const BUDDYUP_CONTACT = "mailto:contact@buddyup.studio";
const BUDDYUP_REPO = "https://github.com/BingyanStudio/Buddyup-website";
const BUDDYUP_COVER = `${BUDDYUP_SITE}/static/home/cover.png`;

const linkFocus =
  "rounded-md outline-none transition-colors focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 focus-visible:ring-offset-white";
const btnPrimary =
  "inline-flex items-center justify-center rounded-xl bg-neutral-900 px-6 py-2.5 text-base font-medium text-white transition-colors hover:bg-neutral-800 " + linkFocus;
const navLink = "rounded-md px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-200 " + linkFocus;

type DescriptionItem = { title: string; description?: string };

/** 名称缩写示意徽标（非各校官方标志，仅作视觉占位） */
const SCHOOL_BADGE_ROWS: { monogram: string; label: string; ring: string }[][] = [
  [
    { monogram: "Oxf", label: "牛津", ring: "from-sky-100 to-indigo-100 text-indigo-950 ring-indigo-200/80" },
    { monogram: "Cam", label: "剑桥", ring: "from-amber-50 to-orange-100 text-amber-950 ring-amber-200/80" },
    { monogram: "MIT", label: "麻省理工", ring: "from-red-50 to-rose-100 text-rose-950 ring-rose-200/80" },
  ],
  [
    { monogram: "Imp", label: "帝国理工", ring: "from-violet-50 to-purple-100 text-violet-950 ring-violet-200/80" },
    { monogram: "LSE", label: "伦敦政经", ring: "from-blue-50 to-slate-100 text-slate-900 ring-slate-200/80" },
    { monogram: "ETH", label: "苏黎世联邦", ring: "from-emerald-50 to-teal-100 text-teal-950 ring-teal-200/80" },
  ],
];

function SchoolBadgePanel() {
  return (
    <div
      className="flex min-h-[280px] w-full flex-1 flex-col justify-center bg-gradient-to-br from-neutral-50 via-white to-neutral-100 p-6 md:min-h-0 md:p-10"
      role="img"
      aria-label="多所全球顶尖院校：名称缩写示意徽标，非官方标志"
    >
      <p className="mb-5 text-center text-xs font-medium leading-snug text-neutral-600">
        院校库示意：缩写徽章，非各校官方标志
      </p>
      <div className="mx-auto flex w-full max-w-sm flex-col gap-5">
        {SCHOOL_BADGE_ROWS.map((row, ri) => (
          <div key={ri} className="grid grid-cols-3 gap-3 md:gap-4">
            {row.map((s) => (
              <div key={s.monogram} className="flex flex-col items-center gap-2">
                <div
                  className={cn(
                    "flex aspect-square w-full max-w-[4.5rem] items-center justify-center rounded-full bg-gradient-to-br shadow-md ring-2 ring-offset-2 ring-offset-neutral-50 md:max-w-[5.25rem]",
                    s.ring
                  )}
                >
                  <span className="text-sm font-bold tracking-tight md:text-base">{s.monogram}</span>
                </div>
                <span className="text-center text-[10px] font-medium leading-snug text-neutral-600 md:text-xs">
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function DisplayCard({
  title,
  subtitle,
  imageSrc,
  descriptionList,
  rightPanel = "image",
}: {
  title: string;
  subtitle: string;
  imageSrc?: string;
  descriptionList: DescriptionItem[];
  rightPanel?: "image" | "school-badges";
}) {
  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm md:flex-row md:items-stretch">
      <div className="flex w-full flex-col justify-between gap-6 self-stretch p-6 md:w-1/2 md:gap-8 md:p-10 lg:p-12">
        <header className="max-w-prose space-y-2">
          <p className="text-sm font-medium text-neutral-500">{subtitle}</p>
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900 md:text-3xl">{title}</h2>
        </header>
        <ol className="max-w-prose divide-y divide-neutral-200">
          {descriptionList.map((item, index) => (
            <li key={index} className="flex flex-col gap-1 py-3 first:pt-0 md:py-3.5">
              <span className="text-[11px] font-medium tabular-nums text-neutral-400">{(index + 1).toString().padStart(2, "0")}</span>
              <h3 className="text-base font-semibold text-neutral-900">{item.title}</h3>
              {item.description ? (
                <p className="text-sm leading-relaxed text-neutral-600">{item.description}</p>
              ) : null}
            </li>
          ))}
        </ol>
      </div>
      <div className="flex w-full border-t border-neutral-200 md:w-1/2 md:border-l md:border-t-0">
        {rightPanel === "school-badges" ? (
          <SchoolBadgePanel />
        ) : imageSrc ? (
          /* eslint-disable-next-line @next/next/no-img-element -- 外链配图 */
          <img
            src={imageSrc}
            alt=""
            className="h-full min-h-[200px] w-full object-cover object-center md:min-h-[320px]"
            loading="lazy"
          />
        ) : null}
      </div>
    </article>
  );
}

function FeatureCard({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: ReactNode;
}) {
  return (
    <div className="flex h-full flex-col gap-3 rounded-xl border border-neutral-200 bg-white p-6 md:gap-4 md:p-8">
      <div className="text-neutral-600" aria-hidden>
        {icon}
      </div>
      <div className="flex flex-col gap-1.5">
        <h3 className="text-base font-semibold text-neutral-900">{title}</h3>
        <p className="text-sm font-normal leading-relaxed text-neutral-600">{description}</p>
      </div>
    </div>
  );
}

const AVATAR_SIZES = ["size-6 md:size-8", "size-8 md:size-12", "size-10 md:size-16", "size-12 md:size-20", "size-10 md:size-16", "size-8 md:size-12", "size-6 md:size-8"] as const;

export default function HomePage() {
  const [coverFailed, setCoverFailed] = useState(false);

  return (
    <div className="min-h-screen bg-white text-neutral-900 antialiased">
      <header className="sticky top-0 z-50 border-b border-neutral-100 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link href="/" className={cn("flex w-fit shrink-0 items-center gap-2 font-semibold tracking-tight", linkFocus)}>
            <span className="rounded-md bg-neutral-900 px-2 py-0.5 text-xs font-bold text-white">BU</span>
            <span>BuddyUp</span>
          </Link>
          <nav className="hidden flex-1 justify-center md:flex" aria-label="主导航">
            <a href={`${BUDDYUP_SITE}/pricing`} target="_blank" rel="noreferrer" className={navLink}>
              定价
            </a>
            <a href={`${BUDDYUP_SITE}/blog`} target="_blank" rel="noreferrer" className={navLink}>
              博客
            </a>
            <a href={`${BUDDYUP_SITE}/contact`} target="_blank" rel="noreferrer" className={navLink}>
              联系
            </a>
          </nav>
        </div>
      </header>

      <main id="main-content" className="outline-none">
        <section className="mx-auto max-w-7xl px-4 pb-12 pt-10 sm:px-6 md:pb-16 md:pt-14" aria-labelledby="hero-heading">
          <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
            <div className="flex flex-row flex-wrap items-center justify-center gap-1" aria-hidden>
              {AVATAR_SIZES.map((cls, i) => (
                <div
                  key={i}
                  className={cn("shrink-0 rounded-full bg-gradient-to-br from-neutral-200 to-neutral-300 opacity-90", cls)}
                />
              ))}
            </div>
            <h1 id="hero-heading" className="mt-5 text-4xl font-bold leading-tight tracking-tight md:mt-6 md:text-6xl">
              写出你的最佳
              <br />
              <span className="text-[2.5rem] leading-none md:text-7xl">个人陈述</span>
            </h1>
            <p className="mt-5 max-w-xl text-pretty text-lg font-medium text-neutral-700 md:mt-6 md:text-xl">
              AI 驱动的留学文书助手，陪你走完申请季。
            </p>
            <div className="mt-8 flex justify-center">
              <Link href="/questionnaire" className={cn(btnPrimary, "px-8 py-3")} aria-label="开启申请旅程，前往问卷">
                开启申请旅程
              </Link>
            </div>
          </div>
          <div className="mx-auto mt-10 w-full max-w-5xl md:mt-12">
            {!coverFailed ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={BUDDYUP_COVER}
                alt="BuddyUp 产品界面预览"
                className="w-full rounded-xl border border-neutral-200/80 shadow-md"
                loading="lazy"
                onError={() => setCoverFailed(true)}
              />
            ) : (
              <div className="flex aspect-video w-full items-center justify-center rounded-xl border border-dashed border-neutral-200 bg-neutral-50 px-4 text-center text-sm text-neutral-600">
                封面暂无法加载。你可刷新页面，或前往{" "}
                <a href={BUDDYUP_SITE} className={cn("mx-1 font-medium underline", linkFocus)}>
                  官网
                </a>{" "}
                查看。
              </div>
            )}
          </div>
        </section>

        <section className="bg-neutral-100 px-4 py-14 sm:px-6 md:py-20" aria-labelledby="features-heading">
          <div className="mx-auto max-w-6xl">
            <div className="max-w-2xl">
              <h2 id="features-heading" className="text-3xl font-bold tracking-tight md:text-4xl">
                来认识一下 BuddyUp
              </h2>
              <p className="mt-3 text-base leading-relaxed text-neutral-600 md:text-lg">
                从初稿生成到按校优化，三块能力对应文书准备的主路径。
              </p>
            </div>
            <div className="mt-10 flex flex-col gap-8 md:mt-12 md:gap-10">
              <DisplayCard
                subtitle="智能生成"
                title="几分钟，完成你的个人陈述初稿"
                imageSrc={`${BUDDYUP_SITE}/static/home/个人信息档案.png`}
                descriptionList={[
                  {
                    title: "填写你的个人信息、学术背景与经历",
                    description: "系统自动整理并生成初稿",
                  },
                  {
                    title: "识别经历之间的关联",
                    description: "将零散素材串联成清晰、有逻辑的故事",
                  },
                  {
                    title: "根据目标院校与专业自动调整重点",
                    description: "匹配不同申请方向的写作风格",
                  },
                  {
                    title: "快速产出可编辑的初稿",
                    description: "从空白到完整，只需几分钟",
                  },
                ]}
              />
              <DisplayCard
                subtitle="顶尖院校优化"
                title="针对目标院校，精准调整个人陈述"
                rightPanel="school-badges"
                descriptionList={[
                  {
                    title: "内置世界排名前 30 院校信息",
                    description: "覆盖申请要求与官方偏好",
                  },
                  {
                    title: "聚焦院校真正看重的能力",
                    description: "强调思考过程、成长经历与批判性思维",
                  },
                  {
                    title: "按院校标准自动优化内容",
                    description: "匹配字数、结构与重点要求",
                  },
                  {
                    title: "确保符合申请标准",
                    description: "生成内容更贴近真实评审视角",
                  },
                ]}
              />
              <DisplayCard
                subtitle="智能润色"
                title="多种写作方式，一键对比优化"
                imageSrc={`${BUDDYUP_SITE}/static/home/ai智能文本修改建议.png`}
                descriptionList={[
                  {
                    title: "5 种智能润色方式",
                    description: "改写表达、同义替换、用数据说话、丰富或精简内容",
                  },
                  {
                    title: "支持中英对照翻译",
                    description: "方便逐句检查与校对",
                  },
                  {
                    title: "为不同院校生成不同版本",
                    description: "根据申请目标灵活调整",
                  },
                  {
                    title: "自动保存历史版本",
                    description: "随时对比，安心修改",
                  },
                ]}
              />
            </div>
          </div>
        </section>

        <section className="px-4 py-14 sm:px-6 md:py-20" aria-labelledby="trust-heading">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-col items-center gap-10 md:flex-row md:items-start md:justify-between md:gap-12">
              <div className="max-w-xl text-center md:text-left">
                <h2 id="trust-heading" className="text-3xl font-bold tracking-tight md:text-4xl">
                  专注内容，其余交给系统
                </h2>
                <p className="mt-3 text-base font-normal leading-relaxed text-neutral-600 md:mt-4 md:text-lg">
                  从安全到版本，能力拆成四块，方便对照你是否需要。
                </p>
              </div>
              <div className="flex flex-row items-center gap-0" aria-hidden>
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className={cn(
                      "size-20 rounded-full bg-gradient-to-br from-neutral-300 to-neutral-400 md:size-28",
                      i > 0 && "-ml-3 md:-ml-6"
                    )}
                  />
                ))}
              </div>
            </div>
            <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 md:mt-14 lg:grid-cols-4 lg:gap-6">
              <FeatureCard
                title="数据安全"
                description="本地存储，不上传服务器"
                icon={<ShieldCheck className="size-8 text-neutral-800" strokeWidth={1.75} />}
              />
              <FeatureCard
                title="多格式导出"
                description="支持 Word、Markdown 导出"
                icon={<FileText className="size-8 text-neutral-800" strokeWidth={1.75} />}
              />
              <FeatureCard
                title="版本管理"
                description="多版本对比，历史回溯"
                icon={<GitCompare className="size-8 text-neutral-800" strokeWidth={1.75} />}
              />
              <FeatureCard
                title="中英对照"
                description="实时翻译，方便检查"
                icon={<Languages className="size-8 text-neutral-800" strokeWidth={1.75} />}
              />
            </div>
          </div>
        </section>

        <section className="bg-neutral-100 px-4 py-14 sm:px-6 md:py-20" aria-labelledby="beta-heading">
          <div className="mx-auto max-w-6xl">
            <div className="max-w-2xl">
              <h2 id="beta-heading" className="text-3xl font-bold tracking-tight md:text-4xl">
                参与内测
              </h2>
              <p className="mt-3 text-base leading-relaxed text-neutral-600 md:text-lg">
                正式能力以内测渠道为准；也可先在本地跑通问卷与匹配流程。
              </p>
            </div>
            <div className="mt-8 grid grid-cols-1 gap-4 md:mt-10 md:grid-cols-2 md:gap-6">
              <div className="flex flex-col rounded-xl border border-neutral-200 bg-white p-6 md:row-span-2 md:p-8">
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">BuddyUp</p>
                <h3 className="mt-3 text-2xl font-bold tracking-tight text-neutral-900 md:text-3xl">开始使用</h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-600 md:text-base">
                  提交内测申请后，团队会按说明与你联系；与官网流程一致。
                </p>
                <a href={BUDDYUP_BETA_FORM} target="_blank" rel="noreferrer" className={cn(btnPrimary, "mt-6 w-fit")} aria-label="直接参与内测（在新标签页打开）">
                  直接参与内测
                </a>
              </div>
              <FeatureCard
                title="抢先体验资格"
                description="第一时间体验智能生成、多版本管理与智能润色"
                icon={<Rocket className="size-8 text-neutral-800" strokeWidth={1.75} />}
              />
              <FeatureCard
                title="优先支持"
                description="遇到问题时，优先获得帮助与支持"
                icon={<Headset className="size-8 text-neutral-800" strokeWidth={1.75} />}
              />
            </div>
          </div>
        </section>
      </main>

      <footer className="mt-auto border-t border-neutral-100 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 md:py-12">
          <div className="flex flex-col gap-10 md:flex-row md:justify-between">
            <div className="max-w-xs">
              <p className="font-semibold text-neutral-900">BuddyUp</p>
              <p className="mt-2 text-sm leading-relaxed text-neutral-600">AI 驱动的留学文书助手，陪你走完申请季。</p>
            </div>
            <nav className="grid flex-1 grid-cols-2 gap-x-8 gap-y-8 sm:grid-cols-3 lg:max-w-2xl" aria-label="页脚">
              <div>
                <p className="text-xs font-semibold text-neutral-900">探索</p>
                <ul className="mt-3 space-y-2 text-sm">
                  <li>
                    <a href={`${BUDDYUP_SITE}/pricing`} target="_blank" rel="noreferrer" className={cn("text-neutral-600 hover:text-neutral-900", linkFocus)}>
                      定价
                    </a>
                  </li>
                  <li>
                    <a href={`${BUDDYUP_SITE}/blog`} target="_blank" rel="noreferrer" className={cn("text-neutral-600 hover:text-neutral-900", linkFocus)}>
                      博客
                    </a>
                  </li>
                  <li>
                    <a href={BUDDYUP_REPO} target="_blank" rel="noreferrer" className={cn("inline-flex items-center gap-1 text-neutral-600 hover:text-neutral-900", linkFocus)}>
                      官网源码
                      <ExternalLink className="h-3 w-3 opacity-70" aria-hidden />
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <p className="text-xs font-semibold text-neutral-900">合规</p>
                <ul className="mt-3 space-y-2 text-sm">
                  <li>
                    <a href={`${BUDDYUP_SITE}/legal/terms`} target="_blank" rel="noreferrer" className={cn("text-neutral-600 hover:text-neutral-900", linkFocus)}>
                      免责声明
                    </a>
                  </li>
                  <li>
                    <a href={`${BUDDYUP_SITE}/legal/privacy`} target="_blank" rel="noreferrer" className={cn("text-neutral-600 hover:text-neutral-900", linkFocus)}>
                      隐私政策
                    </a>
                  </li>
                  <li>
                    <a
                      href={`${BUDDYUP_SITE}/legal/user-agreement`}
                      target="_blank"
                      rel="noreferrer"
                      className={cn("text-neutral-600 hover:text-neutral-900", linkFocus)}
                    >
                      用户协议
                    </a>
                  </li>
                </ul>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <p className="text-xs font-semibold text-neutral-900">联系</p>
                <ul className="mt-3 space-y-2 text-sm">
                  <li>
                    <a href={`${BUDDYUP_SITE}/contact`} target="_blank" rel="noreferrer" className={cn("text-neutral-600 hover:text-neutral-900", linkFocus)}>
                      官网联系
                    </a>
                  </li>
                  <li>
                    <a href={BUDDYUP_CONTACT} className={cn("break-all text-neutral-600 hover:text-neutral-900", linkFocus)}>
                      contact@buddyup.studio
                    </a>
                  </li>
                </ul>
              </div>
            </nav>
          </div>
          <p className="mt-10 border-t border-neutral-100 pt-6 text-center text-xs text-neutral-500">
            © {new Date().getFullYear()} BuddyUp · 页面布局参考{" "}
            <a href={BUDDYUP_REPO} className={cn("underline decoration-neutral-300 underline-offset-2", linkFocus)}>
              BingyanStudio/Buddyup-website
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
