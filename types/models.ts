// -----------------------------
// Enums
// -----------------------------
export enum SensorProfileEnum {
  GOOD = "GOOD",
  MODERATE = "MODERATE",
  FAILING = "FAILING",
}

// -----------------------------
// Database Models (mirror of Postgres tables)
// -----------------------------
export interface Zone {
  id: number;
  name: string;
  min_c: number;
  max_c: number;
  humidity_min: number;
  humidity_max: number;
}

export interface Sensor {
  id: number;
  sensor_id: string;
  zone_name: string;
  installed_at: string; // ISO timestamp
  status: string,
  sensor_profile: SensorProfileEnum;
}

export interface Reading {
  id: number;
  ts: string; // ISO timestamp
  zone_name: string;
  sensor_id: string;
  temperature_c: number | null;
  humidity_pct: number;
  status: string;
  sensor_profile: SensorProfileEnum;
  created_at: string; // ISO timestamp
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string
}

// -----------------------------
// Request/Response Schemas
// -----------------------------

// Equivalent of ZoneTempHumDataRequestSchema
export interface ZoneTempHumDataRequest {
  timestamp: string;   // ISO 8601 formatted timestamp
  zone: string;        // Zone name
  sensor_id: string;   // Sensor identifier
  temperature_c?: number | null; // Optional temperature in Celsius
  humidity_pct: number;          // Relative Humidity in %
}

// Equivalent of ZoneTempHumDataResponseSchema
export interface ZoneTempHumDataResponse {
  timestamp: string;          // ISO 8601 formatted timestamp
  zone: string;               // Zone name
  sensor_id: string;          // Sensor identifier
  status: string;             // Status string ("ALL WITHIN RANGE", etc.)
  sensor_profile: SensorProfileEnum; // Profile name
}


export interface ReadingResponse {
    timestamp: string;
    zone: string;
    status: string;
    avg_temperature_c: number;
    avg_humidity_pct: number;
  }

export interface UserResponse{
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  imageUrl: string;
}