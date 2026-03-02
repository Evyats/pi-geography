import { useCallback, useRef, useState, type MouseEvent as ReactMouseEvent } from "react";
import type { GeoJsonObject } from "geojson";
import type { Map as LeafletMap } from "leaflet";
import { motion } from "motion/react";

import { MapSection } from "@/components/game/MapSection";
import { SidebarPanel } from "@/components/game/SidebarPanel";
import { GameLayout } from "@/components/layout/GameLayout";
import { INITIAL_CENTER, INITIAL_ZOOM } from "@/game/constants";
import { colorFromIndex } from "@/game/map-coloring";
import type { LocalityFeature } from "@/game/types";
import { useCityListMapEffects } from "@/hooks/useCityListMapEffects";
import { useDebugBridge } from "@/hooks/useDebugBridge";
import { useDocumentTheme } from "@/hooks/useDocumentTheme";
import { useGameData } from "@/hooks/useGameData";
import { useGameSession } from "@/hooks/useGameSession";

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showCityList, setShowCityList] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>(INITIAL_CENTER);
  const [mapZoom, setMapZoom] = useState(INITIAL_ZOOM);

  const mapRef = useRef<LeafletMap | null>(null);

  const {
    settings,
    setSettings,
    warningText,
    citySearch,
    setCitySearch,
    bestMatchedCityId,
    displayedCityEntries,
    cityEntriesForCurrentSettings,
    currentPool,
    segmentOptions,
    segmentMinCount,
    segmentMaxCount,
    usingSegmentedDifficulty,
    startDisabled,
    visibleDataset,
    featureIndex,
    fullFeatureIndex,
    featureCenterById,
    runtimeColorById,
    activeDatasetKey,
    activeDataset,
  } = useGameData();

  const {
    session,
    feedbackText,
    feedbackTone,
    showContinueHint,
    questionText,
    leftScreen,
    currentTargetName,
    onStartGame,
    handleCityClick,
    continueAfterAnswer,
    onStopGame,
    goToHomeScreen,
    onReplayCurrentSettings,
  } = useGameSession({ currentPool, fullFeatureIndex, featureCenterById });

  useDocumentTheme(isDarkMode);
  useCityListMapEffects({
    showCityList,
    setShowCityList,
    setCitySearch,
    mapRef,
    leftScreen,
    bestMatchedCityId,
    featureIndex,
  });
  useDebugBridge({
    session,
    settings,
    leftScreen,
    fullFeatureIndex,
    mapZoom,
    mapCenter,
    visibleCount: featureIndex.size,
  });

  const closeCityListAndResetSearch = useCallback(() => {
    setShowCityList(false);
    setCitySearch("");
  }, [setCitySearch]);

  const styleFeature = useCallback(
    (feature?: LocalityFeature) => {
      if (!feature) return {};
      const id = feature.properties.id;
      const runtimeColor = runtimeColorById.get(id);
      const colorSeed = typeof runtimeColor === "number" ? runtimeColor : Number(feature.properties.color_index ?? 0);

      const base = {
        color: "transparent",
        weight: 0,
        fillColor: colorFromIndex(colorSeed),
        fillOpacity: 1,
        className: "",
      };

      const isLocked = session.status === "locked";
      const isTarget = session.currentTargetId === id;
      const isSelected = session.selectedFeatureId === id;
      const isCorrectSelection = session.currentTargetId === session.selectedFeatureId;

      if (isLocked && isTarget && isCorrectSelection) {
        return { ...base, color: "#15b86a", weight: 2.6, fillOpacity: 1, className: "city-hit-correct" };
      }
      if (isLocked && isTarget && !isCorrectSelection) {
        return { ...base, color: "#16a34a", weight: 2.6, fillOpacity: 1, className: "city-target-correct" };
      }
      if (isLocked && isSelected && !isCorrectSelection) {
        return { ...base, color: "#e23b3b", weight: 2.6, fillOpacity: 1, className: "city-hit-wrong" };
      }
      if (leftScreen === "home" && showCityList && bestMatchedCityId === id) {
        return { ...base, color: "#f59e0b", weight: 3, fillOpacity: 1, className: "city-search-highlight" };
      }
      return base;
    },
    [bestMatchedCityId, leftScreen, runtimeColorById, session.currentTargetId, session.selectedFeatureId, session.status, showCityList]
  );

  const mapDataset = activeDataset
    ? (visibleDataset as unknown as GeoJsonObject)
    : ({ type: "FeatureCollection", features: [] } as GeoJsonObject);
  const roundProgressPct = Math.max(0, Math.min(100, Math.round((session.currentIndex / session.totalQuestions) * 100)));

  return (
    <motion.div
      dir="rtl"
      className="h-[100dvh] overflow-hidden border border-white/15 p-2 text-ink sm:p-3 lg:p-4"
      style={{
        paddingTop: "max(0.5rem, env(safe-area-inset-top))",
        paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))",
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      onClickCapture={(event: ReactMouseEvent<HTMLDivElement>) => {
        if ((event.target as HTMLElement).closest("[data-no-continue='true']")) return;
        continueAfterAnswer();
      }}
    >
      <GameLayout
        map={
          <MapSection
            showStats={leftScreen === "play"}
            showHoverTooltips={leftScreen === "home"}
            session={session}
            roundProgressPct={roundProgressPct}
            mapCenter={mapCenter}
            mapZoom={mapZoom}
            onMapMove={({ center, zoom }) => {
              setMapCenter(center);
              setMapZoom(zoom);
            }}
            mapRef={mapRef}
            showCityList={showCityList}
            geoJsonKey={`${activeDatasetKey}-${settings.difficultySegmentIndex}-${currentPool.length}-${session.currentIndex}-${session.selectedFeatureId ?? "none"}-${session.currentTargetId ?? "none"}`}
            mapDataset={mapDataset}
            styleFeature={styleFeature}
            onCityClick={handleCityClick}
            isDarkMode={isDarkMode}
            onToggleTheme={() => setIsDarkMode((prev) => !prev)}
          />
        }
        panel={
          <SidebarPanel
            leftScreen={leftScreen}
            settings={settings}
            currentPoolLength={currentPool.length}
            segmentMinCount={segmentMinCount}
            segmentMaxCount={segmentMaxCount}
            usingSegmentedDifficulty={usingSegmentedDifficulty}
            segmentOptions={segmentOptions}
            onDifficultySegmentChange={(segmentIndex) =>
              setSettings((prev) => ({
                ...prev,
                difficultySegmentIndex: segmentIndex,
              }))
            }
            onToggleCityList={() => setShowCityList((prev) => !prev)}
            onSetIncludeTerritories={(includeTerritories) =>
              setSettings((prev) => ({ ...prev, includeTerritories }))
            }
            startDisabled={startDisabled}
            warningText={warningText}
            onStartGame={() => {
              closeCityListAndResetSearch();
              onStartGame(startDisabled);
            }}
            currentTargetName={currentTargetName}
            questionText={questionText}
            feedbackText={feedbackText}
            feedbackTone={feedbackTone}
            showContinueHint={showContinueHint && session.status === "locked"}
            onStopGame={() => {
              closeCityListAndResetSearch();
              onStopGame();
            }}
            score={session.score}
            onGoHome={() => {
              closeCityListAndResetSearch();
              goToHomeScreen();
            }}
            onReplay={() => {
              closeCityListAndResetSearch();
              onReplayCurrentSettings(startDisabled);
            }}
            showCityList={showCityList}
            citySearch={citySearch}
            onCitySearchChange={setCitySearch}
            cityEntriesForCurrentSettingsCount={cityEntriesForCurrentSettings.length}
            displayedCityEntries={displayedCityEntries}
            bestMatchedCityId={bestMatchedCityId}
            onCloseCityList={() => setShowCityList(false)}
          />
        }
      />

    </motion.div>
  );
}
