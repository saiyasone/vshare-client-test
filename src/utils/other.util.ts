export const calPaginationHardCoded = ({ filter, index }) => {
  const indexPageNumber =
    index + (filter?.currentPageNumber * filter?.pageLimit - filter?.pageLimit);

  return indexPageNumber;
};

export const isValueOrNull = (value, falsyValue?) => {
  if (value && value !== "null") {
    return value;
  }
  return falsyValue;
};
