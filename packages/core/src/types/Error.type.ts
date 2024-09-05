import type { Meta } from ".";

export interface CustomErrorData {
  name?: string;
  message?: string;
  stack?: string;
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

export type CustomError = CustomErrorData &
  Required<Pick<CustomErrorData, "criticality">> &
  Meta;
