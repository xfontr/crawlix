import type { LocationInstance, LocationStamp } from "./Location.type";

export interface Meta {
  id?: string | undefined;
  index?: number | undefined;
  location?: LocationStamp | LocationInstance;
}
