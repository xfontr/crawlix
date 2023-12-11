import { type PromiseFunction } from "./types/function";

const tryCatch = async <R, T extends PromiseFunction<R> = PromiseFunction<R>>(
  callback: T,
  ...args: Parameters<T>
): Promise<[R | undefined, undefined | unknown]> => {
  try {
    const response = await callback(...args);
    return [response, undefined];
  } catch (error) {
    return [undefined, error];
  }
};

export default tryCatch;
