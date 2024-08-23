import { useLocationStore } from "../stores";
import type { LocationData } from "../types";

const useLocation = () => {
  const { pushLocation, current } = useLocationStore();

  const pageUp = (location: Omit<Partial<LocationData>, "page"> = {}): void => {
    pushLocation(({ page }) => ({
      ...location,
      name: location.name ?? "Page up",
      page: page + 1,
    }));
  };

  const pageDown = (
    location: Omit<Partial<LocationData>, "page"> = {},
  ): void => {
    pushLocation(({ page }) => ({
      ...location,
      name: location.name ?? "Page down",
      page: page - 1,
    }));
  };

  const goBack = (): void => {
    const previousLocation = current.history.at(-2);

    const previous: Partial<LocationData> = {
      ...(previousLocation?.page ? { page: previousLocation?.page } : {}),
      ...(previousLocation?.url ? { url: previousLocation?.url } : {}),
      ...(previousLocation?.name ? { name: previousLocation?.name } : {}),
    };

    pushLocation((currentLoc) => ({
      ...previous,
      ...currentLoc,
    }));
  };

  const setName = (customName: string): void => {
    pushLocation((current) => ({ ...current, name: customName }));
  };

  const goTo = (customUrl: string, name = ""): void => {
    pushLocation((current) => ({ ...current, name, url: customUrl }));
  };

  const set = (locationData?: Partial<LocationData>): void => {
    pushLocation((current) => ({ ...current, ...locationData }));
  };

  return { pageUp, goBack, pageDown, setName, goTo, set };
};

export default useLocation;
