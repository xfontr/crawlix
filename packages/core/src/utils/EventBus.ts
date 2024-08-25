// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/no-explicit-any */
import { EventEmitter } from "events";
import type { Log, Session } from "../types";

const baseEventBus = new EventEmitter();

const emitters = {
  endSession: {
    emit: (status?: Session["status"]): void => {
      baseEventBus.emit("endSession", status);
    },
  },
  blockActions: {
    emit: (depth: number): void => {
      baseEventBus.emit("blockActions", depth);
    },
  },
  log: {
    emit: (logInstance: Log): void => {
      baseEventBus.emit("log", logInstance);
    },
  },
  sessionCleanUp: {},
  emptyActionStack: {},
};

type Listeners = Record<
  keyof typeof emitters,
  {
    emit: () => void;
    on: (callback: (...args: any[]) => void) => void;
    prependOnceListener: (callback: (...args: any[]) => void) => void;
    once: (callback: (...args: any[]) => void) => void;
  }
>;

const EventBus = Object.entries(emitters).reduce(
  (all, [key, value]) => ({
    ...all,
    [key]: {
      on: (callback: (...args: any[]) => void) => {
        baseEventBus.on(key, callback);
      },
      prependOnceListener: (callback: (...args: any[]) => void) => {
        baseEventBus.prependOnceListener(key, callback);
      },
      once: (callback: (...args: any[]) => void) => {
        baseEventBus.prependOnceListener(key, callback);
      },
      emit: () => {
        baseEventBus.emit(key);
      },
      ...value,
    } as Listeners[keyof typeof emitters],
  }),
  {
    removeAllListeners: (): void => {
      baseEventBus.removeAllListeners();
    },
  } as typeof emitters & Listeners & { removeAllListeners: () => void },
);

export default EventBus;
