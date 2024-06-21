export function prettyNumberFormat(
  number: any,
  options = {},
  defaultValue = "00.00",
) {
  return (number || defaultValue).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    ...options,
  });
}

export const generateRandomUniqueNumber = () => {
  const timestamp = new Date().getTime();
  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  const uniqueId = timestamp + randomDigits;
  return uniqueId;
};
