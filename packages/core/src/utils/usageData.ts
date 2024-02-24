import { readFile, writeFile } from "fs";
import { resolve } from "path";
import { warningMessage } from "../logger";
import { SessionData } from "../..";
import t from "../i18n";

const usageDataFileName = "usage-data.json";

export const usageDataLogError = (
  logError?: SessionData["errorLog"][number],
) => {
  if (process.env["NODE_ENV"] === "test" || !logError) return;

  const path = resolve(__dirname, "../../", usageDataFileName);

  readFile(path, { encoding: "ascii" }, (error, usageData) => {
    if (error) return warningMessage(t("usage_data.error"));

    let newData: SessionData["errorLog"] = [];

    try {
      newData = [
        ...(JSON.parse(usageData) as SessionData["errorLog"]),
        logError,
      ];
    } catch (_error) {
      newData = [logError];
    }

    writeFile(path, JSON.stringify(newData), (_error) => {
      if (_error) warningMessage(t("usage_data.error"));
    });
  });
};
