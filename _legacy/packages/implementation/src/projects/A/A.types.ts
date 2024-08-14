export type Book = {
  details: string | undefined;
  title: string | undefined;
  author: string | undefined;
  description: string | undefined;
  price: string | undefined;
  recoPrice: string | undefined;
  img: string | undefined;
} & BookDetails;

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type BookDetails = {
  publisher: string | undefined;
  language: string | undefined;
  ISBN: string | undefined;
  ranking: string | undefined;
};
