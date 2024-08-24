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

2.- Setting to enable text cleaning (trim, replace "\n" and "\t").ScraperTools module.
8.- Timeout: either remove it, or update it as an attribute only used for pages
9.- Pass a hook that takes care of the errors within the item, if possible

### Done

7.- Failed sessions in a row: Config that the consumer passes, informing the amount of failed sessions prior to the current one. The program will automatically reset the counter or increase it by one depending on the success of the session. After, implement a new notification type that will trigger when X amount of fails happen. Goal: inform the consumer that there is probably a critical error that is preventing the scrapper to run at all.
8.- Premade config packages
9.- Loading bar for the runInLoop function
10.- Better history: store also the moment when the page was reached, and how many items did the scraper take out of that page
11.- IMPORTANT: Spread the \_meta attribute and delete it and/or give the consumer the option to have it spread or as an attribute. This allows to have all the meta data in normal csv columns instead of an annoying stringified object, or instead of having to do additional absurd logic to spread it.

12.- Add try catches and curate everything at Scraper.ts
13.- For the sleeps, allow a random multiplier, so that the await times are even more realistic

14.- For the postItem, have a curry function that allows to add only partial item data. And then the final postItem that submits the thing
