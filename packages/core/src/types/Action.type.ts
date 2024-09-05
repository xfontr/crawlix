import type { CustomError, Meta } from ".";

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
  error?: CustomError | string;
}

export type ActionSyncInstance = ActionData &
  Meta & {
    depth: number;
  };

export type ActionInstance = ActionSyncInstance & ActionAsyncData;

export type ActionMeta = Omit<Omit<ActionInstance, "name">, "duration">;
