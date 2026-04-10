"use client";

import { useState } from "react";
import { Landmark } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import type { PersonalInfo } from "@/lib/types";

interface TargetPreferencesFormProps {
  data: PersonalInfo;
  onChange: (data: PersonalInfo) => void;
}

const targetCountries = [
  { value: "us", label: "美国", emoji: "🇺🇸" },
  { value: "uk", label: "英国", emoji: "🇬🇧" },
  { value: "au", label: "澳大利亚", emoji: "🇦🇺" },
  { value: "sg", label: "新加坡", emoji: "🇸🇬" },
  { value: "hk", label: "中国香港", emoji: "🇭🇰" },
];

const UNDECIDED = "undecided" as const;

function isRegionUndecided(target: string[] | undefined): boolean {
  return target?.length === 1 && target[0] === UNDECIDED;
}

export function TargetPreferencesForm({ data, onChange }: TargetPreferencesFormProps) {
  const [countryView, setCountryView] = useState<"cards" | "map">("cards");

  const handleChange = (field: keyof PersonalInfo, value: string | string[]) => {
    onChange({ ...data, [field]: value });
  };

  const toggleCountry = (country: string) => {
    const current = (data.targetCountry || []).filter((c) => c !== UNDECIDED);
    const updated = current.includes(country)
      ? current.filter((c) => c !== country)
      : [...current, country];
    handleChange("targetCountry", updated);
  };

  const selectUndecidedRegion = () => {
    handleChange("targetCountry", [UNDECIDED]);
  };

  const selectCountryListView = () => {
    setCountryView("cards");
  };

  const selectCountryMapView = () => {
    setCountryView("map");
    const tc = data.targetCountry || [];
    if (tc.includes(UNDECIDED)) {
      handleChange("targetCountry", []);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3 border-b border-border pb-4">
        <Landmark className="h-5 w-5 text-muted-foreground" />
        <h2 className="text-lg font-semibold text-foreground">意向偏好</h2>
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-sm font-medium text-foreground">意向院校</h3>
          <span className="text-xs text-muted-foreground">已有目标可直接写，选填</span>
        </div>
        <p className="text-xs leading-relaxed text-muted-foreground">
          支持中英文校名；多个请<strong className="font-medium text-foreground/80">换行</strong>
          或用顿号、逗号分隔。会在当前演示院校库中尽量识别并
          <strong className="font-medium text-foreground/80">优先纳入匹配</strong>
          ，库外名称也会保留在档案中。
        </p>
        <Textarea
          placeholder={"例如：\nMIT\nStanford\n香港大学"}
          value={data.knownTargetSchools}
          onChange={(e) => handleChange("knownTargetSchools", e.target.value)}
          rows={4}
          className="min-h-[5.5rem] resize-y border-border/80 bg-transparent text-sm shadow-none focus-visible:ring-1"
        />
      </div>

      <div className="space-y-4 border-t border-border pt-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <label className="text-xs text-muted-foreground">地区</label>
            <div className="inline-flex flex-wrap rounded-md border border-border bg-muted/20 p-0.5">
              <button
                type="button"
                onClick={selectCountryListView}
                className={`rounded px-2 py-1 text-xs transition-colors ${
                  countryView === "cards"
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted/40"
                }`}
              >
                列表
              </button>
              <button
                type="button"
                onClick={selectCountryMapView}
                className={`rounded px-2 py-1 text-xs transition-colors ${
                  countryView === "map"
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted/40"
                }`}
              >
                地图
              </button>
            </div>
          </div>
          {data.targetCountry?.length > 0 && (
            <span className="text-xs text-muted-foreground/70">
              {isRegionUndecided(data.targetCountry) ? "尚未确定地区" : `${data.targetCountry.length} 已选`}
            </span>
          )}
        </div>

        {countryView === "cards" ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {targetCountries.map((country) => (
                <button
                  type="button"
                  key={country.value}
                  onClick={() => toggleCountry(country.value)}
                  className={`flex items-center gap-3 rounded-lg border px-3 py-3 text-left transition-colors ${
                    data.targetCountry?.includes(country.value)
                      ? "border-foreground/50 bg-muted/50"
                      : "border-border hover:border-foreground/25 hover:bg-muted/30"
                  }`}
                >
                  <span className="text-lg leading-none">{country.emoji}</span>
                  <div className="flex-1">
                    <p className="text-sm text-foreground">{country.label}</p>
                    <p className="text-xs text-muted-foreground/65">{data.targetCountry?.includes(country.value) ? "已选" : ""}</p>
                  </div>
                </button>
              ))}
            </div>
            <div className="border-t border-border/70 pt-4">
              <p className="ui-section-heading mb-2 uppercase tracking-wider">其他</p>
              <button
                type="button"
                onClick={selectUndecidedRegion}
                className={`w-full rounded-lg border px-3 py-3 text-left transition-colors ${
                  isRegionUndecided(data.targetCountry)
                    ? "border-foreground/50 bg-muted/50"
                    : "border-dashed border-border bg-muted/10 hover:border-foreground/25 hover:bg-muted/25"
                }`}
              >
                <p className="text-sm text-foreground">还没确定</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  生成匹配时<strong className="font-medium text-foreground/80">不按国家/地区筛选</strong>
                  ，可先浏览更广范围的学校；之后仍可改选具体国家或使用地图。
                </p>
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-border/80 bg-card/90 p-4">
            <div className="relative h-[260px] w-full overflow-hidden rounded-lg bg-muted/30">
              <svg viewBox="0 0 1000 500" className="h-full w-full opacity-60" aria-hidden="true">
                <path d="M92 180l70-58 120 18 65-34 110 30 33 58 92 20 30 42-22 38-84 11-70 56-94-18-55-48-88-12-58-44z" fill="currentColor" className="text-muted-foreground/40" />
                <path d="M568 142l118-66 125 16 80 48 43 83-36 60-140 8-109-30-73-50z" fill="currentColor" className="text-muted-foreground/40" />
                <path d="M753 304l74 22 54 72-52 66-84-16-22-78z" fill="currentColor" className="text-muted-foreground/40" />
              </svg>

              {[
                { value: "us", left: "23%", top: "44%" },
                { value: "uk", left: "47%", top: "33%" },
                { value: "au", left: "83%", top: "76%" },
                { value: "sg", left: "74%", top: "62%" },
                { value: "hk", left: "78%", top: "53%" },
              ].map((point) => {
                const country = targetCountries.find((c) => c.value === point.value);
                if (!country) return null;
                const selected = data.targetCountry?.includes(country.value);

                return (
                  <button
                    key={country.value}
                    type="button"
                    onClick={() => toggleCountry(country.value)}
                    style={{ left: point.left, top: point.top }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full border px-2 py-1 text-xs transition-all ${
                      selected
                        ? "border-foreground bg-foreground text-background"
                        : "border-border bg-background/95 text-foreground hover:border-foreground/40"
                    }`}
                    title={country.label}
                  >
                    <span className="mr-1">{country.emoji}</span>
                    {country.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
