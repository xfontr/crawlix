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

### Env variables

SCRAPER_MODEL
SCRAPER_OFFSET_PAGE
SCRAPER_OFFSET_URL
SCRAPER_LIMIT_PAGE
SCRAPER_LIMIT_TIMEOUT
SCRAPER_LIMIT_INACTIVITY
SCRAPER_LOGGING_MAX_CRITICALITY
SCRAPER_LOGGING_TYPES
SCRAPER_LOGGING_CATEGORIES
SCRAPER_LOGGING_IS_SIMPLE
SCRAPER_MOCK_USER_PAUSE_DURATION
SCRAPER_MOCK_USER_PAUSE_VARIATION_RANGE
SCRAPER_STORE_CONTENT
SCRAPER_SUCCESS_COMPLETION_RATE
SCRAPER_END_PROCESS

## TODOs

### Pending

- Do isSimple also for store output.
- If store doesn't output locations, this should alter the output content of other items. For example, each item should either not show any location ID (it's pointless because the outcome file won't have it), or should have a explicit location shown.
- Test run store, calcs expected duration, json size, amount of items, etc

### Done

7.- Failed sessions in a row: Config that the consumer passes, informing the amount of failed sessions prior to the current one. The program will automatically reset the counter or increase it by one depending on the success of the session. After, implement a new notification type that will trigger when X amount of fails happen. Goal: inform the consumer that there is probably a critical error that is preventing the scrapper to run at all.
8.- Premade config packages
9.- Loading bar for the runInLoop function
