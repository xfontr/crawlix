import { newPlugin } from "../proxier.utils";

interface HistoryStore {
  history: string[];
}

export interface HistoryPublicActions {
  getHistory: () => HistoryStore["history"];
}

const historyPlugin = newPlugin<HistoryStore>("history", [], (store) => ({
  updateHistory: {
    action: () =>
      store.history.push(`${Date.now()} | ${store.current.message}`),
    launchAt: "after",
    extendLoggerActions: false,
  },
  getHistory: {
    action: () => store.history,
    extendLoggerActions: true,
  },
}));

export default historyPlugin;
