import { browser } from "$app/environment";
import { loadOldStorageKey } from "$ctx/utils";
import { DEFAULT_THEME, mergeThemeWithDefaults, ThemeEngine, themeV4Schema, type ThemeV4 } from "$lib/shared/themes";
import { FIRST_PARTY_THEMES } from "$lib/shared/themes/first-party";
import * as devalue from "devalue";
import { setMode, setTheme, theme as activeModeWatcherTheme, themeStorageKey } from "mode-watcher";
import { PersistedState } from "runed";
import { createContext, untrack } from "svelte";

const ACTIVE_THEME_STORAGE_KEY = "skycryptActiveTheme";
themeStorageKey.current = ACTIVE_THEME_STORAGE_KEY;

function ignoreSkippedViewTransition(error: unknown): void {
  if (error instanceof DOMException && error.name === "AbortError") return;
  console.warn("Theme transition failed", error);
}

function runThemeTransition(callback: () => void): void {
  if (!document.startViewTransition) {
    callback();
    return;
  }

  const transition = document.startViewTransition(callback);
  void transition.ready.catch(ignoreSkippedViewTransition);
  void transition.finished.catch(ignoreSkippedViewTransition);
}

const devalueSerializer = {
  serialize: devalue.stringify,
  deserialize: <T>(value: string): T | undefined => {
    try {
      return devalue.parse(value) as T;
    } catch {
      return undefined;
    }
  }
};

export class ThemeContext {
  #themes = new PersistedState<ThemeV4[]>("skycryptThemes", [], { serializer: devalueSerializer });

  constructor() {
    $effect.pre(() => {
      untrack(() => {
        this.#migrateOldTheme();
        this.#normalizeActiveThemeStorage();
        this.#discardInvalidThemes();
        ThemeEngine.syncRuntimeThemes(this.userThemes);

        const activeId = this.#resolveTheme(this.activeThemeId) ? this.activeThemeId : "default";
        if (browser) {
          setTheme(activeId);
          const theme = this.#resolveTheme(activeId);
          if (theme) {
            if (!this.isFirstParty(theme.metadata.id)) {
              setMode(theme.mode);
            }
          }
        }
      });
    });
  }

  get activeThemeId(): string {
    return activeModeWatcherTheme.current || "default";
  }

  set activeThemeId(id: string) {
    if (browser) {
      const resolvedId = this.#resolveTheme(id) ? id : "default";
      const theme = this.#resolveTheme(resolvedId);
      if (theme) {
        if (!this.isFirstParty(resolvedId)) {
          setMode(theme.mode);
        }

        if (resolvedId === this.activeThemeId) {
          ThemeEngine.setActiveTheme(resolvedId);
        } else {
          runThemeTransition(() => ThemeEngine.setActiveTheme(resolvedId));
        }
      }
    } else {
      setTheme(this.#resolveTheme(id) ? id : "default");
    }
  }

  get activeTheme(): ThemeV4 | null {
    return this.#resolveTheme(this.activeThemeId);
  }

  get allThemes(): ThemeV4[] {
    return [...FIRST_PARTY_THEMES, ...this.userThemes];
  }

  get userThemes(): ThemeV4[] {
    return Array.isArray(this.#themes.current) ? this.#themes.current : [];
  }

  saveTheme(theme: ThemeV4): void {
    const result = themeV4Schema.safeParse(theme);
    if (!result.success) {
      console.warn("Cannot save invalid theme", result.error);
      return;
    }

    if (this.isFirstParty(theme.metadata.id)) {
      console.warn(`Cannot save first-party theme: ${theme.metadata.id}`);
      return;
    }

    const existingIndex = this.userThemes.findIndex((t) => t.metadata.id === theme.metadata.id);

    if (existingIndex >= 0) {
      const updated = [...this.userThemes];
      updated[existingIndex] = {
        ...theme,
        metadata: {
          ...theme.metadata,
          updatedAt: Date.now()
        }
      };
      this.#themes.current = updated;
    } else {
      this.#themes.current = [
        ...this.userThemes,
        {
          ...theme,
          metadata: {
            ...theme.metadata,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            version: 1
          }
        }
      ];
    }

    ThemeEngine.syncRuntimeThemes(this.userThemes);
  }

  deleteTheme(id: string): void {
    if (this.isFirstParty(id)) {
      console.warn(`Cannot delete first-party theme: ${id}`);
      return;
    }

    this.#themes.current = this.userThemes.filter((t) => t.metadata.id !== id);
    ThemeEngine.syncRuntimeThemes(this.userThemes);

    if (this.activeThemeId === id) {
      ThemeEngine.setActiveTheme("default");
    }
  }

  duplicateTheme(id: string): ThemeV4 | null {
    const original = this.#resolveTheme(id);
    if (!original) return null;

    const duplicateId = `${id}-copy-${Date.now()}`;
    const duplicate: ThemeV4 = {
      ...original,
      metadata: {
        ...original.metadata,
        id: duplicateId,
        name: `${original.metadata.name} (Copy)`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        version: 1
      }
    };

    this.saveTheme(duplicate);
    return duplicate;
  }

  isFirstParty(id: string): boolean {
    return id === "default" || FIRST_PARTY_THEMES.some((t) => t.metadata.id === id);
  }

  #resolveTheme(id: string): ThemeV4 | null {
    if (id === "default") return DEFAULT_THEME;

    const firstParty = FIRST_PARTY_THEMES.find((t) => t.metadata.id === id);
    if (firstParty) return firstParty;

    const userTheme = this.userThemes.find((t) => t.metadata.id === id);
    if (userTheme) return mergeThemeWithDefaults(userTheme);

    return null;
  }

  #discardInvalidThemes(): void {
    if (!Array.isArray(this.#themes.current)) {
      this.#themes.current = [];
      return;
    }

    const validThemes = this.#themes.current.filter((theme) => themeV4Schema.safeParse(theme).success);
    if (validThemes.length !== this.#themes.current.length) {
      this.#themes.current = validThemes;
    }
  }

  #migrateOldTheme(): void {
    loadOldStorageKey("skycryptTheme", (oldThemeId: string) => {
      if (!localStorage.getItem(ACTIVE_THEME_STORAGE_KEY)) {
        localStorage.setItem(ACTIVE_THEME_STORAGE_KEY, oldThemeId);
      }
    });
  }

  #normalizeActiveThemeStorage(): void {
    const stored = localStorage.getItem(ACTIVE_THEME_STORAGE_KEY);
    if (!stored) {
      setTheme("default");
      return;
    }

    let activeId = stored;
    try {
      const parsed = devalue.parse(stored);
      if (typeof parsed === "string") {
        activeId = parsed;
      }
    } catch {
      try {
        const parsed = JSON.parse(stored);
        if (typeof parsed === "string") {
          activeId = parsed;
        }
      } catch {
        // Stored value is already a plain string.
      }
    }

    if (!this.#resolveTheme(activeId)) {
      activeId = "default";
    }

    localStorage.setItem(ACTIVE_THEME_STORAGE_KEY, activeId);
    setTheme(activeId);
  }

  get current(): string {
    return this.activeThemeId;
  }

  set current(value: string) {
    this.activeThemeId = value;
  }
}

const [getThemeContext, setThemeContext] = createContext<ThemeContext>();

function initTheme() {
  const themeContext = new ThemeContext();
  setThemeContext(themeContext);
  return themeContext;
}

export { getThemeContext, initTheme };
