import {
  useLocationStore,
  useLogStore,
  useRuntimeConfigStore,
  useSessionStore,
} from "./stores";
import type { FullFunction, RuntimeConfig, Session } from "./types";
import { cleanUpStores } from "./helpers/stores";
import EventBus from "./utils/EventBus";
import { useAction, useSession, useLog } from "./hooks";
import { consoleLog } from "./utils/consoleLog";
import { DeepPartial } from "./types/UtilityTypes";

const { setRuntimeConfig, current: config } = useRuntimeConfigStore();
const { pushLocation } = useLocationStore();
const { ready, isIDLE, isSessionOver } = useSessionStore();
const { pushLog } = useLogStore();
const { end } = useSession();

const { setBlockedThread } = useAction();

const cleanUp = () => {
  EventBus.removeAllListeners();
  cleanUpStores(config.public.endProcess);

  if (config.public.endProcess) {
    process.exit(0);
  }

  useLog().setLogger(consoleLog);
};

export const init = <T extends FullFunction = FullFunction>(
  forceConfigs?: DeepPartial<RuntimeConfig>,
  logger?: T,
): void => {
  if (!isIDLE()) return;

  if (forceConfigs) setRuntimeConfig(forceConfigs);

  pushLocation({ ...config.public.offset, name: "OFFSET" });

  if (logger) useLog().setLogger(logger);

  const { print } = useLog();

  EventBus.endSession.prependOnceListener((status?: Session["status"]) => {
    EventBus.blockActions.emit(0);
    void end(status);
  });
  EventBus.sessionCleanUp.prependOnceListener(cleanUp);
  EventBus.blockActions.on(setBlockedThread);
  EventBus.log.on(print);

  ready();
};

export const _dangerouslyAbort = (status?: Session["status"]): void => {
  if (isSessionOver()) return;

  if (!config.public.node.env.startsWith("dev")) {
    pushLog({
      type: "DEV",
      criticality: 0,
      name: "FORCE_ABORT",
      message:
        "Forced ending in production setting. Ensure an organic ending, that is, by success, error or timeout",
    });
  }

  EventBus.endSession.emit(status);
};
