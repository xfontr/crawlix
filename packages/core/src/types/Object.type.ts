export type FullObject = Record<
  string,
  string | boolean | number | undefined | void | null
>;

export type FullFunction<R = unknown> = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ...args: any[]
) => Promise<R | void> | R | void;

export type FullFunctionWithIndex<R = unknown> = (
  index: number,
) => Promise<R | void> | R | void;

export type FullFunctionWithApp<R = unknown> = (
  app: string,
) => Promise<R | void> | R | void;
