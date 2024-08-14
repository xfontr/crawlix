import type { LocationStamp } from "./Location.type";

export interface CustomErrorData {
  name?: string;
  message?: string;
  stack?: string | undefined;
  criticality?: "FATAL" | "HIGH" | "MEDIUM" | "LOW";
  type?:
    | "UNKNOWN"
    | "TIMEOUT"
    | "NETWORK"
    | "DATABASE"
    | "VALIDATION"
    | "AUTHENTICATION"
    | "AUTHORIZATION"
    | "HTTP"
    | "INTERNAL";
}

export type CustomError = CustomErrorData & {
  id: string;
  index: number;
  location: LocationStamp;
};
