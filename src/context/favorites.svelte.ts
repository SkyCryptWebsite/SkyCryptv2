import { loadOldStorageKey } from "$ctx/utils";
import { PersistedState } from "runed";
import { createContext, untrack } from "svelte";

interface FavoritesData {
  uuid: string;
  ign: string;
}

export class FavoritesContext {
  #data = new PersistedState<FavoritesData[]>("skycryptFavorites", []);

  constructor() {
    $effect.pre(() => {
      untrack(() => {
        this.loadOldFavorites();
      });
    });
  }

  get current() {
    return this.#data.current;
  }

  set current(value: FavoritesData[]) {
    this.#data.current = value;
  }

  loadOldFavorites() {
    loadOldStorageKey("favorites", (value: FavoritesData[]) => {
      this.current = value;
    });
  }
}

const [getFavorites, setFavorites] = createContext<FavoritesContext>();

function initFavorites() {
  const favorites = new FavoritesContext();
  setFavorites(favorites);
  return favorites;
}

export { getFavorites, initFavorites };
