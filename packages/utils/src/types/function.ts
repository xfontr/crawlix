export type CustomFunction<T> = (...args: unknown[]) => T | void;

export type PromiseFunction<T = any> = CustomFunction<Promise<T>>;
