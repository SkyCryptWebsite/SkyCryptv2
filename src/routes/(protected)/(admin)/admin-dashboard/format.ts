const dateFormat = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeZone: "UTC" });
const dateTimeFormat = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" });

/** Dates are shown in UTC so staff in different time zones see the same values. */
export const formatDate = (value: Date | string) => dateFormat.format(new Date(value));
export const formatDateTime = (value: Date | string) => `${dateTimeFormat.format(new Date(value))} UTC`;
export const formatNumber = (value: number) => value.toLocaleString("en-US");
