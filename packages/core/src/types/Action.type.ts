import type { LocationStamp } from "./Location.type";
import type { Meta } from "./Meta.type";

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
  index?: Meta["index"];
  depth: number;
}

export type ActionSyncInstance = ActionData &
  ActionLocation & {
    id?: Meta["id"];
    location: LocationStamp;
  };

export type ActionInstance = ActionSyncInstance & ActionAsyncData;
