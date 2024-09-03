import type { ActionSyncInstance, CustomError, Meta } from ".";

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
  itemCount?: number;
}

export interface LocationStamp extends Partial<LocationInstance> {
  id: Meta["id"];
  timestamp: number;
  lastAction: ActionSyncInstance | string | undefined;
}

export type LocationInstance = Location & LocationMeta;
