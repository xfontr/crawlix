export type CustomFunction<T = any> = (...args: any[]) => T;

export type PromiseFunction<T = any> = CustomFunction<Promise<T>>;
