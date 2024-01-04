import { Session, useAction } from "../..";

type ScraperTools<T extends Record<string, unknown>> = (
  session: ReturnType<typeof Session>,
  actions: ReturnType<typeof useAction>,
) => Promise<
  T & {
    init?: () => Promise<void> | void;
  }
> | T & {
  init?: () => Promise<void> | void;
};

export default ScraperTools;
