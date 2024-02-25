import { Item, ItemExtraAttributes, ItemMeta } from "./Item";

interface UseItemOptions<T extends ItemExtraAttributes = ItemExtraAttributes> {
  initialState?: Partial<Item<T>>;
  /**
   * @description List with the minimum attributes that the item must have.
   * @example ["name", "shop", "price"]
   */
  requiredType?: Partial<keyof Item<T>>[];
  /**
   * @description If the item cleaner should run automatically before using the item.
   */
  autoClean?: boolean;
  /**
   * @description If the error checker should run automatically before using the item.
   *
   * Behavior:
   *
   * - If there's a list of minimum attributes, the script will check which
   * ones are lacking and log them as item errors.
   * - If there is no list of minimum attributes, the script will check every
   * single attribute and log the empty ones as errors.
   */
  autoLogErrors?: boolean;
  /**
   * @description Custom Reg Expression and a value to replace the findings with, in addition with the
   * default cleaner
   */
  customCleaner?: [RegExp | string, string];
  /**
   * @description If true, will store the item and its errors every time it's used.
   */
  enableBackup?: boolean;
  /**
   * @description Takes an external function and runs it with the item and error log as parameters.
   * Runs when using the item.
   */
  callbackUse?: (item: Item<T>, errorLog?: ItemMeta<T>["errorLog"]) => void;
}

export default UseItemOptions;
