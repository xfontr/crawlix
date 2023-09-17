import { ProxierStore } from "./proxier.types";
import { capitalize } from "./proxier.utils";

const proxierStore = <T extends object = object>(store: ProxierStore<T>) => {
  const getters = () =>
    Object.keys(store.current).reduce(
      (allGetters, getterName) => ({
        ...allGetters,
        [`get${capitalize(getterName)}`]: () =>
          store.current[getterName as keyof typeof store.current],
      }),
      {} as Record<
        `get${Capitalize<keyof typeof store.current>}`,
        () => string | undefined
      >,
    );

  const setters = () =>
    Object.keys(store.current).reduce(
      (allSetters, rawSetterName) => {
        const setterName = rawSetterName as keyof typeof store.current;
        return {
          ...allSetters,
          [`set${capitalize(setterName)}`]: (value: string) => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
            store.current[setterName] = value as any;
          },
        };
      },
      {} as Record<
        `set${Capitalize<keyof typeof store.current>}`,
        (value?: string) => void
      >,
    );

  return {
    current: {
      ...getters(),
      ...setters(),
    },
  };
};

export default proxierStore;
