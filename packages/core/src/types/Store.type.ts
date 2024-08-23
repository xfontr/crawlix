import type { ActionInstance, ActionSyncInstance } from "./Action.type";
import type { CustomError } from "./Error.type";
import type { Item } from "./Item.type";
import type { LocationInstance } from "./Location.type";
import type { Log } from "./Log.type";
import type { RuntimeConfig } from "./RuntimeConfig.type";
import type { Session } from "./Session.type";

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

export interface ActionStore {
  totalActions: number;
  action: ActionSyncInstance;
  actionLog: ActionInstance[];
  totalMockedPausesDuration: number;
}

export type SessionStore = Session;

export interface RuntimeConfigStore {
  public: RuntimeConfig;
}

export type StoreNames =
  | "action"
  | "item"
  | "error"
  | "log"
  | "session"
  | "location"
  | "runtimeConfig"
  | (NonNullable<unknown> & string);
