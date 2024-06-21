import { styled } from "@mui/material";

export const FlexBetween = styled("div")({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  height: "40px",
});

export const ShareSelectHeader = styled("div")({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexDirection: "column",

  h2: {
    color: "#454554",
    fontSize: "1.2rem",
    marginBottom: "0.5rem",
  },

  p: {
    color: "#454554",
    fontSize: "0.7rem",
  },
});

export const ShareSelectOwnerContainer = styled("div")({
  margin: "1rem 0",
});

export const ShareProfileContainer = styled("div")({
  display: "flex",
  alignItems: "center",
});

export const ShareProfileImage = styled("div")({
  img: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
  },
});

export const ShareProfileInfo = styled("div")({
  marginLeft: "15px",

  h2: {
    fontSize: "17px",
    fontWeight: "600",
    color: "#454554",
    marginBottom: "5px",
  },

  h5: {
    fontSize: "14px",
    color: "#454554",
  },
});

export const ShareProfileInfoList = styled("div")({
  marginTop: "1rem",
  h2: {
    fontSize: "20px",
    fontWeight: "600",
    color: "#454554",
    marginBottom: "10px",
  },
});

export const ButtonShare = styled("button")({
  color: "#d33",
  fontSize: "20px",
  fontWeight: "bold",
  backgroundColor: "#FCE4E4",
  padding: "8px",
  cursor: "pointer",
  borderRadius: "5px",
  border: 0,
  outline: "none",
});
