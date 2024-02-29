interface UpdateCsvOptions {
  /**
   * @description File name without prefix
   * @default "items"
   */
  name?: string;
  /**
   * @description Id by which the item will be recognized
   * @default UUID
   */
  id: string;
  /**
   * @description Directory where the file will be stored, without the file name itself
   * @example "../../.out/data"
   * @default "./"
   */
  path?: string;
  /**
   * @description Number of items a file can have. If exceeded, the script will automatically create another file with
   * the remaining data
   * @important Must be smaller than the bunch of items sent to save
   * @default
   * 1000
   */
  breakpoint?: number;
}

export default UpdateCsvOptions;
