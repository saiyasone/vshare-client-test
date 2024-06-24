import { safeGetProperty } from "./object.util";

//accumulate an array to a number
export const accumulateArray = (inputArray, inputKey = "") => {
  return (inputArray || []).reduce(
    (accumulator, currentValue) =>
      accumulator +
      (inputKey
        ? Number(safeGetProperty(currentValue, inputKey, 0))
        : currentValue),
    0,
  );
};

//covert a number to a pretty string
export const intToPrettyString = (inputNumber) => {
  const num = parseFloat(
    (inputNumber || 0)?.toString().replace(/[^0-9.,-]/g, ""),
  );

  if (isNaN(num)) {
    return "Invalid Number";
  }

  if (num < 1000 && num > -1000) {
    return num.toString();
  }

  const isNegative = num < 0;
  const absoluteNum = Math.abs(num);

  const si = [
    { v: 1e18, s: "E" },
    { v: 1e15, s: "P" },
    { v: 1e12, s: "T" },
    { v: 1e9, s: "B" },
    { v: 1e6, s: "M" },
    { v: 1e3, s: "K" },
  ];

  for (let index = 0; index < si.length; index++) {
    if (absoluteNum >= si[index].v) {
      const formattedNum = (absoluteNum / si[index].v)
        .toFixed(2)
        .replace(/\.0+$|(\.[0-9]*[1-9])0+$/, "$1");

      return (isNegative ? "-" : "") + formattedNum + si[index].s;
    }
  }

  return (isNegative ? "-" : "") + absoluteNum.toString();
};
