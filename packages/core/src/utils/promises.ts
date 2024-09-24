import type {
  FullFunction,
  FullFunctionWithApp,
  FullFunctionWithIndex,
} from "../types";

export type BreakingCondition = (index: number) => boolean;

export interface LoopOptions {
  errorMaxIterationCount?: number;
  breakingCondition?: BreakingCondition | number;
}

export type SimpleLoopOptions = LoopOptions | BreakingCondition | number;

export const promiseLoop = async <T>(
  callback: FullFunctionWithIndex<T>,
  breakingCondition: BreakingCondition,
  maxIterations?: number,
): Promise<number> => {
  let index = 0;

  do {
    await callback(index);
    index += 1;

    if (index === maxIterations) {
      throw new Error(`Loop size has been exceeded at index '${index}'`);
    }
  } while (breakingCondition(index) === false);

  return index;
};
export const runAfterAllInSeq = async (
  output: string,
  ...callbacks: FullFunctionWithApp[]
): Promise<void> => {
  if (!callbacks?.length) return;

  let index = 0;
  do {
    await callbacks[index]!(output);
    index += 1;
  } while (index < callbacks.length);
};
export const delay = async <T>(
  callback: FullFunction<T>,
  delay?: number,
): Promise<T | void> => {
  if (!delay) return callback();

  return await new Promise((resolve) => {
    setTimeout(() => {
      resolve(callback());
    }, delay);
  });
};
