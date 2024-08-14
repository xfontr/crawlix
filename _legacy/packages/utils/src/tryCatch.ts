export type CustomFunction<T = any> = (...args: any[]) => T;

export type PromiseFunction<T = any> = CustomFunction<Promise<T>>;
// | CustomFunction<T>;

const tryCatch = async <
  R = any,
  T extends PromiseFunction<R> = PromiseFunction,
  E extends any = Error,
>(
  callback: T,
  ...args: Parameters<T>
): Promise<[R, void] | [void, E]> => {
  try {
    const response = await callback(...args);
    return [response, undefined];
  } catch (error) {
    return [undefined, error as E];
  }
};

export default tryCatch;
