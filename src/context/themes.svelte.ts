import { browser } from "$app/environment";
import { loadOldStorageKey } from "$ctx/utils";
import { DEFAULT_THEME, legacyThemeV4Schema, mergeThemeWithDefaults, migrateThemeV4ToV5, ThemeEngine, themeV5Schema, type ThemeV5 } from "$lib/shared/themes";
import { FIRST_PARTY_THEMES } from "$lib/shared/themes/first-party";
import * as devalue from "devalue";
import { setTheme, theme as activeModeWatcherTheme, themeStorageKey } from "mode-watcher";
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
  #themes = new PersistedState<unknown[]>("skycryptThemes", [], { serializer: devalueSerializer });

  constructor() {
    $effect.pre(() => {
      untrack(() => {
        this.#migrateOldTheme();
        this.#normalizePersistedThemes();
        this.#normalizeActiveThemeStorage();
        ThemeEngine.syncRuntimeThemes(this.userThemes);

        const activeId = this.#resolveTheme(this.activeThemeId) ? this.activeThemeId : "default";
        if (browser) {
          setTheme(activeId);
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

  get activeTheme(): ThemeV5 | null {
    return this.#resolveTheme(this.activeThemeId);
  }

  get allThemes(): ThemeV5[] {
    return [...FIRST_PARTY_THEMES, ...this.userThemes];
  }

  get userThemes(): ThemeV5[] {
    if (!Array.isArray(this.#themes.current)) return [];
    return this.#themes.current.filter((theme): theme is ThemeV5 => themeV5Schema.safeParse(theme).success);
  }

  saveTheme(theme: ThemeV5): void {
    const result = themeV5Schema.safeParse(theme);
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
        ...result.data,
        metadata: {
          ...result.data.metadata,
          updatedAt: Date.now()
        }
      };
      this.#themes.current = updated;
    } else {
      this.#themes.current = [
        ...this.userThemes,
        {
          ...result.data,
          metadata: {
            ...result.data.metadata,
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

  duplicateTheme(id: string): ThemeV5 | null {
    const original = this.#resolveTheme(id);
    if (!original) return null;

    const duplicateId = `${id}-copy-${Date.now()}`;
    const duplicate: ThemeV5 = {
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

  #resolveTheme(id: string): ThemeV5 | null {
    if (id === "default") return DEFAULT_THEME;

    const firstParty = FIRST_PARTY_THEMES.find((t) => t.metadata.id === id);
    if (firstParty) return firstParty;

    const userTheme = this.userThemes.find((t) => t.metadata.id === id);
    if (userTheme) return mergeThemeWithDefaults(userTheme);

    return null;
  }

  #normalizePersistedThemes(): void {
    if (!Array.isArray(this.#themes.current)) {
      this.#themes.current = [];
      return;
    }

    const validThemes: ThemeV5[] = [];
    for (const theme of this.#themes.current) {
      const v5 = themeV5Schema.safeParse(theme);
      if (v5.success) {
        validThemes.push(v5.data);
        continue;
      }

      const v4 = legacyThemeV4Schema.safeParse(theme);
      if (v4.success) {
        validThemes.push(migrateThemeV4ToV5(v4.data));
      }
    }

    if (devalue.stringify(validThemes) !== devalue.stringify(this.#themes.current)) {
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
