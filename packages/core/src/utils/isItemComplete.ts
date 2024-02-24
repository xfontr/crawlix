import { objectValues } from "@personal/utils";
import { DefaultItem } from "../..";

const isItemComplete = <T = DefaultItem>(elements?: T): boolean =>
  !!elements &&
  !objectValues(elements).some(
    (element) => element === undefined || element === null,
  );

export default isItemComplete;
