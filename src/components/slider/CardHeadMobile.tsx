import {
  Box,
  Card,
  CardContent,
  Grid,
  Paper,
  Typography,
  styled,
} from "@mui/material";
import useAuth from "hooks/useAuth";
import { Base64 } from "js-base64";
import { useNavigate } from "react-router-dom";
import * as MUI from "styles/component.style";
import { convertBytetoMBandGB } from "utils/storage.util";
const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(0),
  margin: "10px 0",
  textAlign: "left",
  color: theme.palette.text.secondary,
  boxShadow: "rgba(0, 0, 0, 0.09) 0px 3px 12px",
}));

const FileTypeTitle: any = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
  fontSize: "0.8rem",
  marginTop: "5px",
}));
export default function CardHeadMobile(props) {
  const navigate = useNavigate();
  const { user }: any = useAuth();
  const handleClick = (val) => {
    const status = Base64.encode("active", true);
    const value = Base64.encode(val, true);
    const userId = Base64.encode(user?._id, true);
    navigate(`/file/${userId}/${value}/${status}`);
    if (!val) {
      navigate(`/myfile/file/${userId}/${value}/${status}`);
    }
  };
  return (
    <div>
      <Grid item sm={6}>
        <Item>
          <Card onClick={() => handleClick(props.type)}>
            <CardContent
              sx={{
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <Box>
                <MUI.MyclouldIcon>{props.icon}</MUI.MyclouldIcon>
                <FileTypeTitle component="h6" sx={{ mb: 1 }}>
                  {props.title}
                </FileTypeTitle>
                <Typography component="p" style={{ fontSize: "0.8rem" }}>
                  {props.type === "application"
                    ? convertBytetoMBandGB(props.data.application)
                    : ""}
                  {props.type === "image"
                    ? convertBytetoMBandGB(props.data.image)
                    : ""}
                  {props.type === "video"
                    ? convertBytetoMBandGB(props.data.video)
                    : ""}
                  {props.type === "audio"
                    ? convertBytetoMBandGB(props.data.audio)
                    : ""}
                  {props.type === "text"
                    ? convertBytetoMBandGB(props.data.text)
                    : ""}
                  {props.type === "other"
                    ? convertBytetoMBandGB(props.data.other)
                    : ""}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Item>
      </Grid>
    </div>
  );
}
