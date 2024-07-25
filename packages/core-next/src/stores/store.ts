import type { Store } from "../types/Store.type";

const store: Store = {
  session: {
    isOver: false,
    log: {
      logs: [],
      totalLogs: 0,
    },
    location: {
      totalLocations: 0,
      history: [],
    },
  },
  items: {
    totalItems: 0,
    items: [],
  },
};

const useStore = () => {
  const getItems = () => [...store.value.items];

  const addItem = (item: Record<string, string>) => {
    store.value.items.push(item);
  };

  const getSessionStatus = () => ({ ...store.session });

  const setSessionStatus = (newStatus: Partial<typeof store.session>) => {
    store.session = { ...store.session, ...newStatus };
  };

  return {
    getItems,
    addItem,
    getSessionStatus,
    setSessionStatus,
  };
};

export default useStore;
