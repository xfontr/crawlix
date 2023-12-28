import ENVIRONMENT from "../configs/environment";
import {
  GLOBAL_TIMEOUT_MAX,
  LIMIT_ITEMS_MAX,
  LIMIT_PAGES_MAX,
  TIMEOUT_MAX,
  TASK_LENGTH_MAX,
  LIMIT_ITEMS_DEFAULT,
  LIMIT_PAGES_DEFAULT,
  TIMEOUT_DEFAULT,
  TASK_LENGTH_DEFAULT,
  GLOBAL_TIMEOUT_DEFAULT,
  MINIMUM_ITEMS_TO_SUCCESS_DEFAULT,
  USAGE_DATA_DEFAULT,
  ALLOW_DEFAULT_CONFIGS_DEFAULT,
  SAVE_SESSION_ON_ERROR,
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
  saveSessionOnError
} = ENVIRONMENT;

export const setDefault = (
  allowDefaults: boolean | "true" | "false" | undefined,
) => {
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

  const checkNumber = (
    value: string | undefined,
    defaultValue: number,
  ): number =>
    !value || +value < 0 || Number.isNaN(+value)
      ? warnAndDefault(defaultValue)
      : +value;

  const checkBoolean = (
    value: string | undefined,
    defaultValue: boolean,
  ): boolean =>
    value === undefined ? warnAndDefault(defaultValue) : value === "true";

  return {
    $b: checkBoolean,
    $n: checkNumber,
  };
};

export const defaultSessionConfig = (
  defaultConfigs?: boolean | undefined,
): SessionConfig => {
  const { $b, $n } = setDefault(
    defaultConfigs ??
      (allowDefaultConfigs as boolean | "true" | "false" | undefined) ??
      ALLOW_DEFAULT_CONFIGS_DEFAULT,
  );

  return {
    offset: {
      url: baseUrl,
      page: $n(offsetPage, 1),
    },
    limit: {
      items: $n(limitItems, LIMIT_ITEMS_DEFAULT),
      page: $n(limitPage, LIMIT_PAGES_DEFAULT),
    },
    timeout: $n(timeout, TIMEOUT_DEFAULT),
    taskLength: $n(taskLength, TASK_LENGTH_DEFAULT),
    globalTimeout: $n(globalTimeout, GLOBAL_TIMEOUT_DEFAULT),
    minimumItemsToSuccess: $n(
      minimumItemsToSuccess,
      MINIMUM_ITEMS_TO_SUCCESS_DEFAULT,
    ),
    usageData: $b(usageData, USAGE_DATA_DEFAULT),
    allowDefaultConfigs: $b(allowDefaultConfigs, ALLOW_DEFAULT_CONFIGS_DEFAULT),
    saveSessionOnError: $b(saveSessionOnError, SAVE_SESSION_ON_ERROR)
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
