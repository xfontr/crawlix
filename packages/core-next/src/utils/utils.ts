import { randomUUID } from "crypto";
import { FullFunction } from "../types/Object.type";

export const generateId = (): string => randomUUID();

export const generateTimestamp = (): string => new Date().toLocaleDateString();

export const tryCatch = async <
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  R = any,
  T extends FullFunction<R> = FullFunction<R>,
  E extends any = Error,
>(
  callback: T,
  ...args: Parameters<T>
): Promise<[R, void] | [void, E]> => {
  try {
    const response: void | R = await callback(...args);
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    return [response!, undefined];
  } catch (error) {
    return [undefined, error as E];
  }
};

export const getPercentage = (numberA: number, numberB: number): number =>
  100 - (numberA / numberB) * 100;

export const clone = <T>(item: T): T => JSON.parse(JSON.stringify(item));
