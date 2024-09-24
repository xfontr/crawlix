---
title: Getting started
type: docs
prev: /
next: docs/folder/
---

## What the hell is this

Crawlix is a web scraping framework that adds a layer over your favorite scraper and takes care of handling all the data.

With Crawlix, you can escalate your web scraper without losing your mind. We take care of all the boring stuff:

- Error handling
- Logging
- Storing and cleaning scraped items
- Safety checks (timeouts, flood gates)
- Defining offsets, limits

### @crawlix/core

Crawlix, with no external integrations. You get to choose which scraper tool you use.

### @crawlix/puppeteer

With Puppeteer integration. Inits said tool and offers a bunch of utils that abstract the majority of the code.

## Set up

### Requirements

- Node.js version 18.17.0 or higher.
- A node package manager, such as npm or pnpm.

### Installing dependencies

```bash
# PNPM
$ pnpm add @crawlix/core
$ pnpm add @crawlix/puppeteer # Optional

# NPM
$ npm install @crawlix/core
$ npm install @crawlix/puppeteer # Optional
```
