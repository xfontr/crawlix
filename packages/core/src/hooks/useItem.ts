import { useItemStore } from "../stores";

const useItems = () => {
  const { initItem } = useItemStore();

  return { initItem };
};

export default useItems;
