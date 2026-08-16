import type { DatasetKey, SessionState } from "./types";

export const TOTAL_QUESTIONS = 10;
export const FEEDBACK_DELAY_MS = 1200;
export const INITIAL_CENTER: [number, number] = [31.45, 34.85];
export const INITIAL_ZOOM = 8;
const publicFile = (path: string) => `${import.meta.env.BASE_URL}${path}`;

export const DATA_FILES: Record<DatasetKey, string> = {
  include: publicFile("data/localities_all.geojson"),
  exclude: publicFile("data/localities_no_wb_gaza.geojson"),
};

export const LEVELS_FILES = {
  cityCatalog: publicFile("data/cities_catalog.json"),
  segmentsByName: publicFile("data/difficulty_segments_by_name.json"),
};

export const USE_SEGMENTED_DIFFICULTY = true;

export const containerMotion = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

export const cardMotion = {
  hidden: { opacity: 0, y: 14, scale: 0.99 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.28 } },
};

export function createIdleSessionState(): SessionState {
  return {
    totalQuestions: TOTAL_QUESTIONS,
    currentIndex: 0,
    score: 0,
    askedIds: [],
    currentTargetId: null,
    status: "idle",
    selectedFeatureId: null,
  };
}
