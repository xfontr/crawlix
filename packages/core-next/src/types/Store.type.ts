import type { CustomError } from "./Error.type";
import type { Item } from "./Item.type";
import type { LocationInstance } from "./Location.type";
import type { Log } from "./Log.type";
import { RuntimeConfig } from "./RuntimeConfig.type";
import { Session } from "./Session.type";

export interface LogStore {
  totalLogs: number;
  logs: Log[];
}

export interface LocationStore {
  totalLocations: number;
  history: LocationInstance[];
}

export interface ItemStore {
  totalItems: number;
  incompleteItems: number;
  fullyCompleteItemsRate: number;
  items: Item[];
}

export interface ErrorStore {
  totalErrors: number;
  errorLog: CustomError[];
}

export type SessionStore = Session;

export type RuntimeConfigStore = RuntimeConfig;

export interface App extends SessionStore {
  logData: LogStore;
  locationData: LocationStore;
  errorData: ErrorStore;
  itemData: ItemStore;
  configs: RuntimeConfigStore;
}
