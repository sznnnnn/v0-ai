"use client";

import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { cn } from "@/lib/utils";
import { SchoolLogoMark } from "@/components/match/school-logo-mark";

export type WorkspaceMapPin = {
  schoolId: string;
  name: string;
  nameEn: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
  programCount: number;
  logo?: string;
};

/** Grid / dynamic 加载后容器宽常仍为 0，Leaflet 会按错误尺寸排版并盖住邻列；需随尺寸变化 invalidate。 */
function MapInvalidateSize() {
  const map = useMap();

  useEffect(() => {
    let cancelled = false;
    let n = 0;
    const run = () => {
      if (cancelled) return;
      map.invalidateSize({ pan: false });
      n += 1;
      if (n < 4) requestAnimationFrame(run);
    };
    requestAnimationFrame(run);
    return () => {
      cancelled = true;
    };
  }, [map]);

  useEffect(() => {
    const parent = map.getContainer().parentElement;
    if (!parent) return;
    const ro = new ResizeObserver(() => {
      map.invalidateSize({ pan: false });
    });
    ro.observe(parent);
    return () => ro.disconnect();
  }, [map]);

  return null;
}

function FitBounds({ pins, compact }: { pins: WorkspaceMapPin[]; compact?: boolean }) {
  const map = useMap();
  const sig = pins.map((p) => `${p.schoolId}:${p.lat}:${p.lng}`).join("|");

  useEffect(() => {
    const positions = pins.map((p) => [p.lat, p.lng] as [number, number]);
    if (positions.length === 0) return;
    map.invalidateSize({ pan: false });
    const pad = compact ? [10, 10] as [number, number] : ([40, 40] as [number, number]);
    const maxZ = compact ? 5 : 8;
    if (positions.length === 1) {
      map.setView(positions[0], compact ? 3 : 4);
      return;
    }
    map.fitBounds(L.latLngBounds(positions), { padding: pad, maxZoom: maxZ });
  }, [map, sig, pins.length, compact]);

  return null;
}

export function WorkspaceApplicationsMapImpl({
  pins,
  onSelectSchool,
  className,
  compact,
}: {
  pins: WorkspaceMapPin[];
  onSelectSchool?: (schoolId: string) => void;
  /** 嵌入卡片等场景下可去掉外框、改圆角 */
  className?: string;
  /** 与 KPI 卡片同级的迷你地图：无下方详情、无方形大图比例 */
  compact?: boolean;
}) {
  const fallbackCenter: [number, number] = [20, 10];
  const center: [number, number] =
    pins.length === 1 ? [pins[0].lat, pins[0].lng] : fallbackCenter;
  const [activeSchoolId, setActiveSchoolId] = useState<string | null>(pins[0]?.schoolId ?? null);

  useEffect(() => {
    if (pins.length === 0) {
      setActiveSchoolId(null);
      return;
    }
    if (activeSchoolId && pins.some((p) => p.schoolId === activeSchoolId)) return;
    setActiveSchoolId(pins[0].schoolId);
  }, [pins, activeSchoolId]);

  const activePin = useMemo(
    () => pins.find((pin) => pin.schoolId === activeSchoolId) ?? null,
    [pins, activeSchoolId]
  );

  return (
    <div
      className={cn(
        compact ? "h-full w-full max-w-full overflow-hidden" : "w-full max-w-[340px] space-y-2",
        className
      )}
    >
      <div
        className={cn(
          "w-full overflow-hidden bg-card",
          compact
            ? "h-full rounded-none border-0 shadow-none"
            : "aspect-square rounded-xl border border-border shadow-sm"
        )}
      >
        <MapContainer
          center={center}
          zoom={pins.length === 1 ? (compact ? 3 : 4) : compact ? 1 : 2}
          zoomControl={!compact}
          attributionControl={!compact}
          className={cn(
            "isolate z-0 h-full w-full",
            compact &&
              "[&_.leaflet-container]:!box-border [&_.leaflet-container]:h-full [&_.leaflet-container]:max-w-full [&_.leaflet-container]:w-full",
            !compact &&
              "[&_.leaflet-control-attribution]:max-w-[min(100%,160px)] [&_.leaflet-control-attribution]:whitespace-normal [&_.leaflet-control-attribution]:text-[9px] [&_.leaflet-control-attribution]:leading-snug"
          )}
          scrollWheelZoom={!compact}
        >
          <MapInvalidateSize />
          <TileLayer
            attribution={
              compact
                ? ""
                : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            }
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <FitBounds pins={pins} compact={compact} />
          {pins.map((pin) => (
            <CircleMarker
              key={pin.schoolId}
              center={[pin.lat, pin.lng]}
              radius={
                compact
                  ? Math.min(3 + pin.programCount * 1.2, 9)
                  : Math.min(8 + pin.programCount * 2, 18)
              }
              pathOptions={{
                color: activeSchoolId === pin.schoolId ? "#0f766e" : "#0ea5a4",
                fillColor: activeSchoolId === pin.schoolId ? "#14b8a6" : "#5eead4",
                fillOpacity: 0.82,
                weight: activeSchoolId === pin.schoolId ? 2.5 : 2,
              }}
              eventHandlers={{
                click: () => {
                  setActiveSchoolId(pin.schoolId);
                  if (compact && onSelectSchool) onSelectSchool(pin.schoolId);
                },
              }}
            />
          ))}
        </MapContainer>
      </div>
      {!compact && activePin ? (
        <div className="rounded-lg border border-border/70 bg-background/90 px-2.5 py-2 text-left">
          <div className="flex items-start gap-2">
            <SchoolLogoMark
              school={{ name: activePin.name, nameEn: activePin.nameEn, logo: activePin.logo }}
              size="row"
              rounded="md"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold leading-tight text-foreground">{activePin.name}</p>
              <p className="truncate text-ui-label text-muted-foreground">{activePin.nameEn}</p>
              <p className="mt-0.5 text-ui-label text-muted-foreground">
                {activePin.city} · {activePin.country}
              </p>
            </div>
          </div>
          <div className="mt-2 flex items-center justify-between gap-2">
            <p className="text-ui-label tabular-nums text-foreground/85">{activePin.programCount} 个项目</p>
            {onSelectSchool ? (
              <button
                type="button"
                className="rounded-md bg-teal-700 px-2 py-1 text-ui-label font-medium text-white hover:bg-teal-800"
                onClick={() => onSelectSchool(activePin.schoolId)}
              >
                查看该校
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
