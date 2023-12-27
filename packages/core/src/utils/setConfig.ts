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
    (typeof allowDefaults === "boolean"
      ? allowDefaults
      : allowDefaults && (JSON.parse(allowDefaults) as boolean)) ?? false;

  return <T extends string | number | boolean>(
    value: string | number | boolean | undefined,
    expectedType: "string" | "number" | "boolean",
    defaultValue: T,
  ): T => {
    const warnAndDefault = () => {
      warningMessage(t("session.warning.invalid_env_config"));

      if (!parsedAllowDefaults) {
        throw new Error(t("session.error.no_defaults"));
      }

      return defaultValue;
    };

    if (!value) return warnAndDefault();

    if (
      expectedType === "number" &&
      (typeof +value !== "number" || +value < 0 || isNaN(+value))
    ) {
      return warnAndDefault();
    }

    if (expectedType === "number") return +value as T;

    if (expectedType === "boolean") {
      try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const finalValue =
          typeof value === "string" ? JSON.parse(value) : value;
        return typeof finalValue === "boolean"
          ? (finalValue as T)
          : warnAndDefault();
      } catch (e) {
        return warnAndDefault();
      }
    }

    return typeof value === expectedType ? (value as T) : warnAndDefault();
  };
};

export const defaultSessionConfig = (
  defaultConfigs?: boolean,
): SessionConfig => {
  const $tc = setDefault(
    defaultConfigs ??
      (allowDefaultConfigs as boolean | "true" | "false" | undefined),
  );

  return {
    offset: {
      url: baseUrl,
      page: $tc(offsetPage, "number", 1),
    },
    limit: {
      items: $tc(limitItems, "number", 150),
      page: $tc(limitPage, "number", 0),
    },
    timeout: $tc(timeout, "number", 3_000),
    taskLength: $tc(taskLength, "number", 800),
    globalTimeout: $tc(globalTimeout, "number", 10 * 30 * 1_000),
    minimumItemsToSuccess: $tc(minimumItemsToSuccess, "number", 0.99),
    usageData: $tc(usageData, "boolean", false),
    allowDefaultConfigs: $tc(allowDefaultConfigs, "boolean", true),
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
