export type CustomFunction<T = any> = (...args: any[]) => T;

export type PromiseFunction<T = any> = CustomFunction<Promise<T>> | CustomFunction<T>;

const tryCatch = async <
  R = any,
  T extends PromiseFunction<R> = PromiseFunction,
>(
  callback: T,
  ...args: Parameters<T>
): Promise<[R | void, void | Error]> => {
  try {
    const response = await callback(...args);
    return [response, undefined];
  } catch (error) {
    return [undefined, error as Error];
  }
};

export default tryCatch;
