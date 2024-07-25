import { type Location } from "./Location.type";

export interface AutoLog {
  id: string;
  index: number;
  location: Location;
}

export interface LogData {
  message?: string;
  name?: string;
  type?: "WARN" | "ERROR" | "INFO" | "DEBUG" | "DEV";
  criticality?: number;
}

export type Log = LogData & AutoLog;
