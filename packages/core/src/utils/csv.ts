import { objectKeys, snakelise, tryCatch } from "@personal/utils";
import { createObjectCsvWriter } from "csv-writer";
import { existsSync } from "fs";
import { readFile, readdir, writeFile } from "fs/promises";
import { parse } from "papaparse";
import { cleanItems } from "./cleanItems";
import { ObjectCsvWriterParams } from "csv-writer/src/lib/csv-writer-factory";
import { SESSION_ID_HEADER } from "../configs/constants";
import { extname, resolve } from "path";
import { randomUUID } from "crypto";
import UpdateCsvOptions from "../types/UpdateCsvOptions";
import { UnknownItem } from "../types/Item";

export const namePrefix = (index: number, name: string) => `[${index}]-${name}`;

const save = async <T>(path: string, name: string, newCsv: T) =>
  await tryCatch(
    writeFile,
    resolve(path, name),
    JSON.stringify(newCsv, undefined, 1),
  );

const newWriter = async <T extends Record<string, unknown>>(
  path: ObjectCsvWriterParams["path"],
  header: ObjectCsvWriterParams["header"],
  ...items: T[]
) =>
  await createObjectCsvWriter({
    path,
    header,
  }).writeRecords(items);

export const newKey = (name?: string | number | boolean) => ({
  id: name?.toString() ?? "",
  title: name?.toString() ?? "",
});

export const createHeader = ({
  _meta,
  ...item
}: UnknownItem): ReturnType<typeof newKey>[] =>
  [
    ...objectKeys(item),
    ...objectKeys(_meta ?? {}).map((key) => `_${key}`),
  ].flatMap((key) => newKey(snakelise(key.toString())));

const createCsv = async <T extends UnknownItem = UnknownItem>(
  path: string,
  name: string,
  sessionId: string,
  items: T[],
) => {
  const sessionCsv = await newWriter(
    path,
    [...createHeader(items[0]!), newKey(SESSION_ID_HEADER)],
    ...cleanItems(items, sessionId),
  );

  return await save(path, name, sessionCsv);
};

export const currentFileLocation = async (name: string, path: string) => {
  const index = (await readdir(path))
    .filter((file) => extname(file) === ".csv")
    .reduce((biggest, current) => {
      const currentIndex = +(current.split("]-")?.[0]?.replace("[", "") ?? 0);
      return currentIndex > biggest ? currentIndex : biggest;
    }, 0);

  return {
    fileIndex: index,
    filename: namePrefix(index, name),
  };
};

const defaultOptions: Required<UpdateCsvOptions> = {
  name: "items",
  id: randomUUID(),
  path: "./",
  breakpoint: 1_000,
};

export const splitItems = <T extends UnknownItem>(
  items: T[],
  breakpoint: number,
): [T[], T[]] =>
  breakpoint > items.length
    ? [items, []]
    : [items.slice(0, breakpoint), items.slice(breakpoint)];

export const convertToItems = <T extends UnknownItem>(
  data: string[][][],
  headers: string[],
): T[] =>
  data.map((item) =>
    item.reduce(
      (allElements, element, index) => ({
        ...allElements,
        [headers[index]!]: element.toString(),
      }),
      {} as T,
    ),
  );

const updateCsv = async <T extends UnknownItem>(
  items: T[],
  options: UpdateCsvOptions = defaultOptions,
) => {
  const rawBreakpoint = options.breakpoint ?? defaultOptions.breakpoint;

  const { breakpoint, id, name, path } = {
    ...defaultOptions,
    ...options,
    breakpoint: rawBreakpoint > items.length ? rawBreakpoint : items.length,
  };

  if (!existsSync(path)) {
    return await createCsv(path, namePrefix(0, name), id, items);
  }

  const { filename, fileIndex } = await currentFileLocation(name, path);
  const { data } = parse<string[][]>(await readFile(path, "utf8"));

  const headers = data.shift()!;
  const previousItems = convertToItems(data, headers as unknown as string[]);
  const totalItems = [...previousItems, ...cleanItems(items, id)];

  if (totalItems.length >= breakpoint) {
    const [previous, next] = splitItems(totalItems, breakpoint);

    await save(path, filename, previous);
    return await createCsv(path, namePrefix(fileIndex, name), id, next);
  }

  const header = headers.map((key) => newKey(snakelise(key.toString())));

  return await save(
    path,
    filename,
    await newWriter(path, header, ...totalItems),
  );
};

export default updateCsv;
