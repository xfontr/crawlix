import type { Meta, LocationStamp } from ".";

export interface AutoLog extends Meta {
  location: LocationStamp;
}

export interface LogCustomData {
  message?: string;
  name?: string;
}

export interface LogMeta {
  type?: "WARN" | "ERROR" | "INFO" | "DEBUG" | "DEV";
  criticality?: number;
  category?: "ACTION" | "LOCATION" | "ERROR" | "USER_INPUT" | "SESSION";
}

export type LogData = LogMeta & LogCustomData;

export type Log = LogCustomData & Required<LogMeta> & AutoLog;
