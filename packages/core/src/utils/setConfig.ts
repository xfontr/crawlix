import env from "../configs/environment";
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
  SAVE_SESSION_ON_ERROR_DEFAULT,
} from "../configs/session";
import t from "../i18n";
import { warningMessage } from "../logger";
import SessionConfig from "../types/SessionConfig";

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
      (env.allowDefaultConfigs as boolean | "true" | "false" | undefined) ??
      ALLOW_DEFAULT_CONFIGS_DEFAULT,
  );

  return {
    offset: {
      url: env.baseUrl ?? "",
      page: $n(env.offsetPage, 1),
    },
    limit: {
      items: $n(env.limitItems, LIMIT_ITEMS_DEFAULT),
      page: $n(env.limitPage, LIMIT_PAGES_DEFAULT),
    },
    timeout: $n(env.timeout, TIMEOUT_DEFAULT),
    taskLength: $n(env.taskLength, TASK_LENGTH_DEFAULT),
    globalTimeout: $n(env.globalTimeout, GLOBAL_TIMEOUT_DEFAULT),
    minimumItemsToSuccess: $n(
      env.minimumItemsToSuccess,
      MINIMUM_ITEMS_TO_SUCCESS_DEFAULT,
    ),
    usageData: $b(env.usageData, USAGE_DATA_DEFAULT),
    allowDefaultConfigs: $b(
      env.allowDefaultConfigs,
      ALLOW_DEFAULT_CONFIGS_DEFAULT,
    ),
    saveSessionOnError: $b(
      env.saveSessionOnError,
      SAVE_SESSION_ON_ERROR_DEFAULT,
    ),
    emailing: {
      password: env.email.password ?? "",
      user: env.email.user ?? "",
      host: env.email.host ?? "",
      port: $n(env.email.port, 0),
      receiverEmail: env.email.receiverEmail ?? "",
    },
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
