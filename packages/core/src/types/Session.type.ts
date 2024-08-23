import type { LocationStamp } from "./Location.type";

export interface SessionMeta {
  id: string;
  startLocation: LocationStamp;
  endLocation: LocationStamp;
  duration: number;
}

export interface SessionStatus {
  status:
    | "IDLE"
    | "READY"
    | "IN_PROGRESS"
    | "FATAL_ERROR"
    | "INCOMPLETE"
    | "TIMED_OUT"
    | "SUCCESS";
}

export type Session = SessionMeta & SessionStatus;
