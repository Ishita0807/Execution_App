export interface ZoneConfig {
  name: string;
  min_c: number;
  max_c: number;
  humidity_min: number;
  humidity_max: number;
}

// Default fallback zones if DB is empty
export const DEFAULT_ZONES: ZoneConfig[] = [
  { name: "Zone_1", min_c: 0, max_c: 8, humidity_min: 40, humidity_max: 70 },
  { name: "Zone_2", min_c: -1, max_c: 4, humidity_min: 75, humidity_max: 90 },
  { name: "Zone_3", min_c: -30, max_c: -18, humidity_min: 30, humidity_max: 50 },
];
