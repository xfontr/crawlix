import { ScraperSpeed } from "@scraper/core";
import { BookDetails } from "../projects/A/A.types";

export const PAGE_LOAD_SPEED_MULTIPLIER: ScraperSpeed = 30;

export const ITEM_DETAILS: Record<string, keyof BookDetails> = {
  editorial: "publisher",
  idioma: "language",
  "ISBN-10": "ISBN",
};
