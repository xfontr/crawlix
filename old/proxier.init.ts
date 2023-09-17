import historyPlugin, { HistoryPublicActions } from "./plugins/history";
import usageDataPlugin, { UsageDataPublicActions } from "./plugins/usageData";
import proxier from "./proxier";

interface Payload {
  currentPage?: string;
}

type ExtendedStores = HistoryPublicActions & UsageDataPublicActions;

const myLogger = proxier<true, typeof console, [["log", "speak"]], Payload, ExtendedStores>(
  console,
  [["log", "speak"]],
  {
    before: (current, payload): undefined => {
      current.message = payload?.currentPage
        ? `${payload?.currentPage?.toUpperCase()}: ${current.message}`
        : current.message;
    },
    plugins: [usageDataPlugin, historyPlugin],
    keepOriginal: true,
  }
);

export default myLogger();
