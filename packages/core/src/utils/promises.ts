import type {
  FullFunction,
  FullFunctionWithApp,
  FullFunctionWithIndex,
} from "../types";

export const promiseLoop = async <T>(
  callback: FullFunctionWithIndex<T>,
  breakingCondition: (index: number) => boolean,
) => {
  let index = 0;

  do {
    await callback(index);
    index += 1;
  } while (breakingCondition(index) === false);
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
