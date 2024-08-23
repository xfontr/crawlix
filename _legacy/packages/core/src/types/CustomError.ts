export interface CustomErrorProps {
  name?: string;
  publicMessage?: string;
}

interface CustomError extends Error {
  /**
   * @description The message that will be shown in the console
   */
  publicMessage: string;
}

export default CustomError;
