import setDefaultTools from "../utils/setDefaultTools";

type ScraperTool<T extends Record<string, unknown>> = (
  tools: ReturnType<typeof setDefaultTools>,
) =>
  | Promise<
      T & {
        init?: () => Promise<void> | void;
      }
    >
  | (T & {
      init?: () => Promise<void> | void;
    });

export default ScraperTool;
