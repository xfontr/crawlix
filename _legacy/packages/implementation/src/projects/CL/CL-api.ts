import { resolve } from "path";
import Book from "./cl.types";
import Scraper from "./cl.init";
import { readdir, writeFile } from "fs/promises";
import { tryCatch } from "@personal/utils";

const PAGE_ENDPOINT = "https://www.casadellibro.com/dupg";
const PAGE_PARAMS = "/libros/literatura/121000000/p";

const api = {
  getFullPage: async (page: number): Promise<Response> =>
    await fetch(PAGE_ENDPOINT, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        hash: "",
        path: `/libros/literatura/121000000/p${page}`,
        query: {},
      }),
    }),
  getBooksById: async (ids?: string[]): Promise<Response> =>
    await fetch(
      `https://p.casadellibro.com/cdlweb/api/precio/preciosbuscador?paiscache=63&idproductos=${ids?.join(
        "-",
      )}&cop=63-46-1-63-0-0-1-2-2--0-0-0-0-0-0-0.0-0`,
    ),
};

const CLApi = async () => {
  const { runInLoop, afterAll, beforeAll } = await Scraper();

  await beforeAll(async ({ storeGodMode, hooks: { $a } }) => {
    const [page, error] = await $a(async () => {
      const sessionDir = await readdir(resolve(__dirname, "../../../data"));

      const jsonPage = sessionDir.reduce((highestPage, currentPage) => {
        const number = +currentPage.split("_")[0]!;
        return number > highestPage ? number : highestPage;
      }, 0);

      return jsonPage;
    });

    if (error) {
      storeGodMode().offset!.page = 0;
      storeGodMode().location!.page = 0;
      return;
    }

    storeGodMode().offset!.page = page!;
    storeGodMode().location!.page = page!;
  });

  await runInLoop(
    async ({ store, hooks: { postItem, nextPage, $$a, $a }, index }) => {
      const { page } = store().location;

      const [pageData, error] = await $$a(async () => {
        const response = await api.getFullPage(page);

        return JSON.parse(await response.text()) as {
          componentsList: { content: { products: Book[] } }[];
        };
      }, 1);

      if (pageData && !error) {
        const bookIDs = pageData.componentsList[2]?.content?.products
          ?.map((book) => book?.id)
          .filter((bookId) => bookId);

        const [bookData] = await $a(async () => {
          const response = await api.getBooksById(bookIDs);

          const [bookExtraData] = await tryCatch<
            {
              productoGA: Book["productoGA"];
            }[]
          >(async () => JSON.parse(await response.text()));

          // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
          return bookExtraData!.reduce(
            (books, currentBook) => ({
              ...books,
              [currentBook.productoGA.id]: currentBook,
            }),
            {} as Record<
              string,
              {
                productoGA: Book["productoGA"];
              }
            >,
          );
        }, 0.7);

        pageData.componentsList[2]?.content?.products?.forEach(
          ({ isbn, resumen, reviews, id, precioDesde }) => {
            const { productoGA } = bookData[id as keyof typeof bookData]! as {
              productoGA: Book["productoGA"];
            };

            postItem(
              {
                id,
                isbn,
                resumen,
                rating: reviews?.rating,
                subcategoria: productoGA.subcategoria,
                autor: productoGA.autor,
                nombre: productoGA.nombre,
                precioDesde,
                stock: productoGA.stock,
                editorial: productoGA.editorial,
                distribuidor: productoGA.distribuidor,
                tipoProducto: productoGA.tipoProducto,
                generoA: productoGA.familiasPorNivel.nivel3,
                generoB: productoGA.familiasPorNivel.nivel4,
              },
              undefined,
            );
          },
        );
      }

      console.log({ index });
      nextPage(PAGE_PARAMS + (page + 1).toString());
    },
  );

  const result = await afterAll(
    async ({ saveItemsLocally, saveAsJson, store, notify }) => {
      await notify("CRITICAL_ERROR", resolve(__dirname, "../../../.out/email"));

      await saveItemsLocally(resolve(__dirname, "../../../.out/items.csv"));

      await saveAsJson(
        resolve(__dirname, "../../../.out/data"),
        store().location.page.toString() + "_",
      );

      await writeFile(resolve("./src/ignore-me.json"), "{}", "utf-8");
    },
  );

  console.log({ result });
};

export default CLApi;
