export interface LocationData {
  url: string;
  page: number;
  name?: string;
}

export interface Location extends LocationData {
  actionDepth: number;
  actionIndex: number;
  timestamp: string;
}

export interface LocationMeta {
  id: string;
  index: number;
  errors: string[];
}

export type LocationInstance = Location & LocationMeta;
