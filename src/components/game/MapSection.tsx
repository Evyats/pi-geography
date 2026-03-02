import { useEffect, useMemo, useRef, useState, type MutableRefObject } from "react";
import type { GeoJsonObject } from "geojson";
import { geoJSON as leafletGeoJson, latLngBounds, type Map as LeafletMap } from "leaflet";
import { GeoJSON, MapContainer, TileLayer, useMapEvents } from "react-leaflet";
import { AnimatePresence, motion } from "motion/react";

import { ProgressHudCard } from "@/components/game/map-hud/ProgressHudCard";
import { ScoreHudCard } from "@/components/game/map-hud/ScoreHudCard";
import { ThemeToggleMapButton } from "@/components/game/map-hud/ThemeToggleMapButton";
import { cardMotion } from "@/game/constants";
import type { LocalityFeature, SessionState } from "@/game/types";

type MapSectionProps = {
  showStats: boolean;
  showHoverTooltips: boolean;
  session: SessionState;
  roundProgressPct: number;
  mapCenter: [number, number];
  mapZoom: number;
  onMapMove: (payload: { center: [number, number]; zoom: number }) => void;
  mapRef: MutableRefObject<LeafletMap | null>;
  showCityList: boolean;
  geoJsonKey: string;
  mapDataset: GeoJsonObject;
  styleFeature: (feature?: LocalityFeature) => Record<string, unknown>;
  onCityClick: (featureId: string) => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
};

function MapEvents({
  onMove,
}: {
  onMove: (payload: { center: [number, number]; zoom: number }) => void;
}) {
  useMapEvents({
    moveend(e) {
      const center = e.target.getCenter();
      onMove({ center: [center.lat, center.lng], zoom: e.target.getZoom() });
    },
  });
  return null;
}

function MapResizeController({ trigger }: { trigger: unknown }) {
  const map = useMapEvents({});
  useEffect(() => {
    map.invalidateSize();
  }, [map, trigger]);
  return null;
}

export function MapSection({
  showStats,
  showHoverTooltips,
  session,
  roundProgressPct,
  mapCenter,
  mapZoom,
  onMapMove,
  mapRef,
  showCityList,
  geoJsonKey,
  mapDataset,
  styleFeature,
  onCityClick,
  isDarkMode,
  onToggleTheme,
}: MapSectionProps) {
  const featureById = useMemo(() => {
    const map = new Map<string, LocalityFeature>();
    const data = mapDataset as { features?: LocalityFeature[] };
    (data.features ?? []).forEach((feature) => {
      map.set(feature.properties.id, feature);
    });
    return map;
  }, [mapDataset]);

  const wrongFitKeyRef = useRef<string | null>(null);
  const [displayScore, setDisplayScore] = useState(session.score);
  const animatedScoreRef = useRef(session.score);

  useEffect(() => {
    const selectedId = session.selectedFeatureId;
    const targetId = session.currentTargetId;
    const isWrongSelection =
      session.status === "locked" &&
      selectedId !== null &&
      targetId !== null &&
      selectedId !== targetId;

    if (!isWrongSelection) {
      wrongFitKeyRef.current = null;
      return;
    }

    const fitKey = `${selectedId}-${targetId}`;
    if (wrongFitKeyRef.current === fitKey) return;

    const selectedFeature = featureById.get(selectedId);
    const targetFeature = featureById.get(targetId);
    if (!selectedFeature || !targetFeature || !mapRef.current) return;

    const selectedBounds = leafletGeoJson(selectedFeature as unknown as GeoJsonObject).getBounds();
    const targetBounds = leafletGeoJson(targetFeature as unknown as GeoJsonObject).getBounds();
    const merged = latLngBounds([
      [selectedBounds.getSouthWest().lat, selectedBounds.getSouthWest().lng],
      [selectedBounds.getNorthEast().lat, selectedBounds.getNorthEast().lng],
    ]);
    merged.extend(targetBounds);
    if (!merged.isValid()) return;

    const map = mapRef.current;
    const currentViewBounds = map.getBounds();
    if (currentViewBounds.contains(selectedBounds) && currentViewBounds.contains(targetBounds)) {
      wrongFitKeyRef.current = fitKey;
      return;
    }

    const padded = merged.pad(0.08);
    const requiredZoom = map.getBoundsZoom(padded, false);
    const currentZoom = map.getZoom();
    const targetZoom = Math.max(map.getMinZoom(), Math.min(currentZoom, requiredZoom));
    const center = padded.getCenter();

    if (targetZoom < currentZoom) {
      map.flyTo(center, targetZoom, { duration: 0.65 });
    } else {
      map.panTo(center, { animate: true, duration: 0.55 });
    }

    wrongFitKeyRef.current = fitKey;
  }, [featureById, mapRef, session.currentTargetId, session.selectedFeatureId, session.status]);

  useEffect(() => {
    const from = animatedScoreRef.current;
    const to = session.score;
    if (from === to) return;

    const startTime = performance.now();
    const duration = 520;
    let frameId = 0;

    const tick = (now: number) => {
      const t = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const value = Math.round(from + (to - from) * eased);
      setDisplayScore(value);

      if (t < 1) {
        frameId = window.requestAnimationFrame(tick);
        return;
      }
      animatedScoreRef.current = to;
      setDisplayScore(to);
    };

    frameId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frameId);
  }, [session.score]);

  return (
    <motion.section variants={cardMotion} className="relative min-h-0 overflow-hidden rounded-3xl border border-transparent bg-transparent">
      <ThemeToggleMapButton isDarkMode={isDarkMode} onToggleTheme={onToggleTheme} />

      <AnimatePresence>
        {showStats ? (
          <motion.div
            key="map-hud"
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="absolute right-2 top-2 z-[500] flex gap-2 sm:right-3 sm:top-3"
          >
            <ScoreHudCard score={session.score} displayScore={displayScore} />
            <ProgressHudCard roundProgressPct={roundProgressPct} />
          </motion.div>
        ) : null}
      </AnimatePresence>

      <MapContainer center={mapCenter} zoom={mapZoom} minZoom={6} maxZoom={13} attributionControl={false} className="h-full min-h-0" ref={mapRef}>
        <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MapEvents onMove={onMapMove} />
        <MapResizeController trigger={showCityList} />

        <GeoJSON
          key={geoJsonKey}
          data={mapDataset}
          style={(feature) => styleFeature(feature as LocalityFeature)}
          onEachFeature={(feature, layer) => {
            const typedFeature = feature as LocalityFeature;
            const cityId = typedFeature.properties.id;
            if (!showHoverTooltips) {
              layer.on("click", () => onCityClick(cityId));
            }
            if (showHoverTooltips) {
              layer.bindTooltip(typedFeature.properties.name_he, {
                sticky: true,
                direction: "auto",
                offset: [16, 16],
                className: "city-hover-tooltip",
              });
            }

            const isWrongSelection =
              session.status === "locked" &&
              session.selectedFeatureId !== null &&
              session.currentTargetId !== null &&
              session.selectedFeatureId !== session.currentTargetId;

            if (isWrongSelection && (cityId === session.selectedFeatureId || cityId === session.currentTargetId)) {
              layer.bindTooltip(typedFeature.properties.name_he, {
                permanent: true,
                direction: "top",
                sticky: false,
                offset: [0, -10],
                opacity: 1,
                className: "city-hover-tooltip",
              });
              if ("getBounds" in layer && typeof layer.getBounds === "function") {
                const center = layer.getBounds().getCenter();
                layer.openTooltip(center);
              }
            }
          }}
        />
      </MapContainer>
    </motion.section>
  );
}
