export function safeGetProperty(
  obj,
  accessorKey,
  defaultValue: number | null = null,
) {
  if (accessorKey?.includes(".")) {
    const keys = accessorKey.split(".");
    const result = keys.reduce((acc, key) => {
      return acc && Object.prototype.hasOwnProperty.call(acc, key)
        ? acc?.[key]
        : undefined;
    }, obj);

    return result !== undefined ? result : defaultValue;
  } else {
    return obj && Object.prototype.hasOwnProperty.call(obj, accessorKey)
      ? obj[accessorKey]
      : defaultValue;
  }
}

export const convertObjectEmptyStringToNull = (obj) => {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [
      key,
      value === "" ? null : value,
    ]),
  );
};
