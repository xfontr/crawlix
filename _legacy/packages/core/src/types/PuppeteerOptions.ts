interface PuppeteerOptions {
  abortImages?: boolean;
  userAgent?: string | undefined;
  headless?: false | "new";
  args?: string[] | undefined;
  executablePath?: string | undefined;
  ignoreDefaultArgs?: string[] | undefined;
}

export default PuppeteerOptions;
