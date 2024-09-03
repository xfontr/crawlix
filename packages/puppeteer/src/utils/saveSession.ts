import { writeFile } from "fs/promises";

const saveSession = (path: string) => async (data: string) => {
  await writeFile(`${path}.json`, data);
};

export default saveSession;
