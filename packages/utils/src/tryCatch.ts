// import { type PromiseFunction } from "./types/function";

// const tryCatch = async <R, T extends PromiseFunction<R> = PromiseFunction<R>>(
//   callback: T,
// ): Promise<[void | Awaited<R>, void | Error]> => {
//   try {
//     const response = await callback();
//     return [response, undefined];
//   } catch (error) {
//     return [undefined, error as Error];
//   }
// };

// export default tryCatch;

// import { type PromiseFunction } from "./types/function";

// const tryCatch = async <R, T extends PromiseFunction<R> = PromiseFunction<R>>(
//   callback: T,
//   ...args: Parameters<T>
// ): Promise<[void | Awaited<ReturnType<T>>, void | Error]> => {
//   try {
//     const response = await callback(...args);
//     return [response, undefined];
//   } catch (error) {
//     return [undefined, error as Error];
//   }
// };

// export default tryCatch;

export type CustomFunction<T = any> = (...args: any[]) => T;

export type PromiseFunction<T = any> = CustomFunction<Promise<T>>;

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
