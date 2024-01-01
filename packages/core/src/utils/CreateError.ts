import t from "../i18n";
import CustomError, { type CustomErrorProps } from "../types/CustomError";

const CreateError = (
  error: Error | CustomError,
  { name, publicMessage }: CustomErrorProps = {},
): CustomError => {
  if (!(error instanceof Error)) {
    error = new Error(t("misc.unknown_error"));
  }

  error.name = name ?? error.name ?? t("misc.unknown_error");

  Object.defineProperty(error, "publicMessage", {
    value:
      publicMessage ?? (error as CustomError)?.publicMessage ?? error.message,
  });

  return error as CustomError;
};

export default CreateError;
