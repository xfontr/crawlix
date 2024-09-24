---
title: Quick start
type: docs
prev: /
next: docs/folder/
---

This page will only show you how to get a full working scraper in a few seconds.

## Install dependencies

```bash
$ npm install @crawlix/core @crawlix/puppeteer
```

Source: [/docs/getting-started#set-up](set up)

## Set a working basic template

Go to our Github's **[example](https://github.com/xfontr/scraper/tree/master/packages/example)** and pretty much copy everything there into a new project.

The fastest way to do that, with a magical one-liner:

```bash
# Clones repository, saves the /example folder and deletes every other folder
sudo git clone https://github.com/xfontr/crawlix.git crawlix && sudo cp -r crawlix/packages/example my-scraper-project && sudo rm -r crawlix
```

### Define selectors

```ts
// src/config/selectors.ts
```

## Adapt the template to your needs

### Scraping a list of items (without clicking each item)

```ts
// main.ts
scrapPage(() => scrapList((item) => scrapItem(item)));
```

### Scraping a list of items (clicking each item)

```ts
// Guide in progress :)
```
