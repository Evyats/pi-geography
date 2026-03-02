import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";

import { CityListModal } from "@/components/game/CityListModal";
import { SetupControls } from "@/components/game/SetupControls";
import { Button } from "@/components/ui/button";
import type { SettingsState } from "@/game/types";

type Screen = "home" | "play" | "end";

type SidebarPanelProps = {
  leftScreen: Screen;
  settings: SettingsState;
  currentPoolLength: number;
  segmentMinCount: number;
  segmentMaxCount: number;
  usingSegmentedDifficulty: boolean;
  segmentOptions: Array<{ index: number; label: string; targetCount: number }>;
  onDifficultySegmentChange: (segmentIndex: number) => void;
  onToggleCityList: () => void;
  onSetIncludeTerritories: (includeTerritories: boolean) => void;
  startDisabled: boolean;
  warningText: string;
  onStartGame: () => void;
  currentTargetName: string | null;
  questionText: string;
  feedbackText: string;
  feedbackTone: "ok" | "bad" | "";
  showContinueHint: boolean;
  onStopGame: () => void;
  score: number;
  onGoHome: () => void;
  onReplay: () => void;
  showCityList: boolean;
  citySearch: string;
  onCitySearchChange: (value: string) => void;
  cityEntriesForCurrentSettingsCount: number;
  displayedCityEntries: Array<{ id: string; name: string; score?: number }>;
  bestMatchedCityId: string | null;
  onCloseCityList: () => void;
};

export function SidebarPanel({
  leftScreen,
  settings,
  currentPoolLength,
  segmentMinCount,
  segmentMaxCount,
  usingSegmentedDifficulty,
  segmentOptions,
  onDifficultySegmentChange,
  onToggleCityList,
  onSetIncludeTerritories,
  startDisabled,
  warningText,
  onStartGame,
  currentTargetName,
  questionText,
  feedbackText,
  feedbackTone,
  showContinueHint,
  onStopGame,
  score,
  onGoHome,
  onReplay,
  showCityList,
  citySearch,
  onCitySearchChange,
  cityEntriesForCurrentSettingsCount,
  displayedCityEntries,
  bestMatchedCityId,
  onCloseCityList,
}: SidebarPanelProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const screen: Screen = leftScreen === "play" || leftScreen === "end" || leftScreen === "home" ? leftScreen : "home";
  const wideButtonClass = "h-12 w-full max-w-[320px] rounded-full text-base font-bold";

  useEffect(() => {
    sectionRef.current?.scrollTo({ top: 0, behavior: "auto" });
  }, [screen]);

  return (
    <section
      ref={sectionRef}
      className="pointer-events-none flex min-h-0 flex-col gap-2 overflow-y-auto p-0 sm:gap-3 lg:pointer-events-auto lg:rounded-3xl lg:border lg:border-white/20 lg:bg-white/50 lg:p-4 lg:backdrop-blur-sm dark:lg:bg-white/10"
    >
      <header className="pointer-events-none relative px-3 text-center lg:px-0">
        {screen === "home" ? (
          <motion.div
            className="mx-auto mb-2 grid h-12 w-12 place-items-center rounded-full border border-primary/65 bg-primary/45 text-xl lg:hidden"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
          >
            📍
          </motion.div>
        ) : null}
        <motion.div
          className="mx-auto mb-3 hidden h-14 w-14 place-items-center rounded-full border border-primary/40 bg-primary/20 text-2xl lg:grid"
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
        >
          📍
        </motion.div>
        <h1 className="hidden text-4xl font-extrabold lg:block">משחק מיקום ערים בישראל</h1>
      </header>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={screen}
          initial={{ opacity: 0, y: 14, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.985 }}
          transition={{ duration: 0.24, ease: "easeOut" }}
          className="flex min-h-0 flex-col gap-3"
        >
          {screen === "home" ? (
            <>
              <SetupControls
                settings={settings}
                currentPoolLength={currentPoolLength}
                segmentMinCount={segmentMinCount}
                segmentMaxCount={segmentMaxCount}
                usingSegmentedDifficulty={usingSegmentedDifficulty}
                segmentOptions={segmentOptions}
                onDifficultySegmentChange={onDifficultySegmentChange}
                onToggleCityList={onToggleCityList}
                onSetIncludeTerritories={onSetIncludeTerritories}
              />
              <div className="grid justify-center gap-2">
                <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }} className="pointer-events-auto">
                  <Button
                    size="lg"
                    className="h-14 w-full max-w-[340px] rounded-full bg-gradient-to-l from-primary to-cyan-400 px-4 text-lg font-extrabold shadow-[0_14px_30px_rgba(34,145,255,0.32)] hover:from-primary/95 hover:to-cyan-400/95"
                    data-no-continue="true"
                    onClick={onStartGame}
                    disabled={startDisabled}
                  >
                    התחל משחק
                  </Button>
                </motion.div>
                <p className="min-h-3 text-center text-sm text-[#ff9f9f]">{warningText}</p>
              </div>
            </>
          ) : null}

          {screen === "play" ? (
            <>
              <div className="flex flex-col gap-3 px-1 text-ink">
                <div className="order-2 rounded-3xl border border-primary/30 bg-white/80 p-4 text-center sm:order-1 dark:bg-black/60">
                  <p className="text-sm font-semibold text-ink/75">מצאו את העיר:</p>
                  <p className="mt-1 text-3xl font-extrabold tracking-tight text-primary">
                    {(currentTargetName ?? questionText) || "טוען סיבוב..."}
                  </p>
                  <div className="mx-auto mt-2 h-1 w-12 rounded-full bg-primary/70" />
                </div>

                <div className="order-1 flex min-h-[44px] items-center justify-center sm:order-2">
                  <AnimatePresence mode="wait">
                    {showContinueHint ? (
                      <motion.div
                        key="continue-hint"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="mx-auto inline-flex w-fit max-w-full rounded-2xl border border-primary/25 bg-white/85 px-3 py-2 text-center text-sm font-medium text-ink/80 shadow-[0_6px_16px_rgba(15,44,82,0.14)] dark:border-white/15 dark:bg-slate-900/70 dark:text-slate-200"
                      >
                        לחצו בכל מקום כדי להמשיך לסיבוב הבא
                      </motion.div>
                    ) : feedbackText ? (
                      <motion.div
                        key={`feedback-${feedbackTone}-${feedbackText}`}
                        initial={{ opacity: 0, y: 8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.98 }}
                        transition={{ duration: 0.22, ease: "easeOut" }}
                        className={
                          feedbackTone === "ok"
                            ? "mx-auto inline-flex w-fit max-w-full rounded-2xl border border-emerald-500/40 bg-white/85 px-3 py-2 text-center font-semibold text-emerald-700 shadow-[0_6px_16px_rgba(15,44,82,0.14)] dark:border-emerald-400/35 dark:bg-slate-900/70 dark:text-emerald-300"
                            : feedbackTone === "bad"
                              ? "mx-auto inline-flex w-fit max-w-full rounded-2xl border border-red-500/40 bg-white/85 px-3 py-2 text-center font-semibold text-red-700 shadow-[0_6px_16px_rgba(15,44,82,0.14)] dark:border-red-400/35 dark:bg-slate-900/70 dark:text-red-300"
                              : "mx-auto inline-flex w-fit max-w-full rounded-2xl border border-primary/25 bg-white/85 px-3 py-2 text-center font-semibold text-ink/85 dark:border-white/15 dark:bg-slate-900/70 dark:text-slate-200"
                        }
                      >
                        {feedbackText}
                      </motion.div>
                    ) : (
                      <motion.p
                        key="feedback-empty"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0 }}
                        exit={{ opacity: 0 }}
                        className="pointer-events-none select-none text-transparent"
                      >
                        .
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="pointer-events-auto grid justify-center gap-2">
                <Button
                  size="lg"
                  variant="destructive"
                  className={wideButtonClass}
                  data-no-continue="true"
                  onClick={onStopGame}
                >
                  עצור משחק
                </Button>
              </div>
            </>
          ) : null}

          {screen === "end" ? (
            <>
              <div className="rounded-3xl border border-primary/30 bg-white/80 p-4 text-center dark:bg-black/60">
                <p className="text-sm text-ink/75">תוצאת המשחק</p>
                <p className="mt-2 text-3xl font-extrabold text-primary">{score}</p>
                <p className="mt-1 text-sm text-ink/75">נקודות</p>
              </div>
              <div className="pointer-events-auto grid justify-center gap-2">
                <Button size="lg" className={wideButtonClass} data-no-continue="true" onClick={onGoHome}>
                  חזרה למסך הבית
                </Button>
                <Button size="lg" variant="secondary" className={wideButtonClass} data-no-continue="true" onClick={onReplay}>
                  שחקו שוב
                </Button>
              </div>
            </>
          ) : null}
        </motion.div>
      </AnimatePresence>

      <CityListModal
        open={screen === "home" && showCityList}
        totalCount={cityEntriesForCurrentSettingsCount}
        citySearch={citySearch}
        onCitySearchChange={onCitySearchChange}
        entries={displayedCityEntries}
        bestMatchedCityId={bestMatchedCityId}
        onClose={onCloseCityList}
      />
    </section>
  );
}
