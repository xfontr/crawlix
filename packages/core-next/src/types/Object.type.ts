export type FullObject = Record<string, string | boolean | number>;

export type FullFunction<R = unknown> = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ...args: any[]
) => Promise<R> | R | void | Promise<void>;

export type ActionFullFunction<R = unknown> = (
  depth: number,
  index: number,
  blockedThread: number,
) => Promise<R> | R | void | Promise<void>;
