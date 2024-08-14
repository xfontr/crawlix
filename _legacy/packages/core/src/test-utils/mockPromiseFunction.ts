interface PromiseFunctionOptions<T> {
  timeout?: number;
  resolveValue?: T;
  advanceTimers?: boolean;
}

const mockPromiseFunction = async <T>({
  timeout = 0,
  resolveValue = true as T,
  advanceTimers = true,
}: PromiseFunctionOptions<T> = {}): Promise<T> =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve(resolveValue);
    }, timeout);

    advanceTimers && jest.advanceTimersByTime(timeout);
  });

export default mockPromiseFunction;
