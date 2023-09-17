import proxierStore from "./proxier.store";

export type ProxierTool<T extends object = object> = T;
export type ProxierExtraArguments<T extends object = object> = T;

// BACKUP
// export type Key<
//   T extends object,
//   C extends ProxierCustomMethod<T>[],
// > = C extends string[] ? C[1] : keyof T;

// SAVE THIS!! IT WORKS TO CONVERT ARRAY TO BITWISE OPERATORS
// export type ProxiedFunction<
//   T extends object,
//   C extends string[],
// > =
// {
//   [key in C[number]]: T[keyof T];
// };

export type ProxiedFunction<
  T extends object,
  C extends ProxierCustomMethod<T>[],
  D extends boolean,
  E extends object,
> = (D extends true
  ? T & {
      [key in C[number][1]]: T[C[number][0]];
    }
  : {
      [key in C[number][1]]: T[C[number][0]];
    }) & { publicStore: ReturnType<typeof proxierStore> } & E;

export interface ProxierComponent {
  launchAt?: "before" | "after" | "always";
  extendLoggerActions?: boolean;
  action: <T extends object>(payload?: ProxierExtraArguments<T>) => void;
}

/**
 * @param T ProxierStore
 * @param S Custom plugin store
 */
export type ProxierPlugin<
  T extends object = object,
  S extends object = object,
> = (store: ProxierPluginStore<T, S>) => Record<string, ProxierComponent>;

export type ProxierAction<P extends object = object> = <T extends object>(
  current: ProxierStore<T>["current"],
  payload?: ProxierExtraArguments<P>,
) => undefined | string;

export type ProxierOptions<P extends object = object> = Partial<{
  publicResponse: boolean;
  keepOriginal: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  plugins: ProxierPlugin<any, any>[];
  before: ProxierAction<P>;
  after: ProxierAction<P>;
}>;

/**
 * @param T ProxierStore
 */
export type ProxierCustomMethod<T extends object = object> =
  // | keyof T
  [keyof T, string];

/**
 * @param T ProxierStore
 */
export interface ProxierStore<T extends object = object> {
  proxierTool: ProxierTool<T>;
  customMethods: ProxierCustomMethod<T>[];
  current: {
    message: undefined | string;
    oldMethodName: undefined | keyof T;
    newMethodName: undefined | keyof T;
    loggerResponse: undefined | string;
    beforeResponse: undefined | string;
    afterResponse: undefined | string;
  };
}

/**
 * @param S Custom plugin store
 * @param T ProxierStore
 */
export type ProxierPluginStore<
  S extends object = object,
  T extends object = object,
> = ProxierStore<T> & S;
