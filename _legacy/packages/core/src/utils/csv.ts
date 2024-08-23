import {
  objectKeys,
  snakelise,
  tryCatch,
  objectEntries,
} from "@personal/utils";
import { createObjectCsvWriter } from "csv-writer";
import { existsSync, readdirSync } from "fs";
import { readFile, readdir, writeFile } from "fs/promises";
import { parse } from "papaparse";
import { ObjectCsvWriterParams } from "csv-writer/src/lib/csv-writer-factory";
import { extname, resolve } from "path";
import { randomUUID } from "crypto";
import UpdateCsvOptions from "../types/UpdateCsvOptions";
import { ItemMeta, UnknownItem } from "../types/Item";

export const SESSION_ID_HEADER = "sessionId";

export const namePrefix = (index: number, name: string) => `[${index}]-${name}`;

export const clean = <T extends string, R = unknown>(
  key: T,
  value: R,
): Record<string, string> => ({
  [snakelise(key)]: typeof value === "string" ? value : JSON.stringify(value),
});

export const cleanElement = (
  key: string,
  rawElement: unknown,
): Record<string, string> =>
  key === "_meta"
    ? objectEntries(rawElement as ItemMeta).reduce(
        (allElements, [$key, value]) => ({
          ...allElements,
          ...clean(`_${$key}`, value),
        }),
        {},
      )
    : clean(key, rawElement);

export const cleanItems = <
  T extends UnknownItem,
  E extends Record<string, string>,
>(
  items: T[],
  extraMeta?: E,
) =>
  items.map((item) =>
    Object.entries({
      ...item,
      _meta: { ...(extraMeta ?? {}), ...item._meta },
    }).reduce(
      (allElements, [key, element]) => ({
        ...allElements,
        ...cleanElement(key, element),
      }),
      {},
    ),
  );

const save = async <T>(path: string, name: string, newCsv: T) =>
  await tryCatch(
    writeFile,
    resolve(path, `${name}.csv`),
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
  id: string,
  items: T[],
) => {
  const header = createHeader(items[0]!);
  const headerId = newKey(SESSION_ID_HEADER);
  const postItems = cleanItems(items, { [SESSION_ID_HEADER]: id });

  try {
    const sessionCsv = await newWriter(
      resolve(path, `${name}.csv`),
      [...header, headerId],
      ...postItems,
    );

    return await save(path, name, sessionCsv);
  } catch (e) {
    console.error(e);
    return undefined;
  }
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

  if (!existsSync(path) || !readdirSync(path).length) {
    return await createCsv(path, namePrefix(0, name), id, items);
  }

  const { filename, fileIndex } = await currentFileLocation(name, path);
  const { data } = parse<string[][]>(await readFile(path, "utf8"));

  const headers = data.shift()!;
  const previousItems = convertToItems(data, headers as unknown as string[]);
  const totalItems = [
    ...previousItems,
    ...cleanItems(items, { [SESSION_ID_HEADER]: id }),
  ];

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
