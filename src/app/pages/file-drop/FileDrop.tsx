import { useMutation } from "@apollo/client";
import { DataGrid } from "@mui/x-data-grid";
import { Base64 } from "js-base64";
import { useState } from "react";
import CopyToClipboard from "react-copy-to-clipboard";
import { NavLink } from "react-router-dom";
import * as Mui from "./styles/fileDrop.style";

// components
import { AiOutlinePlus } from "react-icons/ai";
import NormalButton from "../../../components/NormalButton";
import PaginationStyled from "../../../components/PaginationStyled";
import useAuth from "../../../hooks/useAuth";

// material ui
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DownloadDoneIcon from "@mui/icons-material/DownloadDone";
import FileDownloadDoneIcon from "@mui/icons-material/FileDownloadDone";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
  createTheme,
  useMediaQuery,
} from "@mui/material";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Tooltip from "@mui/material/Tooltip";
import {
  MUTATION_CREATE_FILE_DROP_URL_PRIVATE,
  MUTATION_DELETE_FILE_DROP_URL,
} from "api/graphql/fileDrop.graphql";
import SelectV1 from "components/SelectV1";
import DialogDeleteV1 from "components/dialog/DialogDeleteV1";
import { ENV_KEYS } from "constants/env.constant";
import useManageFileDrop from "hooks/file/useManageFileDrop";
import useFilter from "hooks/useFilter";
import moment from "moment";
import { HiOutlineTrash } from "react-icons/hi";
import { THEMES } from "theme/variant";
import { errorMessage, successMessage } from "utils/alert.util";
import { generateRandomUniqueNumber } from "utils/number.util";

function FileDrop() {
  const theme: any = createTheme();
  const { user }: any = useAuth();
  const isMobile = useMediaQuery("(max-width:767px)");
  const link = ENV_KEYS.VITE_APP_FILE_DROP_LINK;
  const [value, setValue] = useState<any>(link);
  const [isCopy, setIsCopy] = useState<any>(false);
  const [isCopied, setIsCopied] = useState<any>({});
  const [selectDay, setSelectDay] = useState<any>(1);
  const [expiredDate, setExpiredDate] = useState<any>(null);
  const [isShow, setIsShow] = useState<any>(false);
  const [multiId, setMultiId] = useState<any>([]);
  const [openDelete, setOpenDelete] = useState<any>(false);
  const [showCreateform, setShowCreateForm] = useState<any>(false);

  const [createFileDropLink] = useMutation(
    MUTATION_CREATE_FILE_DROP_URL_PRIVATE,
  );
  const [deleteFiledropLink] = useMutation(MUTATION_DELETE_FILE_DROP_URL);

  const [headerData, setHeaderData] = useState<any>({
    title: "",
    description: "",
  });

  const filter = useFilter();
  const manageFileDrop = useManageFileDrop({ filter: filter.data });

  // checked file pagination
  const generateFileDropLink = async () => {
    setIsCopy(false);
    const genLink = link + user?._id + "-" + generateRandomUniqueNumber();
    setValue(genLink);
    try {
      const createfiledropLink = await createFileDropLink({
        variables: {
          input: {
            url: genLink,
            title: headerData?.title,
            description: headerData?.description,
            expiredAt:
              expiredDate == null
                ? moment(calculateExpirationDate(1)).format(
                    "YYYY-MM-DD h:mm:ss",
                  )
                : expiredDate,
          },
        },
      });
      if (createfiledropLink?.data?.createPrivateFileDropUrl?._id) {
        setSelectDay(1);
        setExpiredDate(null);
        manageFileDrop.customeFileDrop();
        setIsShow(true);
        setHeaderData({ title: "", description: "" });
        successMessage("Your new link is created!!", 3000);
      }
    } catch (error: any) {
      errorMessage(error?.message, 3000);
    }
  };

  const handleCopyLink = () => {
    setIsCopy(true);
  };

  const handleCopy = (url, id) => {
    successMessage("Link is copied!", 3000);
    setIsCopied((prev) => ({ ...prev, [id]: true }));
    navigator.clipboard.writeText(url);
    setTimeout(() => {
      setIsCopied((prev) => ({ ...prev, [id]: false }));
    }, 60000);
  };

  const calculateExpirationDate = (days) => {
    const today = new Date();
    const expirationDate = new Date(today);
    expirationDate.setDate(today.getDate() + days);

    // Set a specific time (e.g., 12:00 PM)
    expirationDate.setHours(12, 0, 0, 0);
    return expirationDate.toISOString();
  };

  const handleExpiredDateChange = (event) => {
    const selectedDays = event.target.value;
    setSelectDay(selectedDays);

    const expirationDateTime = calculateExpirationDate(selectedDays);
    setExpiredDate(moment(expirationDateTime).format("YYYY-MM-DD h:mm:ss"));
  };

  const handleTitleChange = (event) => {
    setHeaderData((prevHeaderData) => ({
      ...prevHeaderData,
      title: event.target.value,
    }));
  };

  const handleDescriptionChange = (event) => {
    setHeaderData((prevHeaderData) => ({
      ...prevHeaderData,
      description: event.target.value,
    }));
  };

  const handleDeleteClose = () => {
    setOpenDelete(false);
  };

  const handleMultipleDelete = async () => {
    try {
      let successCount = 0;
      const totalCount = multiId.length;
      for (let i = 0; i < totalCount; i++) {
        const result = await deleteFiledropLink({
          variables: {
            id: parseInt(multiId[i]),
          },
        });
        if (result?.data?.deleteFileDropUrl) {
          successCount++;
          if (successCount === totalCount) {
            handleDeleteClose();
            manageFileDrop.customeFileDrop();
          }
        }
      }
      successMessage("These items selected were deleted successful!", 2000);
      manageFileDrop.customeFileDrop();
    } catch (error: any) {
      const cutErr = error.message.replace(/(ApolloError: )?Error: /, "");
      errorMessage(cutErr, 3000);
    }
  };

  const handleSingleDelete = async () => {
    const id = await multiId[0];
    try {
      const { data } = await deleteFiledropLink({
        variables: {
          id: id,
        },
      });
      if (data && data?.deleteFileDropUrl) {
        successMessage("Item was deleted!", 2000);
        manageFileDrop.customeFileDrop();
      } else {
        errorMessage("Something went wrong during deletion!", 3000);
      }
    } catch (error: any) {
      const cutErr = error.message.replace(/(ApolloError: )?Error: /, "");
      errorMessage(cutErr, 3000);
    }
  };

  const columns: any = [
    {
      field: "no",
      headerName: "ID",
      width: 70,
      headerAlign: "center",
      align: "center",
    },
    { field: "url", headerName: "URL", flex: 1 },
    { field: "title", headerName: "Title", flex: 1 },
    { field: "description", headerName: "description", flex: 1 },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => {
        return (
          <div style={{ color: "green" }}>
            <Chip
              sx={{
                backgroundColor: params?.row?.status
                  ? "rgba(168, 170, 174,0.16)"
                  : "#dcf6e8",
                color: params?.row?.status ? "rgb(168, 170, 174)" : "#29c770",
              }}
              label={params?.row?.status}
              size="small"
            />
          </div>
        );
      },
    },
    {
      field: "folderId",
      headerName: "Source",
      flex: 1,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => {
        const folder = params?.row?.folderId?.folder_name;
        return (
          <div style={{ color: "green" }}>
            <Chip
              sx={{
                backgroundColor: folder ? "#FFEFE1" : "#dcf6e8",
                color: folder ? "#FFA44F" : "#29c770",
              }}
              label={folder ? "/" + folder : "public"}
              size="small"
            />
          </div>
        );
      },
    },
    {
      field: "createdAt",
      headerName: "Created date",
      flex: 1,
      renderCell: (params) => {
        return (
          <div>
            <span>
              {moment(params?.row?.createdAt).format("DD-MM-YYYY h:mm:ss")}
            </span>
          </div>
        );
      },
    },
    {
      field: "expiredAt",
      headerName: "Expired date",
      flex: 1,
      renderCell: (params) => {
        return (
          <div>
            <span>
              {moment(params?.row?.expiredAt).format("DD-MM-YYYY h:mm:ss")}
            </span>
          </div>
        );
      },
    },
    {
      field: "Action",
      headerName: "Action",
      sortable: false,
      headerAlign: "center",
      align: "center",
      flex: 1,
      renderCell: (params) => (
        <strong>
          <Tooltip title="Copy file drop link" placement="top">
            {isCopied[params?.row?._id] ? (
              <IconButton disabled>
                <FileDownloadDoneIcon sx={{ color: "#17766B" }} />
              </IconButton>
            ) : (
              <IconButton
                onClick={() => handleCopy(params?.row?.url, params?.row?._id)}
              >
                <ContentCopyIcon sx={{ fontSize: "16px" }} />
              </IconButton>
            )}
          </Tooltip>
          <Tooltip title="View details" placement="top">
            <IconButton
              component={NavLink}
              to={`/file-drop-detail/${Base64.encode(params?.row?.url)}`}
            >
              <RemoveRedEyeIcon sx={{ fontSize: "18px" }} />
            </IconButton>
          </Tooltip>
        </strong>
      ),
    },
  ];

  return (
    <Typography
      component="div"
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      {showCreateform && (
        <Mui.PaperGlobal>
          <Mui.FiledropContainer>
            <Mui.ShowHeaderDetail>
              <Typography variant="h3">
                Select expired date to this link! Default: 24 hours
              </Typography>
              <Typography variant="h6">
                Please share this link with the intended recipient of the file.
              </Typography>
            </Mui.ShowHeaderDetail>
            <div style={{ textAlign: "start", marginTop: "1rem" }}>
              <InputLabel
                sx={{
                  color: "grey !important",
                }}
              >
                Title
              </InputLabel>
              <TextField
                sx={{
                  width: "100%",
                  fontSize: "18px !important",
                  color: "grey !important",
                }}
                size="small"
                InputLabelProps={{
                  shrink: false,
                }}
                placeholder="Title...."
                value={headerData.title}
                onChange={handleTitleChange}
              />
              <InputLabel
                sx={{
                  color: "grey !important",
                  marginTop: "1rem",
                }}
              >
                Description
              </InputLabel>
              <TextField
                sx={{
                  width: "100%",
                  fontSize: "18px !important",
                  color: "grey !important",
                }}
                size="small"
                InputLabelProps={{
                  shrink: false,
                }}
                placeholder="Description...."
                rows={3}
                multiline
                value={headerData.description}
                onChange={handleDescriptionChange}
              />
            </div>
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
                  <MenuItem value={1}>1 day after created</MenuItem>
                  <MenuItem value={2}>2 days after created</MenuItem>
                  <MenuItem value={3}>3 days after created</MenuItem>
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
                value={value == link ? "Link to upload..." : value}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      {isCopy ? (
                        <IconButton>
                          <DownloadDoneIcon sx={{ color: "#17766B" }} />
                        </IconButton>
                      ) : (
                        <CopyToClipboard text={value} onCopy={handleCopyLink}>
                          <IconButton
                            aria-label="copy"
                            disabled={value == link ? true : false}
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
                  This link: <span style={{ color: "#17766B" }}>{value}</span>{" "}
                  will be expired on: &nbsp;
                  <span style={{ color: "#17766B" }}>
                    {expiredDate
                      ? expiredDate
                      : moment(calculateExpirationDate(1)).format(
                          "YYYY-MM-DD h:mm:ss",
                        )}
                    .
                  </span>
                </Typography>
              )}
              <Button
                variant="contained"
                onClick={generateFileDropLink}
                sx={{ mt: 4 }}
              >
                Generate link now
              </Button>
            </Box>
          </Mui.FiledropContainer>
        </Mui.PaperGlobal>
      )}

      <Mui.PaperGlobal sx={{ flex: 1 }}>
        <Box>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
              color: "gray",
              fontSize: "14px",
            }}
          >
            List of all file drop links
          </Typography>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              marginTop: "1rem",
              justifyContent: "space-between",
              [theme.breakpoints.down("sm")]: {
                display: "block",
              },
            }}
          >
            <Box
              sx={{
                display: isMobile ? "block" : "flex",
                justifyContent: "space-between",
                mb: 4,
              }}
            >
              <Box>
                <Grid container spacing={2} sx={{ width: "100%" }}>
                  <Grid
                    item
                    sm={12}
                    md={6}
                    lg={6}
                    sx={{
                      width: isMobile ? "100%" : "auto",
                    }}
                  >
                    <SelectV1
                      disableLabel
                      selectStyle={{
                        height: "35px",
                        minHeight: "35px",
                        marginRight: "0.5rem",
                        width: isMobile ? "100%" : "150px",
                        color: "#989898",
                      }}
                      selectProps={{
                        disableClear: true,
                        onChange: (e) =>
                          filter.dispatch({
                            type: filter.ACTION_TYPE.PAGE_ROW,
                            payload: e?.value || null,
                          }),
                        options: [
                          { label: 10, value: 10 },
                          { label: 15, value: 15 },
                          { label: 30, value: 30 },
                          { label: 50, value: 50 },
                        ],
                        defaultValue: [{ label: 10, value: 10 }],
                        sx: {
                          "& .MuiInputBase-root": {
                            height: "35px",
                          },
                        },
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>
              <Box>
                <Grid container spacing={2}>
                  <Grid item sm={6} md={4} lg={4}>
                    <SelectV1
                      disableLabel
                      selectStyle={{
                        height: "35px",
                        minHeight: "35px",
                        marginTop: "0.3rem",
                      }}
                      selectProps={{
                        disableClear: true,
                        onChange: (e) =>
                          filter.dispatch({
                            type: filter.ACTION_TYPE.STATUS,
                            payload: e?.value || null,
                          }),
                        options: [
                          { label: "All links", value: "" },
                          { label: "Active", value: "opening" },
                          {
                            label: "Expired",
                            value: "expired",
                          },
                        ],
                      }}
                    />
                  </Grid>
                  <Grid item sm={6} md={4} lg={4}>
                    <NormalButton
                      onClick={() => {
                        setOpenDelete(true);
                      }}
                      sx={{
                        padding: "0 10px",
                        height: "35px",
                        alignItems: "center",
                        border: "1px solid",
                        marginTop: theme.spacing(1),
                        borderColor:
                          theme.name === THEMES.DARK
                            ? "rgba(255,255,255,0.4)"
                            : "rgba(0,0,0,0.4)",
                        borderRadius: "4px",
                        ...(multiId?.length > 0
                          ? {
                              cursor: "pointer",
                              opacity: 0.5,
                            }
                          : {
                              "&:hover": {
                                borderColor:
                                  theme.name === THEMES.DARK
                                    ? "rgb(255,255,255)"
                                    : "rgb(0,0,0)",
                              },
                            }),
                      }}
                    >
                      {!isMobile && (
                        <Box
                          sx={{
                            flex: "1 1 0%",
                            color:
                              theme.name === THEMES.DARK
                                ? "rgb(255,255,255)"
                                : "rgb(0,0,0)",
                          }}
                        >
                          Delete
                        </Box>
                      )}
                      <Box>
                        <HiOutlineTrash
                          style={{
                            fontSize: "1.25rem",
                            color:
                              theme.name === THEMES.DARK
                                ? "rgb(255,255,255)"
                                : "rgb(0,0,0,0.7)",
                          }}
                        />
                      </Box>
                    </NormalButton>
                  </Grid>
                  <Grid item sm={6} md={4} lg={4}>
                    <Button
                      color="primaryTheme"
                      variant="contained"
                      sx={{
                        padding: "0 12px",
                        height: "35px",
                        alignItems: "center",
                        border: "1px solid",
                        borderRadius: "6px",
                        marginTop: theme.spacing(1),
                      }}
                      onClick={() => {
                        setShowCreateForm(!showCreateform);
                      }}
                    >
                      {showCreateform ? (
                        <VisibilityOffIcon />
                      ) : (
                        <AiOutlinePlus />
                      )}
                      &nbsp; {showCreateform ? "Hide" : "Create"}
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </Box>
          </Box>
        </Box>
        <Card>
          <CardContent
            sx={{
              display: "flex",
              flexDirection: "column",
              height: "100%",
              paddingLeft: "0 !important",
              paddingRight: "0 !important",
            }}
          >
            <DataGrid
              sx={{
                borderRadius: 0,
                height: "100% !important",
                "& .MuiDataGrid-columnSeparator": { display: "none" },
                "& .MuiDataGrid-virtualScroller": {
                  overflowX: "hidden",
                },
                "& .MuiDataGrid-cell:focus": {
                  outline: "none",
                },
              }}
              autoHeight
              getRowId={(row) => row?._id}
              rows={manageFileDrop?.data || []}
              columns={columns}
              checkboxSelection
              disableSelectionOnClick
              disableColumnFilter
              disableColumnMenu
              hideFooter
              onSelectionModelChange={(ids: any) => {
                manageFileDrop.setSelectedRow(ids);
                setMultiId(ids);
              }}
            />
            {/* {manageFileDrop?.data?.length > filter.state.pageLimit && ( */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
              }}
            >
              <Box
                sx={{
                  padding: (theme) => theme.spacing(4),
                }}
              >
                Showing 1 to 10 of {manageFileDrop.total} entries
              </Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  padding: (theme) => theme.spacing(4),
                  flex: "1 1 0%",
                }}
              >
                <PaginationStyled
                  currentPage={filter.data.currentPageNumber}
                  total={Math.ceil(
                    manageFileDrop.total / manageFileDrop.pageLimit,
                  )}
                  setCurrentPage={(e) =>
                    filter.dispatch({
                      type: filter.ACTION_TYPE.PAGINATION,
                      payload: e,
                    })
                  }
                />
              </Box>
            </Box>
            {/* )} */}
          </CardContent>
        </Card>
      </Mui.PaperGlobal>
      <DialogDeleteV1
        isOpen={openDelete}
        onClose={handleDeleteClose}
        onConfirm={
          multiId.length > 1 ? handleMultipleDelete : handleSingleDelete
        }
      />
    </Typography>
  );
}

export default FileDrop;
