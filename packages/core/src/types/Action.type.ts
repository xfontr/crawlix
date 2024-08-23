import type { LocationStamp } from "./Location.type";

export interface ActionCustomData {
  name?: string;
  isCritical?: boolean;
}
export interface ActionData extends ActionCustomData {
  depth: number;
  mockedDuration: number;
}

export interface ActionAsyncData {
  duration: number;
  errorId?: string | undefined;
}

export interface ActionLocation {
  index: number;
  depth: number;
}

export type ActionSyncInstance = ActionData &
  ActionLocation & {
    id: string;
    location: LocationStamp;
  };

export type ActionInstance = ActionSyncInstance & ActionAsyncData;
