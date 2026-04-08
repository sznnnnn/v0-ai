"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
          <Link href="/" className="text-lg font-semibold tracking-tight text-foreground">
            EduMatch
          </Link>
          <nav className="flex items-center gap-8">
            <Link 
              href="#features" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              功能
            </Link>
            <Link 
              href="#steps" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              流程
            </Link>
            <Link href="/questionnaire">
              <Button size="sm" className="h-8">
                开始使用
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="px-6 py-24 lg:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-4 text-sm font-medium tracking-wider text-muted-foreground uppercase">
            AI-Powered Study Abroad Matching
          </p>
          <h1 className="mb-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl text-balance">
            找到最适合你的留学项目
          </h1>
          <p className="mx-auto mb-10 max-w-xl text-lg text-muted-foreground leading-relaxed">
            基于 AI 分析你的背景，精准匹配 5-8 所学校的 12-15 个项目，冲刺、主申、保底三档规划。
          </p>
          <div className="flex flex-col items-center gap-4">
            <Link href="/questionnaire">
              <Button size="lg" className="h-11 px-8">
                开始智能匹配
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <p className="text-sm text-muted-foreground">
              无需注册，数据仅保存在本地
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t border-border px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-12 text-center text-2xl font-semibold text-foreground">
            核心功能
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="space-y-3">
              <h3 className="text-base font-medium text-foreground">
                AI 智能匹配
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                根据你的背景、成绩和目标，AI 分析并推荐最适合的学校和项目组合。
              </p>
            </div>
            <div className="space-y-3">
              <h3 className="text-base font-medium text-foreground">
                三档规划
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                冲刺 2 所、主申 3-4 所、保底 2 所，科学分配确保申请成功率。
              </p>
            </div>
            <div className="space-y-3">
              <h3 className="text-base font-medium text-foreground">
                STAR 法则引导
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                AI 引导你用 STAR 法则撰写项目经历，提升申请材料的专业性。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section id="steps" className="border-t border-border px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-12 text-center text-2xl font-semibold text-foreground">
            使用流程
          </h2>
          <div className="grid gap-6 md:grid-cols-4">
            {[
              { step: "01", title: "填写基本信息", desc: "个人信息与留学目标" },
              { step: "02", title: "完善教育背景", desc: "学历、成绩与标化" },
              { step: "03", title: "补充软性背景", desc: "实习、项目、荣誉" },
              { step: "04", title: "获取匹配结果", desc: "AI 推荐院校项目" },
            ].map((item) => (
              <div key={item.step} className="space-y-3">
                <span className="text-xs font-medium text-muted-foreground">
                  {item.step}
                </span>
                <h3 className="text-base font-medium text-foreground">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border bg-muted/30 px-6 py-20">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="mb-4 text-2xl font-semibold text-foreground">
            开始你的留学规划
          </h2>
          <p className="mb-8 text-muted-foreground">
            7 步完成背景填写，AI 即刻生成个性化推荐
          </p>
          <Link href="/questionnaire">
            <Button size="lg" className="h-11 px-8">
              立即开始
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-8">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <span className="text-sm font-medium text-foreground">EduMatch</span>
          <span className="text-sm text-muted-foreground">
            AI 智能留学匹配平台
          </span>
        </div>
      </footer>
    </div>
  );
}
