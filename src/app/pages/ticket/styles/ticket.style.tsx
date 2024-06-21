import { Box, styled } from "@mui/material";
import { createTheme } from "@mui/material/styles";
const theme = createTheme();

export const CardHeaderTitle = styled("div")({
  h3: {
    color: "#5D596C",
    fontSize: "1.2rem",
    marginBottom: "1rem",
  },
});

export const CardHeaderFunction = styled("div")({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
});

export const DivLeftHeader = styled("div")({
  width: "50%",
  [theme.breakpoints.between("sm", "md")]: {
    width: "30%",
  },
});

export const DivRightHeader = styled("div")({
  width: "50%",
  [theme.breakpoints.between("sm", "md")]: {
    width: "70%",
    marginLeft: "1rem",
  },
});

export const ListFilter = styled(Box)({
  display: "flex",
  flexDirection: "column",
  marginTop: "1rem",
  justifyContent: "space-between",
  [theme.breakpoints.down("sm")]: {
    display: "block",
  },
});

export const FileManage = styled(Box)(({ theme }) => ({
  display: "flex",
  columnGap: theme.spacing(2),
}));
export const FilterFile = styled(Box)({
  display: "flex",
});
export const FilterExport = styled(Box)({
  display: "flex",
});

export const PackageSearchContainer = styled(Box)({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
});

export const TicketStyle = styled(Box)({
  width: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  [theme.breakpoints.down("sm")]: {},
});

export const IncomeFieldStyle = styled("div")({
  display: "flex",
  columnGap: 4,
});

export const IncomeFieldLabelStyle = styled("span")({});

export const IncomeFieldValueStyle = styled("span")({
  fontWeight: 500,
});
