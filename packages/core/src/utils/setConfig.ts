import ENVIRONMENT from "../configs/environment";
import {
  GLOBAL_TIMEOUT_MAX,
  LIMIT_ITEMS_MAX,
  LIMIT_PAGES_MAX,
  TIMEOUT_MAX,
  TASK_LENGTH_MAX,
} from "../configs/session";
import t from "../i18n";
import { warningMessage } from "../logger";
import SessionConfig from "../types/SessionConfig";

const {
  baseUrl,
  globalTimeout,
  limitItems,
  limitPage,
  minimumItemsToSuccess,
  offsetPage,
  taskLength,
  timeout,
  usageData,
  allowDefaultConfigs,
} = ENVIRONMENT;

const setDefault = (allowDefaults: boolean | "true" | "false" | undefined) => {
  const parsedAllowDefaults =
    typeof allowDefaults === "boolean"
      ? allowDefaults
      : allowDefaults === "true";

  const warnAndDefault = <T extends string | number | boolean>(
    defaultValue: T,
  ): T => {
    warningMessage(t("session.warning.invalid_env_config"));

    if (!parsedAllowDefaults) {
      throw new Error(t("session.error.no_defaults"));
    }

    return defaultValue;
  };

  const checkNumber = <T extends string | number | boolean>(
    value: T | undefined,
    defaultValue: number,
  ): number => {
    if (!value || typeof +value !== "number" || +value < 0 || isNaN(+value))
      return warnAndDefault(defaultValue);

    return +value;
  };

  const checkBoolean = <T extends string | number | boolean>(
    value: T | undefined,
    defaultValue: boolean,
  ): boolean => {
    if (!value) return warnAndDefault(defaultValue);

    return value === "true";
  };

  return {
    $b: checkBoolean,
    $n: checkNumber,
  };
};


export const defaultSessionConfig = (
  defaultConfigs: boolean | undefined,
): SessionConfig => {
  const { $b, $n } = setDefault(
    defaultConfigs ??
      (allowDefaultConfigs as boolean | "true" | "false" | undefined),
  );

  return {
    offset: {
      url: baseUrl,
      page: $n(offsetPage, 1),
    },
    limit: {
      items: $n(limitItems, 150),
      page: $n(limitPage, 0),
    },
    timeout: $n(timeout, 3_000),
    taskLength: $n(taskLength, 800),
    globalTimeout: $n(globalTimeout, 10 * 30 * 1_000),
    minimumItemsToSuccess: $n(minimumItemsToSuccess, 0.99),
    usageData: $b(usageData, false),
    allowDefaultConfigs: $b(allowDefaultConfigs, true),
  };
};

const getMax = (max: number, fallback: number, value?: number): number =>
  ((value ?? 0) > max ? max : value) ?? fallback;

export const setConfig = (config?: Partial<SessionConfig>): SessionConfig => {
  const defaults = defaultSessionConfig(config?.allowDefaultConfigs);

  return {
    ...defaults,
    ...config,
    offset: {
      ...defaults.offset,
      ...config?.offset,
    },
    limit: {
      items: getMax(
        LIMIT_ITEMS_MAX,
        defaults.limit.items!,
        config?.limit?.items,
      ),
      page: getMax(LIMIT_PAGES_MAX, defaults.limit.page!, config?.limit?.page),
    },
    globalTimeout: getMax(
      GLOBAL_TIMEOUT_MAX,
      defaults.globalTimeout,
      config?.globalTimeout,
    ),
    timeout: getMax(TIMEOUT_MAX, defaults.timeout, config?.timeout),
    taskLength: getMax(
      TASK_LENGTH_MAX,
      defaults.taskLength,
      config?.taskLength,
    ),
  };
};

export default setConfig;
