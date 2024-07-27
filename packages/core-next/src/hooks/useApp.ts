import {
  useLocationStore,
  useLogStore,
  useRuntimeConfigStore,
  useSessionStore,
} from "../stores";
import type { FullFunction, Log, RuntimeConfig, Session } from "../types";
import EventBus from "../utils/EventBus";
import useAction from "./useAction";
import useLog from "./useLog";
import useSession from "./useSession";

const useApp = () => {
  const { setRuntimeConfig, configs } = useRuntimeConfigStore();
  const { pushLocation } = useLocationStore();
  const { ready, isIDLE, isSessionOver } = useSessionStore();
  const { pushLog } = useLogStore();
  const { end } = useSession();
  const { setBlockedThread } = useAction();

  /**
   * The process is supposed to finish naturally due to the set conditions (timeout, error or success).
   * Use this method only for testing.
   */
  const cleanUp = () => {
    EventBus.removeAllListeners();
    process.exit(0);
  };

  const setUp = <T extends FullFunction = FullFunction>(
    forceConfigs?: Partial<RuntimeConfig>,
    logger?: T,
  ): void => {
    if (!isIDLE()) return;

    if (forceConfigs) setRuntimeConfig(forceConfigs);

    pushLocation({ ...configs().offset, name: "OFFSET" });

    const { log } = useLog(logger);

    EventBus.prependOnceListener("SESSION:END", (status: Session["status"]) => {
      EventBus.emit("SESSION:BLOCK_ACTIONS", 0);
      void end(status);
    });

    EventBus.prependOnceListener("SESSION:CLEAN_UP", cleanUp);
    EventBus.on("SESSION:BLOCK_ACTIONS", setBlockedThread);
    EventBus.on("LOGGER:LOG", (logInstance: Log) => log(logInstance));

    ready();
  };

  const _dangerouslyAbort = (status?: Session["status"]): void => {
    if (isSessionOver()) return;

    if (!configs().node.env.startsWith("dev")) {
      pushLog({
        type: "DEV",
        criticality: 0,
        name: "FORCE_ABORT",
        message:
          "Forced ending in production setting. Ensure an organic ending, that is, by success, error or timeout",
      });
    }

    void end(status);
  };

  return {
    setUp,
    _dangerouslyAbort,
  };
};

export default useApp;
