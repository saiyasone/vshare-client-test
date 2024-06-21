import * as Mui from "styles/dialog/dialogCreateFileDrop.style";

// component and functions
import { useLazyQuery } from "@apollo/client";
//mui component and style
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DownloadDoneIcon from "@mui/icons-material/DownloadDone";
import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import { styled as muiStyled } from "@mui/system";
import { QUERY_FILE_DROP_URL_PRIVATE } from "api/graphql/fileDrop.graphql";
import BaseDialogV1 from "components/BaseDialogV1";
import { ENV_KEYS } from "constants/env.constant";
import { Form, Formik } from "formik";
import useAuth from "hooks/useAuth";
import moment from "moment";
import { useEffect, useState } from "react";
import CopyToClipboard from "react-copy-to-clipboard";
import { successMessage } from "utils/alert.util";
import { generateRandomUniqueNumber } from "utils/number.util";
import * as Yup from "yup";

const DialogPreviewFileV1Boby = muiStyled("div")(({ theme }) => ({
  width: "100%",
  display: "flex",
  flexDirection: "column",
  rowGap: theme.spacing(3),
  "& .MuiDialogActions-root": {
    display: "none",
  },
}));

const createFileDropSchema = Yup.object().shape({
  title: Yup.string().min(2).max(50).trim().required(),
  description: Yup.string()
    .min(2)
    .trim()
    .transform((val) => (val ? val : null))
    .nullable(),
});

const DialogCreateFileDrop = (props) => {
  const { user }: any = useAuth();
  const link = ENV_KEYS.VITE_APP_FILE_DROP_LINK || "";
  const [value, setValue] = useState(link);
  const [isCopy, setIsCopy] = useState(false);
  const [isShow, setIsShow] = useState(false);
  const [selectDay, setSelectDay] = useState(1);
  const [expiredDate, setExpiredDate] = useState<any>(null);
  const [latestUrl, setLatestUrl] = useState("");
  const [activePrivateFileDrop, setActivePrivateFileDrop] = useState<any>(null);
  const mMobileScreen = useMediaQuery("(max-width:320px)");
  const [queryFileDropLinks] = useLazyQuery(QUERY_FILE_DROP_URL_PRIVATE, {
    fetchPolicy: "no-cache",
  });

  const handleCopyLink = () => {
    setIsCopy(true);
    successMessage("You've copied link!!", 3000);
  };

  const calculateExpirationDate = (days) => {
    const today = new Date();
    const expirationDate = new Date(today);
    expirationDate.setDate(today.getDate() + days);

    return expirationDate.toISOString();
  };

  const handleExpiredDateChange = (event) => {
    const selectedDays = event.target.value;
    setSelectDay(selectedDays);

    const expirationDateTime = calculateExpirationDate(selectedDays);
    setExpiredDate(moment(expirationDateTime).format("YYYY-MM-DD h:mm:ss"));
  };

  const handleGenerateLink = (values) => {
    successMessage("Create file drop link successful!", 3000);
    setIsCopy(false);

    handleExpiredDateChange({
      target: {
        value: selectDay || 1,
      },
    });

    const genLink = link + user?._id + "-" + generateRandomUniqueNumber();
    setValue(genLink);
    setIsShow(true);
    props.handleChange(genLink, expiredDate, values, activePrivateFileDrop);
  };

  const queryFileDropLink = async () => {
    try {
      const result = (
        await queryFileDropLinks({
          variables: {
            where: {
              folderId: props?.folderId,
              createdBy: user?._id,
              status: "opening",
            },
          },
        })
      ).data?.getPrivateFileDropUrl?.data;
      if (result) {
        const lastRecord = result[result.length - 1];
        setLatestUrl(lastRecord?.url);
        setActivePrivateFileDrop(lastRecord);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (props?.folderId && user) {
      queryFileDropLink();
    }
  }, [props?.folderId, user]);

  useEffect(() => {
    if (expiredDate) {
      setExpiredDate(null);
    }
  }, [props?.isOpen]);

  return (
    <BaseDialogV1
      {...props}
      dialogProps={{
        PaperProps: {
          sx: {
            overflowY: "initial",
            maxWidth: "500px",
          },
        },
      }}
      dialogContentProps={{
        sx: {
          backgroundColor: "white !important",
          borderRadius: "6px",
          padding: (theme) => `${theme.spacing(8)} ${theme.spacing(6)}`,
        },
      }}
    >
      <DialogPreviewFileV1Boby>
        <Mui.FiledropContainer>
          <Formik
            initialValues={{
              title: activePrivateFileDrop?.title || "",
              description: activePrivateFileDrop?.description || "",
            }}
            enableReinitialize
            validationSchema={createFileDropSchema}
            onSubmit={handleGenerateLink}
          >
            {({ /* errors, touched */ values, handleChange }) => (
              <Form>
                <Mui.ShowHeaderDetail>
                  <Typography variant="h3">
                    Select expired date to this link! Default: 24 hours
                  </Typography>
                  <Typography variant="h6">
                    Please share this link with the intended recipient of the
                    file.
                  </Typography>
                </Mui.ShowHeaderDetail>

                <FormControl
                  sx={{
                    mt: "0.5rem",
                    display: "block",
                  }}
                >
                  <Typography
                    component="label"
                    sx={{
                      textAlign: "left",
                      display: "block",
                    }}
                  >
                    Title
                  </Typography>
                  <TextField
                    /* {...{
                      ...(errors.title &&
                        touched.title && {
                          error: true,
                          helperText: errors.title || "",
                        }),
                    }}
                    FormHelperTextProps={{
                      sx: {
                        ml: 0,
                      },
                    }} */
                    id="title"
                    name="title"
                    autoFocus
                    size="small"
                    placeholder="title"
                    type="text"
                    fullWidth
                    value={values.title}
                    onChange={handleChange}
                    variant="outlined"
                    InputLabelProps={{
                      shrink: false,
                    }}
                    sx={{ userSelect: "none" }}
                  />
                </FormControl>
                <FormControl
                  sx={{
                    mt: "0.5rem",
                    display: "block",
                  }}
                >
                  <Typography
                    component="label"
                    sx={{
                      textAlign: "left",
                      display: "block",
                    }}
                  >
                    Description
                  </Typography>
                  <TextField
                    /* {...{
                      ...(errors.description &&
                        touched.description && {
                          error: true,
                          helperText: errors.description,
                        }),
                    }}
                    FormHelperTextProps={{
                      sx: {
                        ml: 0,
                      },
                    }} */
                    id="description"
                    name="description"
                    autoFocus
                    size="small"
                    placeholder="description"
                    type="text"
                    fullWidth
                    value={values.description}
                    onChange={handleChange}
                    variant="outlined"
                    InputLabelProps={{
                      shrink: false,
                    }}
                    sx={{ userSelect: "none" }}
                  />
                </FormControl>

                <Mui.GenerateLinkArea>
                  <FormControl sx={{ width: "20%" }} size="small">
                    <InputLabel id="demo-simple-select-label">
                      Expired date
                    </InputLabel>
                    <Select
                      labelId="demo-simple-select-label"
                      id="demo-simple-select"
                      value={selectDay}
                      label="Expired date"
                      onChange={handleExpiredDateChange}
                    >
                      <MenuItem value={1}>
                        1 {mMobileScreen ? "d" : "day"}
                      </MenuItem>
                      <MenuItem value={2}>
                        2 {mMobileScreen ? "d" : "day"}
                      </MenuItem>
                      <MenuItem value={3}>
                        3 {mMobileScreen ? "d" : "day"}
                      </MenuItem>
                    </Select>
                  </FormControl>
                  <TextField
                    sx={{
                      width: "75%",
                      fontSize: "18px !important",
                      color: "grey !important",
                    }}
                    size="small"
                    InputLabelProps={{
                      shrink: false,
                    }}
                    disabled
                    value={value !== link ? value : latestUrl || ""}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          {isCopy ? (
                            <IconButton>
                              <DownloadDoneIcon sx={{ color: "#17766B" }} />
                            </IconButton>
                          ) : (
                            <CopyToClipboard
                              text={value !== link ? value : latestUrl || ""}
                              onCopy={handleCopyLink}
                            >
                              <IconButton
                                aria-label="copy"
                                disabled={
                                  latestUrl
                                    ? false
                                    : value == link
                                    ? true
                                    : false
                                }
                              >
                                <ContentCopyIcon sx={{ fontSize: "1rem" }} />
                              </IconButton>
                            </CopyToClipboard>
                          )}
                        </InputAdornment>
                      ),
                    }}
                  />
                </Mui.GenerateLinkArea>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "start",
                    justifyContent: "start",
                    flexDirection: "column",
                  }}
                >
                  {isShow && (
                    <Typography sx={{ fontSize: "0.8rem", color: "#4B465C" }}>
                      This link will be expired on:
                      {expiredDate && (
                        <span style={{ color: "#17766B" }}>
                          {" "}
                          {expiredDate}.
                        </span>
                      )}
                    </Typography>
                  )}
                  <Button variant="contained" sx={{ mt: 4 }} type="submit">
                    Generate link now
                  </Button>
                </Box>
              </Form>
            )}
          </Formik>
        </Mui.FiledropContainer>
      </DialogPreviewFileV1Boby>
    </BaseDialogV1>
  );
};

export default DialogCreateFileDrop;
