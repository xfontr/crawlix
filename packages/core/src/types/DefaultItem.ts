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
      id: UUID;
      selector: string;
      page: number;
      posted: Date;
      itemNumber: number;
    };
  };

export default DefaultItem;
