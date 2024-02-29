// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable no-control-regex */

export const DEFAULT_ERROR_NAME = Error("").name;

/**
 * Selects all whitespace characters, \s being a general selector for that purpose
 */
export const WHITE_SPACES = /\s+/g;

/**
 * Selects all ASCII characters
 */
export const ASCII_CHARS = /[^\x00-\x7F]/g;
