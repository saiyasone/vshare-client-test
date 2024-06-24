export const getColorStatus = (status) => {
  const customStyle = {
    textTransform: "capitalize",
    fontWeight: "bold",
    fontSize: "0.7rem",
  };
  if (status === "new") {
    return {
      backgroundColor: "#D6EFE4",
      ...customStyle,
      color: "#28C76F",
    };
  } else if (status === "pending") {
    return {
      backgroundColor: "#FFEFE1",
      ...customStyle,
      color: "#FF9F43",
    };
  }
  return {
    backgroundColor: "#F1F1F2",
    ...customStyle,
    color: "#A8AAAE",
  };
};
