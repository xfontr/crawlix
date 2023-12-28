import { readFile, writeFile } from "fs";
import { resolve } from "path";
import { warningMessage } from "../logger";
import { SessionData } from "../..";
import t from "../i18n";

const usageDataFileName = "usage-data.json";

export const usageDataLogError = (error?: SessionData["errorLog"][number]) => {
  if (process.env["NODE_ENV"] === "test" || !error) return;
  
  readFile(
    resolve(__dirname, "../../", usageDataFileName),
    {
      encoding: "ascii",
    },
    (_error, usageData) => {
      if (_error) {
        warningMessage(t("usage_data.error"));
        return;
      }

      const currentData = JSON.parse(usageData) as SessionData["errorLog"][];

      const newData = [...currentData, error];

      writeFile(
        resolve(__dirname, "../../", usageDataFileName),
        JSON.stringify(newData),
        (error) => {
          if (!error) return;
          warningMessage(t("usage_data.error"));

          writeFile(
            resolve(__dirname, "../../", usageDataFileName),
            JSON.stringify(currentData),
            () => undefined,
          );
        },
      );
    },
  );
};
