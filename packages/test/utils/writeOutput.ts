import { writeFile } from "fs/promises";
import { OUTPUT_PREFIX } from "../configs/constants";
import { resolve } from "path";

export const writeOutput = async (output: string, testCase: string) => {
  await writeFile(
    resolve(__dirname, `../integration/${OUTPUT_PREFIX}-${testCase}.json`),
    output,
  );
};
