interface Book {
  id: string;
  isbn: string;
  resumen: string;
  reviews: { rating?: number };
  precioDesde: string;
  productoGA: {
    id: string;
    subcategoria: string;
    autor: string;
    nombre: string;
    familiasPorNivel: {
      nivel4: string;
      nivel3: string;
      nivel2: string;
      nivel1: string;
    };
    editorial: string;
    distribuidor: string;
    stock: string;
    tipoProducto: string;
  };
}

export default Book;
