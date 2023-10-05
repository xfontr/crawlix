/**
 * @param T Proxied item
 */
export type SuperProxyCustomMethods<T extends object> = [keyof T, string][];

/**
 * @param T Proxied item
 * @param C Custom methods
 * @param A Additional arguments
 * @param H Has parameters @default true
 * @param R Returned value
 */
export type SuperProxyAction<
  T extends object,
  C extends SuperProxyCustomMethods<T>,
  A extends object,
  H extends boolean = true,
  P extends SuperProxyPlugin<T, C>[] = SuperProxyPlugin<T, C>[],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  R = any,
> = H extends true
  ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (store: SuperProxyStore<T, C, A, P>, ...args: any[]) => R
  : (store: SuperProxyStore<T, C, A, P>) => R;

/**
 * @param T Proxied item
 * @param C Custom methods
 * @param A Additional arguments
 */
export interface SuperProxyOptions<
  T extends object,
  C extends SuperProxyCustomMethods<T>,
  A extends object,
  P extends SuperProxyPlugin<T, C>[] = SuperProxyPlugin<T, C>[],
> {
  proxiedItem: T;
  customMethods: C;
  plugins?: P;
  actions?: Partial<{
    init: SuperProxyAction<T, C, A, false>;
    before: SuperProxyAction<T, C, A>;
    after: SuperProxyAction<T, C, A>;
    cleanUp: SuperProxyAction<T, C, A>;
  }>;
  keepOriginal: boolean;
}

/**
 * @param T Proxied item
 * @param C Custom methods
 * @param A Additional arguments
 * @param S Plugin store
 */
export interface SuperProxyPlugin<
  T extends object,
  C extends SuperProxyCustomMethods<T>,
> {
  name?: string;
  version?: string;
  modules: Record<
    string,
    {
      action: SuperProxyAction<T, C, object>;
      run?:
        | Uppercase<keyof NonNullable<SuperProxyOptions<T, C, object>["actions"]>>
        | "BEFORE_AFTER";
      isPublic?: boolean;
    }
  >;
}

/**
 * @param T Proxied item
 */
export type SuperProxiedCustomMethods<
  T extends object,
  C extends SuperProxyCustomMethods<T>,
> = {
  [key in C[number][1]]: T[C[number][0]];
};

type PublicStoreActions<
  T extends object,
  E extends SuperProxyCustomMethods<T>,
  A extends "get" | "set",
> = Record<
  `${A}${Capitalize<keyof SuperProxyStore<T, E>["current"]>}`,
  (value?: string) => void
>;

/**
 * @param T Proxied item
 * @param C New methods
 * @param K Keep original
 * @param P Extended actions
 */
export type SuperProxiedFunction<
  T extends object,
  C extends SuperProxyCustomMethods<T>,
  K extends boolean,
  P extends string[],
> = (K extends true
  ? T & SuperProxiedCustomMethods<T, C>
  : SuperProxiedCustomMethods<T, C>) & {
  superProxyStore: PublicStoreActions<T, C, "get"> &
    PublicStoreActions<T, C, "set">;
  superProxyPlugins: {
    [key in P[number]]: <R>(...args: unknown[]) => R;
  };
  superProxyTerminate: <R>(...args: unknown[]) => R;
};

/**
 * @param T Additional arguments object
 */
export type SuperProxyAdditionalArguments<T extends object = Record<string, unknown>> =
  | T
  | undefined;

/**
 * @param T Proxied item
 * @param C Custom methods
 * @param A Additional arguments
 */
export interface SuperProxyStore<
  T extends object,
  C extends SuperProxyCustomMethods<T>,
  A extends object = Record<string, unknown>,
  P extends SuperProxyPlugin<T, C>[] = SuperProxyPlugin<T, C>[],
> {
  additionalArguments?: SuperProxyAdditionalArguments<A>;
  customMethods: C;
  options: SuperProxyOptions<T, C, A, P>;
  current: {
    before: unknown;
    main: unknown;
    after: unknown;
    method: keyof SuperProxiedFunction<T, C, false, []> | undefined;
  };
  plugins: {
    init: SuperProxyAction<T, C, A, false>[];
    before: SuperProxyAction<T, C, A>[];
    after: SuperProxyAction<T, C, A>[];
    cleanUp: SuperProxyAction<T, C, A>[];
    publicActions: Record<string, SuperProxyAction<T, C, A>>;
  };
}
