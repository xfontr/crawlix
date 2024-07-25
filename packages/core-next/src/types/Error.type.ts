import { LocationInstance } from "./Location.type";

export interface CustomErrorData {
  name?: string;
  message?: string;
  stack?: string | undefined;
  criticality?: "FATAL" | "CRITICAL" | "MILD" | "UNKNOWN";
}

export type CustomError = Required<Pick<CustomErrorData, "criticality">> &
  Omit<CustomErrorData, "criticality"> & {
    id: string;
    index: number;
    location: LocationInstance;
  };
