export interface LocationData {
  url: string;
  page: number;
  name?: string;
}

export interface Location extends LocationData {
  date: number;
  timestamp: number;
  lastActionId: string | undefined;
}

export interface LocationMeta {
  id: string;
  index: number;
  errors: string[];
}

export interface LocationStamp {
  id: string;
  timestamp: number;
  lastActionId: string | undefined;
}

export type LocationInstance = Location & LocationMeta;
