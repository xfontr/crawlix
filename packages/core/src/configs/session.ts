import type { SessionConfig as T } from "../..";

export const LIMIT_ITEMS_DEFAULT: NonNullable<T["limit"]["items"]> = 150;
export const LIMIT_ITEMS_MAX: NonNullable<T["limit"]["items"]> = 5_000;

export const LIMIT_PAGES_DEFAULT: NonNullable<T["limit"]["page"]> = 0;
export const LIMIT_PAGES_MAX: NonNullable<T["limit"]["page"]> = 400;

export const TIMEOUT_DEFAULT: T["timeout"] = 3 * 1_000;
export const TIMEOUT_MAX: T["timeout"] = 30 * 1_000;

export const GLOBAL_TIMEOUT_DEFAULT: T["globalTimeout"] = 10 * 30 * 1_000;
export const GLOBAL_TIMEOUT_MAX: T["globalTimeout"] = 10 * 30 * 10_000;

export const AFTER_ALL_TIMEOUT_DEFAULT: T["afterAllTimeout"] = 60 * 1_000;
export const AFTER_ALL_TIMEOUT_MAX: T["afterAllTimeout"] = 15 * 10 * 10_000;

export const TASK_LENGTH_DEFAULT: T["taskLength"] = 800;
export const TASK_LENGTH_MAX: T["taskLength"] = 10 * 1_000;

export const MINIMUM_ITEMS_TO_SUCCESS_DEFAULT: T["minimumItemsToSuccess"] = 0.99;

export const USAGE_DATA_DEFAULT: T["usageData"] = false;

export const ALLOW_DEFAULT_CONFIGS_DEFAULT: T["allowDefaultConfigs"] = true;
