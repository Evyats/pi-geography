import type { Feature, FeatureCollection, Geometry } from "geojson";

export type DatasetKey = "include" | "exclude";
export type SessionStatus = "idle" | "awaiting_answer" | "locked" | "finished";

export type LocalityProps = {
  id: string;
  name_he: string;
  population: number | null;
  in_wb_gaza: boolean;
  color_index: number;
  neighbors: string[];
};

export type LocalityFeature = Feature<Geometry, LocalityProps>;
export type LocalityCollection = FeatureCollection<Geometry, LocalityProps>;

export type CityCatalogEntry = {
  id: string;
  name_he: string;
  population: number | null;
};

export type CitiesCatalog = {
  cities: CityCatalogEntry[];
};

export type DifficultySegmentDefinition = {
  key: string;
  label: string;
  increment_count: number;
  city_names: string[];
};

export type DifficultySegmentsByName = {
  strategy: "population_desc_increments";
  segments: DifficultySegmentDefinition[];
};

export type SettingsState = {
  includeTerritories: boolean;
  difficultySegmentIndex: number;
};

export type SessionState = {
  totalQuestions: number;
  currentIndex: number;
  score: number;
  askedIds: string[];
  currentTargetId: string | null;
  status: SessionStatus;
  selectedFeatureId: string | null;
};

export type FeedbackTone = "ok" | "bad" | "";
