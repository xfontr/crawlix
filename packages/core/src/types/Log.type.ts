import { type LocationStamp } from "./Location.type";

export interface AutoLog {
  id: string;
  index: number;
  location: LocationStamp;
}

export interface LogCustomData {
  message?: string;
  name?: string;
}

export interface LogMeta {
  type?: "WARN" | "ERROR" | "INFO" | "DEBUG" | "DEV";
  criticality?: number;
}

export type LogData = LogMeta & LogCustomData;

export type Log = LogCustomData & Required<LogMeta> & AutoLog;
