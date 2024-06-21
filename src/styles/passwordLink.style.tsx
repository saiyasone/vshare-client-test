import { Box, createTheme, styled } from "@mui/material";

const theme = createTheme();

export const HeaderPasswordContainer = styled(Box)({
  marginBottom: "1rem",
});

export const HeaderFileItemContainer = styled(Box)({
  border: "1px solid #000000",
  padding: "15px 8px",
  borderRadius: "5px",
  marginBottom: "1.3rem",

  h2: {
    fontSize: "1rem",
    fontWeight: "bold",
    marginBottom: "0.5rem",
    color: "#4B465C",
  },
});

export const HeaderFileItem = styled(Box)({
  display: "flex",
  flexDirection: "column",
  gap: "0.7rem",
  p: {
    color: "#4B465C",
    fontSize: "0.8rem",
  },
});

export const HeaderTitle = styled("div")({
  maxWidth: "100%",
  h2: {
    fontSize: "1.2rem",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    color: "#4B465C",
    marginBottom: "0.5rem",

    [theme.breakpoints.down("sm")]: {
      fontSize: "0.8rem",
    },
  },
  h5: {
    fontSize: "0.9rem",
  },
});

export const HeaderForm = styled(Box)({
  margin: "0.5rem 0",
});

export const FormInput = styled("div")({
  display: "flex",
  alignItems: "center",
  gap: "1rem",
});

export const FormAction = styled("div")({
  paddingTop: 6,
  marginTop: "0.7rem",
  display: "flex",
  alignItems: "center",
  gap: "1rem",
  justifyContent: "flex-end",

  [theme.breakpoints.down("sm")]: {
    marginTop: "0.5rem",
  },
});

export const HeaderDoneContainer = styled("div")({
  display: "flex",
  alignItems: "center",
  flexDirection: "column",
  marginBottom: "0.8rem",

  h2: {
    fontSize: "1.2rem",
    color: "#4B465C",
    marginBottom: "0.6rem",
  },

  h5: {
    fontSize: "0.9rem",
    color: "#4B465C",
  },
});

export const DoneLabel = styled("label")({
  fontSize: "0.8rem",
  display: "block",
});

export const DoneWrapperContainer = styled("div")({
  border: "1px solid #000",
  borderRadius: "6px",
  padding: "16px 10px",

  h2: {
    fontSize: "0.8rem",
    color: "#4B465C",
  },
});

export const DoneItemContainer = styled("div")({
  marginTop: "0.7rem",
  h2: {
    fontSize: "0.8rem",
    color: "#4B465C",
    marginBottom: "0.2rem",
  },
});

export const DoneItem = styled("div")({
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem",

  p: {
    fontSize: "0.8rem",
    color: "#4B465C",
    // maxWidth: "200px",
  },
});

export const DoneAction = styled("div")({
  marginTop: "1rem",
  display: "flex",
  justifyContent: "center",
  gap: "1rem",
});
