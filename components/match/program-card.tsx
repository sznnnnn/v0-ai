"use client";

import { Clock, DollarSign, Calendar, Plus, Check, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { Program, School } from "@/lib/types";
import { useState } from "react";

interface ProgramCardProps {
  program: Program;
  school: School;
  isAdded?: boolean;
  onAdd?: () => void;
  onRemove?: () => void;
}

const categoryLabels = {
  reach: { label: "冲刺", color: "bg-orange-100 text-orange-700" },
  match: { label: "主申", color: "bg-blue-100 text-blue-700" },
  safety: { label: "保底", color: "bg-green-100 text-green-700" },
};

export function ProgramCard({ program, school, isAdded, onAdd, onRemove }: ProgramCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const category = categoryLabels[program.category];
  
  return (
    <div className={cn(
      "rounded-xl border bg-card overflow-hidden transition-all",
      isAdded ? "border-primary" : "border-border"
    )}>
      <div className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Badge variant="secondary" className={category.color}>
                {category.label}
              </Badge>
              <Badge variant="outline">{program.degree}</Badge>
            </div>
            
            <h3 className="font-semibold text-foreground">{program.name}</h3>
            <p className="text-sm text-muted-foreground">{program.nameEn}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {school.name} · {program.department}
            </p>
          </div>
          
          <div className="text-right shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-primary">{program.matchScore}</span>
              <span className="text-sm text-muted-foreground">分</span>
            </div>
            <p className="text-xs text-muted-foreground">匹配度</p>
          </div>
        </div>
        
        <div className="mt-3">
          <Progress value={program.matchScore} className="h-2" />
        </div>
        
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{program.duration}</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>截止 {program.deadline.split("-").slice(1).join("/")}</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground col-span-2 sm:col-span-2">
            <DollarSign className="h-4 w-4" />
            <span className="truncate">{program.tuition}</span>
          </div>
        </div>
        
        {/* 匹配原因 */}
        {program.matchReasons.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {program.matchReasons.slice(0, 3).map((reason, index) => (
              <Badge key={index} variant="outline" className="text-xs bg-muted/50">
                {reason}
              </Badge>
            ))}
          </div>
        )}
      </div>
      
      {/* 展开详情 */}
      <div className="border-t border-border">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-center gap-1 py-2 text-sm text-muted-foreground hover:bg-muted/50 transition-colors"
        >
          {isExpanded ? (
            <>
              收起详情 <ChevronUp className="h-4 w-4" />
            </>
          ) : (
            <>
              查看详情 <ChevronDown className="h-4 w-4" />
            </>
          )}
        </button>
        
        {isExpanded && (
          <div className="px-4 pb-4 space-y-4 border-t border-border pt-4">
            <div>
              <p className="text-sm font-medium text-foreground mb-2">项目简介</p>
              <p className="text-sm text-muted-foreground">{program.description}</p>
            </div>
            
            <div>
              <p className="text-sm font-medium text-foreground mb-2">申请要求</p>
              <ul className="space-y-1">
                {program.requirements.map((req, index) => (
                  <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    {req}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="flex items-center justify-between pt-2">
              <p className="text-sm text-muted-foreground">
                申请费: {program.applicationFee}
              </p>
              
              {isAdded ? (
                <Button variant="outline" size="sm" onClick={onRemove}>
                  <Check className="mr-1.5 h-4 w-4" />
                  已添加
                </Button>
              ) : (
                <Button size="sm" onClick={onAdd}>
                  <Plus className="mr-1.5 h-4 w-4" />
                  添加到申请单
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
