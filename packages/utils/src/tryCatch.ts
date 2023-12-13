import { type PromiseFunction } from "./types/function";

const tryCatch = async <R, T extends PromiseFunction<R> = PromiseFunction<R>>(
  callback: T,
): Promise<[void | Awaited<R>, void | unknown]> => {
  try {
    const response = await callback();
    return [response, undefined];
  } catch (error) {
    return [undefined, error];
  }
};

export default tryCatch;
