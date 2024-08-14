export const SELECTORS = {
  ITEMS_LIST: {
    bookLinks: "h2 > a",
  },
  ITEM: {
    details: "[data-feature-name='detailBullets'] li",
    title: "#productTitle",
    author: ".author",
    description: "[data-feature-name='bookDescription']",
    price: ".priceToPay",
    recoPrice: ".basisPrice",
    img: "#landingImage",
  },
  PAGINATION: {
    nextPage: ".s-pagination-item.s-pagination-next",
  },
  COOKIES: {
    accept: "form #sp-cc-accept",
  },
};
