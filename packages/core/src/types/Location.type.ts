import type { ActionSyncInstance, CustomError, Meta } from ".";

export interface LocationData {
  url: string;
  page: number;
  name?: string;
}

export interface LocationMeta extends Meta {
  errors?: (CustomError | string)[];
  itemCount?: number;
  lastAction?: ActionSyncInstance | string;
  date: number;
  timestamp: number;
}

export interface LocationStamp extends Partial<LocationInstance> {
  id: LocationMeta["id"];
  timestamp: LocationMeta["timestamp"];
  lastAction?: ActionSyncInstance | string;
}

export type LocationInstance = LocationData & LocationMeta;
