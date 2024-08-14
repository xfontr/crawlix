import { EventEmitter } from "stream";

const EventBus = new EventEmitter();

type Events =
  | "SESSION:END"
  | "SESSION:CLEAN_UP"
  | "SESSION:BLOCK_ACTIONS"
  | "ACTIONS:EMPTY_STACK"
  | "LOGGER:LOG";

export default EventBus as EventEmitter & {
  on: (eventName: Events, listener: Parameters<EventEmitter["on"]>[1]) => void;
  emit: (
    eventName: Events,
    ...args: Omit<Parameters<EventEmitter["emit"]>, 0>
  ) => boolean;
  removeAllListeners: (eventName: Events) => void;
};
