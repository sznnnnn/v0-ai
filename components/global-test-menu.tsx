"use client";

import { usePathname, useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/** 主工作台侧栏已有完整「测试」菜单，避免重复 */
export function GlobalTestMenu() {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === "/workspace") {
    return null;
  }

  const goWorkspace = (test: string) => {
    router.push(`/workspace?test=${encodeURIComponent(test)}`);
  };

  return (
    <div className="fixed bottom-4 right-4 z-[100] md:bottom-6 md:right-6">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="flex items-center gap-2 rounded-full border border-border bg-background/95 px-3 py-2 text-xs text-muted-foreground shadow-md backdrop-blur transition-colors hover:bg-interactive-hover hover:text-foreground data-[state=open]:bg-interactive-hover data-[state=open]:text-foreground"
            aria-label="测试：跳转界面与演示"
          >
            <Sparkles className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
            <span>测试</span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          side="top"
          align="end"
          className="max-h-[min(70vh,420px)] w-[min(calc(100vw-2rem),17.5rem)] overflow-y-auto"
        >
          <DropdownMenuLabel className="text-[10px] font-normal uppercase tracking-wide text-muted-foreground">
            工作台内
          </DropdownMenuLabel>
          <DropdownMenuItem onClick={() => goWorkspace("spotlight")}>主页 · 工作台引导（重播）</DropdownMenuItem>
          <DropdownMenuItem onClick={() => goWorkspace("home")}>主页</DropdownMenuItem>
          <DropdownMenuItem onClick={() => goWorkspace("applications")}>主页 · 申请列表</DropdownMenuItem>
          <DropdownMenuItem onClick={() => goWorkspace("background")}>我的背景</DropdownMenuItem>
          <DropdownMenuItem onClick={() => goWorkspace("school")}>学校视图（首个学校）</DropdownMenuItem>
          <DropdownMenuItem onClick={() => goWorkspace("program")}>项目详情（首个项目）</DropdownMenuItem>
          <DropdownMenuItem onClick={() => goWorkspace("write")}>文书编辑（首个项目）</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel className="text-[10px] font-normal uppercase tracking-wide text-muted-foreground">
            其他页面
          </DropdownMenuLabel>
          <DropdownMenuItem onClick={() => router.push("/")}>落地页</DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push("/questionnaire")}>问卷</DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push("/match?replaySpotlight=1")}>
            匹配页 · 气泡引导（重播）
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push("/match")}>匹配</DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push("/background")}>背景页</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
