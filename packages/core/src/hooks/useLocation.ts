import { useLocationStore } from "../stores";

const useLocation = () => {
  const { pushLocation } = useLocationStore();

  const nextPage = (url: string, name: string) => {
    pushLocation(({ page }) => ({
      page: page + 1,
      ...(url ? { url } : {}),
      ...(name ? { name } : {}),
    }));
  };

  const previousPage = (url: string, name: string) => {
    pushLocation(({ page }) => ({
      page: page - 1 <= 0 ? page : page - 1,
      ...(url ? { url } : {}),
      ...(name ? { name } : {}),
    }));
  };

  return { nextPage, previousPage, set: pushLocation };
};

export default useLocation;
