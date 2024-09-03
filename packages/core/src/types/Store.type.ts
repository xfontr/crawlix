import type {
  ActionInstance,
  ActionSyncInstance,
  Session,
  RuntimeConfig,
  FullObject,
  CustomError,
  Log,
  LocationInstance,
  Item,
  ItemMeta,
  ItemData,
} from ".";

export interface LogStore {
  totalLogs: number;
  logs: Log[];
}

export interface LocationStore {
  totalLocations: number;
  history: LocationInstance[];
  currentRef: LocationInstance | undefined;
}

export interface ItemStore<T extends FullObject = FullObject> {
  totalItems: number;
  incompleteItems: number;
  fullyCompleteItemsRate: number;
  currentRef: Partial<ItemData<T>> | undefined;
  currentRefErrors: ItemMeta["errors"] | undefined;
  items: Item<T>[];
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
