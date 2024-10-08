//mui component and style
import { styled as muiStyled } from "@mui/system";

const SimpleBarContainer: any = muiStyled("div")(({ ...props }: any) => ({
  display: "flex",
  padding: "1rem",
  borderRadius: "4px",
  ...props.barStyle,
}));
const SimpleBarIcon = muiStyled("div")({});
const SimpleBarTitle = muiStyled("div")({});

export default function SimpleBar({ ...props }) {
  return (
    <SimpleBarContainer barStyle={props.barStyle}>
      {props.icon && <SimpleBarIcon>{props.icon}</SimpleBarIcon>}
      <SimpleBarTitle>{props.title}</SimpleBarTitle>
    </SimpleBarContainer>
  );
}
