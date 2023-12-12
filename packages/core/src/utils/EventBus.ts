import { EventEmitter } from "stream";

export const events = {
  countAction: "COUNT_ACTION",
};

const EventBus = new EventEmitter();

export default EventBus;
