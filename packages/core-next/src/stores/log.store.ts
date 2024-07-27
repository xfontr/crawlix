import type { Log, LogData, LogStore } from "../types";
import useLocationStore from "./location.store";
import { clone, generateId } from "../utils/utils";
import EventBus from "../utils/EventBus";

const state: LogStore = { totalLogs: 0, logs: [] };

const DEFAULT_OPTIONS: Required<Omit<LogData, "message">> = {
  name: "LOG ENTRY",
  criticality: 5,
  type: "INFO",
};

const useLogStore = () => {
  const { getCurrentLocation } = useLocationStore();

  const pushLog = (baseLog: LogData | string): void => {
    state.totalLogs += 1;

    const logEntry = {
      id: generateId(),
      ...DEFAULT_OPTIONS,
      ...(typeof baseLog === "string" ? { message: baseLog } : baseLog),
      index: state.totalLogs,
      location: getCurrentLocation(),
    };

    state.logs.push(logEntry);

    EventBus.emit("LOGGER:LOG", logEntry);
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
