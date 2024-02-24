import { objectValues } from "@personal/utils";
import { DefaultItem } from "../..";

/**
 * This util could be more strict by considering incomplete empty strings, too.
 * However, an empty string may be considered a field that is actually complete, but intentionally
 * left as empty.
 *
 * As a potential TODO, the consumer should be able to decide this by configs. As of now, however,
 * this seems a decent approach
 */
const isItemComplete = <T = DefaultItem>(elements?: T): boolean =>
  !!elements &&
  !objectValues(elements).some(
    (element) => element === undefined || element === null,
  );

export default isItemComplete;
