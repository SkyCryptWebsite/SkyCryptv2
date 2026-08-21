type InputTypeMap = {
  checkbox: boolean;
  text: string;
  number: number;
  color: string;
};

type InputType = keyof InputTypeMap;

type OptionDefVariant<T extends InputType> = {
  readonly key: string;
  readonly label: string;
  readonly type: T;
  readonly defaultValue: InputTypeMap[T];
};

export type OptionDef = { [T in InputType]: OptionDefVariant<T> }[InputType];

export type OptionGroup = {
  readonly groupName: string;
  readonly options: readonly OptionDef[];
};

type FlattenOptions<T extends readonly OptionGroup[]> = T[number]["options"][number];

type InferSettings<T extends readonly OptionGroup[]> = {
  [O in FlattenOptions<T> as O["key"]]: InputTypeMap[O["type"]];
};

export const cardConfigSchema = [
  {
    groupName: "Visibility Options",
    options: [
      { key: "showXP", label: "Show XP", type: "checkbox", defaultValue: false },
      { key: "showJoinedDate", label: "Show Joined Date", type: "checkbox", defaultValue: false },
      { key: "showFairySouls", label: "Show Fairy Souls", type: "checkbox", defaultValue: false },
      { key: "showMinecraftName", label: "Show Name", type: "checkbox", defaultValue: false },
      { key: "showDungeons", label: "Show Dungeons", type: "checkbox", defaultValue: true },
      { key: "showSkills", label: "Show Skills", type: "checkbox", defaultValue: true }
    ]
  },
  {
    groupName: "Styling",
    options: [
      { key: "border", label: "Enable Border", type: "checkbox", defaultValue: false },
      { key: "borderColor", label: "Border Color", type: "color", defaultValue: "#ffffff" }
    ]
  }
] as const satisfies readonly OptionGroup[];

export type DefaultCardSettings = Partial<InferSettings<typeof cardConfigSchema>>;

export function getDefaults(
  schema: readonly OptionGroup[] = cardConfigSchema
): Record<string, boolean | string | number> {
  const defaults: Record<string, boolean | string | number> = {};
  for (const group of schema) {
    for (const option of group.options) {
      defaults[option.key] = option.defaultValue;
    }
  }
  return defaults;
}

export function parseSettingsFromParams(
  params: URLSearchParams,
  schema: readonly OptionGroup[] = cardConfigSchema
): DefaultCardSettings {
  const settings = getDefaults(schema);
  for (const group of schema) {
    for (const option of group.options) {
      const raw = params.get(option.key);
      if (raw === null) continue;
      switch (option.type) {
        case "checkbox":
          settings[option.key] = raw === "true";
          break;
        case "number":
          settings[option.key] = Number(raw);
          break;
        case "text":
        case "color":
          settings[option.key] = raw;
          break;
      }
    }
  }
  return settings as DefaultCardSettings;
}

export function settingsToParams(
  settings: Record<string, boolean | string | number>,
  schema: readonly OptionGroup[] = cardConfigSchema
): URLSearchParams {
  const defaults = getDefaults(schema);
  const params = new URLSearchParams();
  for (const group of schema) {
    for (const option of group.options) {
      const value = settings[option.key];
      const defaultValue = defaults[option.key];
      if (value !== undefined && value !== defaultValue) {
        params.set(option.key, String(value));
      }
    }
  }
  return params;
}
