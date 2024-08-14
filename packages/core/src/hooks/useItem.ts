import { useItemStore } from "../stores";

const useItems = () => {
  const { pushItem } = useItemStore();

  return { pushItem };
};

export default useItems;
