/**
 * @description Nested actions maximum depth
 */
export const MAX_THREAD_DEPTH = 50;

/**
 * @description Selects all whitespace characters, \s being a general selector for that purpose
 */
export const WHITE_SPACES = /\s+/g;

/**
 * @description Selects all ASCII characters
 */
// eslint-disable-next-line no-control-regex
export const ASCII_CHARS = /[^\x00-\xFF]/g;
