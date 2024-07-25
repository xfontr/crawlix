import useLocationStore from "../stores/location.store";
import useLogStore from "../stores/log.store";
import useRuntimeConfigStore from "../stores/runtimeConfig.store";
import useSessionStore from "../stores/session.store";
import { RuntimeConfig } from "../types/RuntimeConfig.type";
import { Session } from "../types/Session.type";
import EventBus from "../utils/EventBus";
import useAction from "./useAction";
import useSession from "./useSession";

const useApp = () => {
  const { setRuntimeConfig, getRuntimeConfig } = useRuntimeConfigStore();
  const { pushLocation } = useLocationStore();
  const { ready, isIDLE } = useSessionStore();
  const { pushLog } = useLogStore();
  const { end } = useSession();
  const { setBlockedThread } = useAction();

  /**
   * The process is supposed to finish naturally due to the set conditions (timeout, error or success).
   * Use this method only for testing.
   */
  const cleanUp = (status?: Session["status"]) => {
    EventBus.emit("SESSION:BLOCK_ACTIONS", 0);

    void end(status).then((output) => {
      console.log(output.errorData.errorLog);
      EventBus.removeAllListeners();
      process.exit(0);
    });
  };

  const setUp = (configs?: Partial<RuntimeConfig>): void => {
    if (!isIDLE()) return;

    if (configs) setRuntimeConfig(configs);

    pushLocation({ ...getRuntimeConfig().offset, name: "OFFSET" });

    EventBus.prependOnceListener("SESSION:END", cleanUp);
    EventBus.on("SESSION:BLOCK_ACTIONS", setBlockedThread);

    ready();
  };

  const _dangerouslyAbort = (status?: Session["status"]): void => {
    if (!getRuntimeConfig().node.env.startsWith("dev")) {
      pushLog({
        type: "DEV",
        criticality: 0,
        name: "FORCE_ABORT",
        message:
          "Forced ending in production setting. Ensure an organic ending, that is, by success, error or timeout",
      });
    }

    cleanUp(status);
  };

  return {
    setUp,
    _dangerouslyAbort,
  };
};

export default useApp;
