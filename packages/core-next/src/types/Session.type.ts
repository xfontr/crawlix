import { LocationInstance } from "./Location.type";

export interface SessionMeta {
  id: string;
  startLocation: LocationInstance;
  endLocation: LocationInstance;
}

export interface SessionStatus {
  status:
    | "IDLE"
    | "READY"
    | "IN_PROGRESS"
    | "FATAL_ERROR"
    | "INCOMPLETE"
    | "SUCCESS";
}

export type Session = SessionMeta & SessionStatus;
