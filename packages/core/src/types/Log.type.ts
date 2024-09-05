import type { Meta } from ".";

export interface LogCustomData {
  name?: string;
  message?: string;
  type?: "WARN" | "ERROR" | "INFO" | "DEBUG" | "DEV";
}

export interface LogMeta extends Meta {
  category?: "ACTION" | "LOCATION" | "ERROR" | "USER_INPUT" | "SESSION";
}

export type LogData = LogMeta & LogCustomData;

export type Log = LogCustomData & LogMeta;
