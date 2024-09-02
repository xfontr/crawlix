import type { ActionSyncInstance } from "./Action.type";
import type { CustomError } from "./Error.type";
import type { Meta } from "./Meta.type";

export interface LocationData {
  url: string;
  page: number;
  name?: string;
}

export interface Location extends LocationData {
  date: number;
  timestamp: number;
  lastAction: ActionSyncInstance | string | undefined;
}

export interface LocationMeta extends Meta {
  errors?: (CustomError | string)[];
}

export interface LocationStamp extends Partial<LocationInstance> {
  id: Meta["id"];
  timestamp: number;
  lastAction: ActionSyncInstance | string | undefined;
}

export type LocationInstance = Location & LocationMeta;
