import { get } from "env-var";

interface EnvVarOptions {
  required?: boolean;
  type?: "string" | "number" | "boolean" | "email" | "array";
}

const cleanDefaultValue = <T>(value: T) => {
  if (value === true) return "true";
  if (value === false) return "false";
  return value;
};

const envVar = <T>(
  variable: string,
  defaultValue: T,
  options?: EnvVarOptions,
): T => {
  const retrievedVar = get(variable);

  if (options?.required) retrievedVar.required();
  if (defaultValue) retrievedVar.default(cleanDefaultValue(defaultValue));

  const check = {
    string: retrievedVar.asString,
    number: retrievedVar.asIntPositive,
    boolean: retrievedVar.asBool,
    email: retrievedVar.asEmailString,
    array: retrievedVar.asJsonArray,
  };

  return check[
    (options?.type ?? typeof defaultValue) as keyof typeof check
  ]() as T;
};

export default envVar;
