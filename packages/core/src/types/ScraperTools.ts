import { Session } from "../..";
import setDefaultTools from "../utils/setDefaultTools";

type ScraperTools<T extends Record<string, unknown>> = (
  session: ReturnType<typeof Session>,
) => Promise<
  T &
    ReturnType<typeof setDefaultTools> & {
      init?: () => Promise<void> | void;
    }
>;

export default ScraperTools;
