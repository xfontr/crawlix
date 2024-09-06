/**
 * @description Nested actions maximum depth
 */
export const MAX_THREAD_DEPTH = 50;

/** // TODO: Also, we could limit the amount of iterations depending on the previous page counted items
 * @description Limits Session loop iterations
 */
export const MAX_LOOP_ITERATIONS = 1_250;

/**
 * @description Selects all whitespace characters, \s being a general selector for that purpose
 */
export const WHITE_SPACES = /\s+/g;

/**
 * @description Selects all ASCII characters
 */
// eslint-disable-next-line no-control-regex
export const ASCII_CHARS = /[^\x00-\xFF]/g;
