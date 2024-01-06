# Scraper

Utility script that adds a layer of abstraction over the used scraper (whichever it is) to provide extra functionalities such as storing every single step done, errors, force delays, global timeouts, individual task timeouts, email notificacions, json storing, etc.

## Pre-requisites

### Install pnpm

Pnpm is required in order to properly install and run the app. If you have homebrew, you only need to run the following command and you'll be all set:

```bash
$ brew install pnpm
```

### Recommended set up

The package has been developed with Typescript, so we strongly recommend using an IDE compatible with TS that allows to see all the provided hints (such as Visual Studio Code).

### Define the correct NODE_ENV environment

Depending on where you'll be using the script, you'll have to define the right NODE_ENV variable. This means: you'll need to create a .env file in the root directory and place a variable named as "NODE_ENV".

The possible values are:

- dev
- test
- prod

There is no need to manually set the "test" value for testing. We recommend to set "dev" for local environments and "prod" once the script is being used in production.

This NODE_ENV variable is a must for the correct functioning of the app.

### Set up configurations (optional, recommended)

The app defines a set of default configuration variables. With them, the script will run seamlessly without the need to actually do any set up. However, if you wish to customize the experience, take a look at the .env.example file to learn each possible .env option.

It is important to note that you can also customize every single configuration variable from the code itself. These hard-coded configs will be placed above the .env, in case you accidentally have two configs for the same value.

Example:

```ts
const session = Session({
  globalTimeout: 100,
  // Or any other variable
}).init();
```

See below at "Set up configuration variables" in order to learn all the available options.

### Set up a test email account (recommended for developers)

Use the Ethereal email free service to get the required account credentials. This is required to pass the Email service tests.

## Run

```bash
$ cd [project_root]
$ pnpm i
$ pnpm run dev
$ pnpm run test # Optional
```

## Documentations

See scraper/core/README.md for more information on the script.

## TODOs

1.- [DONE] VERY IMPORTANT: Allow to recursively scrap pages until the limit is reached.
2.- Setting to enable text cleaning (trim, replace "\n" and "\t").
3.- [DONE] Long term: Plugins attribute that allows inserting external functions, instead of having a ScraperTools module.
4.- [DONE] Fix randomly breaking usage-data function + consider adding a try catch for it.
5.- [DONE] When saving stuff in the data/ folder, verify first if there is such a folder. If not, create it.
6.- Unsafe mode: allows the consumer to remove the default maxs
7.- [DONE] Do we really need an abrupt error symbol? Maybe we should simply throw a custom error
8.- Timeout: either remove it, or update it as an attribute only used for pages
9.- Pass a hook that takes care of the errors within the item, if possible
