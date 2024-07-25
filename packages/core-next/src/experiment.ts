import useStore from "./stores/store";
import useItemStore from "./stores/item.store";

const experiment = () => {
  const { pushItem } = useItemStore();

  const addAttributes = pushItem();

  addAttributes({ level1: "hola" });
  const postItem = addAttributes({ level2: "adios" });

  postItem();

  const { getItems } = useStore();

  console.log(getItems());
};

export default experiment;
