import { randomUUID } from "crypto";
import { useRuntimeConfigStore } from "../stores";
import { Meta } from "../types/Meta.type";

const generateId = (): string => randomUUID();

export const generateTimestamp = (start: number, end?: number): number =>
  (end ?? new Date().getTime()) - new Date(start).getTime();

export const generateDate = (): number => new Date().getTime();

export const getMeta = <T>(index?: T) => {
  const isMinimal =
    useRuntimeConfigStore().current.public.output.schema === "MINIMAL";

  return isMinimal
    ? {}
    : ({
        id: generateId(),
        ...(index ? { index } : {}),
      } as unknown as T extends number ? Required<Meta> : Meta);
};
