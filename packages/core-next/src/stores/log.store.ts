import type { Log, LogData } from "../types/Log.type";
import type { LogStore } from "../types/Store.type";
import useLocationStore from "./location.store";
import { clone, generateId } from "../utils/utils";

const state: LogStore = { totalLogs: 0, logs: [] };

const DEFAULT_OPTIONS: Required<Omit<LogData, "message">> = {
  criticality: 0,
  type: "INFO",
  name: "LOG ENTRY",
};

const useLogStore = () => {
  const { getCurrentLocation } = useLocationStore();

  const pushLog = (baseLog: LogData | string): void => {
    state.totalLogs += 1;

    state.logs.push({
      ...DEFAULT_OPTIONS,
      ...(typeof baseLog === "string" ? { message: baseLog } : baseLog),
      id: generateId(),
      index: state.totalLogs,
      location: getCurrentLocation(),
    });
  };

  const getLogs = (): Log[] => [...state.logs];

  const output = (): LogStore => clone(state);

  return {
    pushLog,
    getLogs,
    output,
  };
};

export default useLogStore;
