import type { LocationStamp } from "./Location.type";
import type { Meta } from "./Meta.type";

export interface SessionMeta {
  id: Meta["id"];
  startLocation: LocationStamp;
  endLocation: LocationStamp;
  duration: number;
  itemRange: [number, number];
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
