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

function FitBounds({ pins }: { pins: WorkspaceMapPin[] }) {
  const map = useMap();
  const sig = pins.map((p) => `${p.schoolId}:${p.lat}:${p.lng}`).join("|");

  useEffect(() => {
    const positions = pins.map((p) => [p.lat, p.lng] as [number, number]);
    if (positions.length === 0) return;
    if (positions.length === 1) {
      map.setView(positions[0], 4);
      return;
    }
    map.fitBounds(L.latLngBounds(positions), { padding: [40, 40], maxZoom: 8 });
  }, [map, sig, pins.length]);

  return null;
}

export function WorkspaceApplicationsMapImpl({
  pins,
  onSelectSchool,
  className,
}: {
  pins: WorkspaceMapPin[];
  onSelectSchool?: (schoolId: string) => void;
  /** 嵌入卡片等场景下可去掉外框、改圆角 */
  className?: string;
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
    <div className={cn("w-full max-w-[340px] space-y-2", className)}>
      <div className="aspect-square w-full overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <MapContainer
          center={center}
          zoom={pins.length === 1 ? 4 : 2}
          className="isolate z-0 h-full w-full [&_.leaflet-control-attribution]:max-w-[min(100%,160px)] [&_.leaflet-control-attribution]:whitespace-normal [&_.leaflet-control-attribution]:text-[9px] [&_.leaflet-control-attribution]:leading-snug"
          scrollWheelZoom
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <FitBounds pins={pins} />
          {pins.map((pin) => (
            <CircleMarker
              key={pin.schoolId}
              center={[pin.lat, pin.lng]}
              radius={Math.min(8 + pin.programCount * 2, 18)}
              pathOptions={{
                color: activeSchoolId === pin.schoolId ? "#0f766e" : "#0ea5a4",
                fillColor: activeSchoolId === pin.schoolId ? "#14b8a6" : "#5eead4",
                fillOpacity: 0.82,
                weight: activeSchoolId === pin.schoolId ? 2.5 : 2,
              }}
              eventHandlers={{
                click: () => setActiveSchoolId(pin.schoolId),
              }}
            />
          ))}
        </MapContainer>
      </div>
      {activePin ? (
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
