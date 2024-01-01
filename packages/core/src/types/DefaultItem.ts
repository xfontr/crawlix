import { UUID } from "crypto";

type TypicalData = Partial<{
  id: string | number;
  name: string;
  title: string;
  categories: string | string[];
  tags: string | string[];
  description: string;
  text: string;
  author: string;
  price: string;
  img: string;
  imgAlt: string;
  posted: string | number | Date;
}>;

type DefaultItem<
  T extends Record<string, string | number | object> = Record<
    string,
    string | number | object
  >,
> = T &
  TypicalData & {
    _meta: {
      /**
       * @description Automatically assigned unique ID
       */
      id: UUID;
      /**
       * @description CSS selector used to pick this item
       */
      selector: string;
      /**
       * @description Page where this item was found at
       */
      page: number;
      /**
       * @description Date when this item was scraped
       */
      posted: Date;
      /**
       * @description Automatically assigned number, corresponding to the latest scraped item plus one
       */
      itemNumber: number;
      /**
       * @description Moment of the session where the item was posted, counted in milliseconds
       */
      moment: number;
      /**
       * @description Whether all the elements of this items were successfully scraped or not
       */
      isComplete: boolean;
      /**
       * @description Object including all the item's elements where there was an error
       * @example
       * {
       *  title: {
       *    name: "Wrong selector",
       *    message: "The item used an invalid selector",
       *  }
       * }
       */
      errorLog: Record<string, Error | void>;
      /**
       * @description The URL where the item was obtained from
       */
      url: string;
    };
  };

export default DefaultItem;
