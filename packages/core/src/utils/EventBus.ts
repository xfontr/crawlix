import { EventEmitter } from "stream";
import Events from "../types/Events";

const EventBus = new EventEmitter();

export default EventBus as EventEmitter & {
  on: (eventName: Events, listener: Parameters<EventEmitter["on"]>[1]) => void;
  emit: (
    eventName: Events,
    ...args: Omit<Parameters<EventEmitter["emit"]>, 0>
  ) => boolean;
};
