import { randomUUID } from "crypto";
import { FullFunction, FullObject } from "../types";

export const generateId = (): string => randomUUID();

export const generateTimestamp = (): string =>
  new Date().getUTCMilliseconds().toString();

export const generateDate = (): string => new Date().getTime().toString();

export const randomize = (
  value: number,
  [max, min]: [number, number],
): number => +((Math.random() * (max - min) + min) * value).toFixed(2);

export const tryCatch = async <R = unknown, E = Error>(
  callback: FullFunction<R>,
): Promise<[R, void] | [void, E]> => {
  try {
    const response: void | R = await callback();
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    return [response!, undefined];
  } catch (error) {
    return [undefined, error as E];
  }
};

export const getPercentage = (numberA: number, numberB: number): number =>
  100 - (numberA / numberB) * 100;

export const stringifyWithKeys = <T extends FullObject = FullObject>(
  item: T,
): string =>
  Object.entries(item)
    .flatMap(([key, value]) =>
      value ? `[${key.toLocaleUpperCase()}] ${value}` : [],
    )
    .join("; ");
