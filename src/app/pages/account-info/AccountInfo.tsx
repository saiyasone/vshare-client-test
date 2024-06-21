import { DataGrid } from "@mui/x-data-grid";
import axios from "axios";
import CryptoJS from "crypto-js";
import React, { Fragment, useContext, useEffect, useState } from "react";
import CopyToClipboard from "react-copy-to-clipboard";
import * as MUI from "./styles/accountInfo.styles";

// material ui
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import {
  Alert,
  AlertTitle,
  Avatar,
  Box,
  Breadcrumbs,
  Button,
  Checkbox,
  Chip,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputLabel,
  LinearProgress,
  Link,
  MenuItem,
  OutlinedInput,
  Paper,
  Select,
  Typography,
  linearProgressClasses,
  styled,
  useMediaQuery,
} from "@mui/material";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";

import { useLazyQuery, useMutation } from "@apollo/client";
import AddIcon from "@mui/icons-material/Add";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import MoreVertOutlinedIcon from "@mui/icons-material/MoreVertOutlined";
import RemoveRedEyeOutlinedIcon from "@mui/icons-material/RemoveRedEyeOutlined";
import { useLocation, useNavigate } from "react-router-dom";
//commponent
import { useTheme } from "@mui/system";
import { MUTATION_UPDATE_USER, QUERY_USER } from "api/graphql/user.graphql";
import noProfile from "assets/images/no-profile.svg";
import DialogGenerateAvatar from "components/dialog/DialogGenerateAvatar";
import { ENV_KEYS } from "constants/env.constant";
import { EventUploadTriggerContext } from "contexts/EventUploadTriggerProvider";
import useManageGraphqlError from "hooks/useManageGraphqlError";
import useManageSetting from "hooks/useManageSetting";
import { errorMessage, successMessage } from "utils/alert.util";
import {
  getFileNameExtension,
  getFilenameWithoutExtension,
  saveSvgToFile,
} from "utils/file.util";
import useAuth from "../../../hooks/useAuth";
import ChangeUserPasswordSection from "./ChangeUserPasswordSection";
import LoginDevice from "./LoginDevice";
import TwoFactor from "./TwoFactor";
const columns: any = [
  {
    field: "id",
    headerName: "ID",
    width: 100,
    headerAlign: "center",
    align: "center",
  },
  {
    field: "firstName",
    headerName: "CLIENT",
    flex: 1,
    renderCell: () => {
      return (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "start",
          }}
        >
          <Avatar />
          <Box sx={{ marginLeft: "0.5rem" }}>
            <Typography
              variant="h5"
              sx={{ color: "#6F6B7D", fontSize: "1rem", fontWeight: "500" }}
            >
              Paokue
            </Typography>
            <Typography
              variant="h6"
              sx={{ color: "#A5A3AE", fontSize: "0.8rem", fontWeight: "400" }}
            >
              Saolong
            </Typography>
          </Box>
        </Box>
      );
    },
  },
  {
    field: "lastName",
    headerName: "TOTAL",
    flex: 1,
    renderCell: () => {
      return (
        <Typography
          variant="h5"
          sx={{ color: "#6F6B7D", fontSize: "0.9rem", fontWeight: "400" }}
        >
          $3077
        </Typography>
      );
    },
  },
  {
    field: "age",
    headerName: "ISSUED DATE",
    flex: 1,
    renderCell: () => {
      return (
        <Typography
          variant="h5"
          sx={{ color: "#6F6B7D", fontSize: "0.9rem", fontWeight: "400" }}
        >
          09 May 2022
        </Typography>
      );
    },
  },
  {
    field: "fullName",
    headerName: "BALANCE",
    flex: 1,
    headerAlign: "center",
    align: "center",
    renderCell: () => {
      return (
        <Chip
          label="Paid"
          sx={{ background: "#DCF6E8", color: "#28C76F", fontWeight: "600" }}
        />
      );
    },
  },
  {
    headerName: "ACTIONS",
    flex: 1,
    renderCell: () => {
      return (
        <Box>
          <IconButton>
            <EmailOutlinedIcon />
          </IconButton>
          <IconButton>
            <RemoveRedEyeOutlinedIcon />
          </IconButton>
          <IconButton>
            <MoreVertOutlinedIcon />
          </IconButton>
        </Box>
      );
    },
  },
];

const rows = [
  {
    id: 1,
    lastName: "Snow",
    firstName: "Jon",
    age: 35,
    fullName: "paokue saolong",
  },
  {
    id: 2,
    lastName: "Snow",
    firstName: "Jon",
    age: 35,
    fullName: "paokue saolong",
  },
  {
    id: 3,
    lastName: "Snow",
    firstName: "Jon",
    age: 35,
    fullName: "paokue saolong",
  },
];

const BorderLinearProgress = styled(LinearProgress)(({ theme }) => ({
  height: 10,
  borderRadius: 5,
  [`&.${linearProgressClasses.colorPrimary}`]: {
    backgroundColor:
      theme.palette.grey[theme.palette.mode === "light" ? 200 : 800],
  },
  [`& .${linearProgressClasses.bar}`]: {
    borderRadius: 5,
    backgroundColor: "#17766B",
  },
}));

function AccountInfo() {
  const { state } = useLocation();
  const theme = useTheme();
  const { user, signOut }: any = useAuth();
  const navigate = useNavigate();
  const [activeStatus, setActiveStatus] = React.useState<any>(null);
  const isMobile = useMediaQuery("(max-width:600px)");
  const [isDialogGenerateAvatarOpen, setIsDialogGenerateAvatarOpen] =
    useState<any>(false);
  const isTablet = useMediaQuery("(min-width:600px) and (max-width:1024px)");
  const [copied, setCopied] = React.useState<any>(false);
  const [value, setValue] = React.useState<any>(
    "23eaf7f0-f4f7-495e-8b86-fad3261282ac",
  );
  const manageGraphqlError = useManageGraphqlError();

  const matchImage = ["image/png", "image/jpeg", "image/jpg"];
  const [queryUser, { refetch: userRefetch }] = useLazyQuery(QUERY_USER, {
    fetchPolicy: "no-cache",
  });
  const [updateUser] = useMutation(MUTATION_UPDATE_USER);

  const [userAccount, setUserAccount] = useState<any>({});
  const [checked, setChecked] = useState<any>(false);
  const [message, setMessage] = useState<any>(null);
  const [files, setFiles] = useState<any>(null);
  const [preview, setPreview] = useState<any>("");
  const [_fileName, setFileName] = useState<any>(null);
  const [_fileExtension, setFileExtension] = useState<any>(null);
  const [_fileNewName, setFileNewName] = useState<any>(null);
  const eventUploadTrigger = useContext(EventUploadTriggerContext);
  const [showTwoFactor, setShowTwoFactor] = useState<any>(false);
  const [showDeativeAccount, setShowDeativeAccount] = useState<any>(false);
  const [_showRemembeDevice, setShowRemembeDevice] = useState<any>(false);
  const useDataSetting = useManageSetting();
  const [selectedSvgCode, setSelectedSvgCode] = useState<any>("");
  const [selectedImageType, setSelectedImageType] = useState<any>("");
  const [isProfileImageFound, setIsProfileImageFound] = useState<any>(true);
  const LOAD_UPLOAD_URL = ENV_KEYS.VITE_APP_LOAD_UPLOAD_URL;
  const LOAD_DELETE_URL = ENV_KEYS.VITE_APP_LOAD_DELETE_URL;
  const SECRET_KEY = ENV_KEYS.VITE_APP_UPLOAD_SECRET_KEY;

  const settingKey = {
    _2Factor: "TFAITCG",
    deactiveUser: "DUAUDTA",
    rememberDevice: "RMBMEEB",
  };

  function handleCopy() {
    setCopied(true);
    successMessage(copied ? "Copied success!" : "");
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  }

  const handleChange = (event) => {
    setChecked(event.target.checked);
  };

  function findDataSetting(productKey) {
    const dataSetting = useDataSetting.data?.find(
      (data) => data?.productKey === productKey,
    );

    return dataSetting;
  }

  function handleFile(e) {
    const file: any = e.target.files[0];
    if (file) {
      setSelectedImageType("image");
      const matchFileSize: any = 800 * 1024;
      if (matchImage.indexOf(file?.type) === -1) {
        errorMessage(
          "Format file is not valid, file support only jpg, jpeg, png",
          3000,
        );
      } else if (file.size > matchFileSize) {
        errorMessage(
          "File size is large more than 800 kb, Please select file again",
          2000,
        );
      } else {
        setFiles(file);
        preViewImage(file);
      }
    }
  }

  useEffect(() => {
    if (!activeStatus) {
      setActiveStatus(state);
    }
  }, [state, activeStatus]);

  // on-off => 2 Factor Authentication
  useEffect(() => {
    function getDataSettings() {
      const dataFactor: any = findDataSetting(settingKey._2Factor);
      if (dataFactor) {
        if (dataFactor?.status === "on") setShowTwoFactor(true);
      }

      // Deactive account
      const dataDeactive = findDataSetting(settingKey.deactiveUser);
      if (dataDeactive) {
        if (dataDeactive?.status === "on") setShowDeativeAccount(true);
      }

      // Remember device
      const dataDevice = findDataSetting(settingKey.rememberDevice);
      if (dataDevice) {
        if (dataDevice?.status === "on") setShowRemembeDevice(true);
      }
    }

    getDataSettings();
  }, [useDataSetting.data]);

  const handleGetUser = async () => {
    await queryUser({
      variables: {
        where: {
          _id: user?._id,
        },
      },
      onCompleted: (data) => {
        if (data?.getUser?.data.length > 0) {
          setUserAccount(data?.getUser?.data[0]);
          setFileNewName(data?.getUser?.data[0]?.profile);
        }
      },
    });
  };

  React.useEffect(() => {
    handleGetUser();
  }, []);

  const preViewImage = (file) => {
    setFileExtension(getFileNameExtension(file?.name));
    setFileName(getFilenameWithoutExtension(file?.name));
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      setPreview(reader.result);
    };
  };

  const handleCreateLogs = (name, infor, _id) => {
    const data: any = JSON.stringify({
      name: name,
      description: infor,
      createdBy: _id,
    });

    const config = {
      method: "post",
      maxBodyLength: Infinity,
      url: ENV_KEYS.VITE_APP_CREATE_LOG,
      headers: {
        "Content-Type": "application/json",
      },
      data: data,
    };

    axios
      .request(config)
      .then((response) => {
        return response.data;
      })
      .catch((error) => {
        return error;
      });
  };

  const handleUploadToExternalServer = async (
    _index,
    _id,
    file,
    newName,
    path,
  ) => {
    let filePath = "";
    if (path === "main") {
      filePath = "";
    } else {
      filePath = "/" + path;
    }

    const pathBunny = user.newName + "-" + user._id + filePath;
    try {
      const headers = {
        REGION: "sg",
        BASE_HOSTNAME: "storage.bunnycdn.com",
        STORAGE_ZONE_NAME: ENV_KEYS.VITE_APP_STORAGE_ZONE,
        ACCESS_KEY: ENV_KEYS.VITE_APP_ACCESSKEY_BUNNY,
        PATH: pathBunny,
        FILENAME: newName,
        PATH_FOR_THUMBNAIL: user.newName + "-" + user._id,
      };

      const key = CryptoJS.enc.Utf8.parse(SECRET_KEY);
      const iv = CryptoJS.lib.WordArray.random(16);
      const encrypted = CryptoJS.AES.encrypt(JSON.stringify(headers), key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      });
      const cipherText = encrypted.ciphertext.toString(CryptoJS.enc.Base64);
      const ivText = iv.toString(CryptoJS.enc.Base64);
      const encryptedData = cipherText + ":" + ivText;

      const source = axios.CancelToken.source();
      const cancelToken = source.token;

      const blob = new Blob([file], {
        type: file.type,
      });
      const newFile = new File([blob], file.name, { type: file.type });

      const formData = new FormData();
      formData.append("file", newFile);

      await axios.post(LOAD_UPLOAD_URL, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          encryptedHeaders: encryptedData,
        },
        cancelToken,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdateUser = async () => {
    try {
      const profileName = Math.floor(1111111111 + Math.random() * 999999);
      let newFile;
      if (files) {
        const blob = new Blob([files], {
          type: files.type,
        });

        newFile = new File(
          [blob],
          profileName + `.${files?.name?.split(".")?.pop()}`,
          { type: files.type },
        );
      }

      const selectedFile =
        selectedSvgCode && selectedImageType === "avatar"
          ? saveSvgToFile(selectedSvgCode, profileName)
          : newFile && selectedImageType === "image"
          ? newFile
          : null;
      const selectedFileExtension = `.${selectedFile?.name?.split(".")?.pop()}`;

      //delete a file
      if (selectedFile instanceof File && userAccount?.profile) {
        const headers = {
          REGION: "sg",
          BASE_HOSTNAME: "storage.bunnycdn.com",
          STORAGE_ZONE_NAME: ENV_KEYS.VITE_APP_STORAGE_ZONE,
          ACCESS_KEY: ENV_KEYS.VITE_APP_ACCESSKEY_BUNNY,
          PATH: `${userAccount?.newName}-${userAccount?._id}/${ENV_KEYS.VITE_APP_ZONE_PROFILE}`,
          FILENAME: userAccount?.profile,
          PATH_FOR_THUMBNAIL: `${userAccount?.newName}-${userAccount?._id}`,
        };

        const key = CryptoJS.enc.Utf8.parse(SECRET_KEY);
        const iv = CryptoJS.lib.WordArray.random(16);
        const encrypted = CryptoJS.AES.encrypt(JSON.stringify(headers), key, {
          iv: iv,
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.Pkcs7,
        });
        const cipherText = encrypted.ciphertext.toString(CryptoJS.enc.Base64);
        const ivText = iv.toString(CryptoJS.enc.Base64);
        const encryptedData = cipherText + ":" + ivText;

        await axios.delete(LOAD_DELETE_URL, {
          headers: {
            "Content-Type": "multipart/form-data",
            encryptedHeaders: encryptedData,
          },
        });
      }

      const userData = await updateUser({
        variables: {
          id: user?._id,
          body: {
            firstName: userAccount?.firstName,
            lastName: userAccount?.lastName,
            gender: userAccount.gender,
            username: userAccount.username,
            phone: userAccount.phone,
            address: userAccount.address,
            state: userAccount.state,
            zipCode: userAccount.zipCode,
            profile:
              selectedFile instanceof File
                ? profileName + selectedFileExtension
                : userAccount?.profile,
            country: userAccount.country,
          },
        },
      });

      if (userData?.data.updateUser) {
        const description = [
          {
            update_profile: "Update profile information",
            status: "Success",
          },
        ];

        if (selectedFile instanceof File) {
          // upload profile to bunny
          const filesArray = Array.from([selectedFile]);
          if (filesArray.length > 0) {
            try {
              const uploadPromises = filesArray.map(async (file, index) => {
                await handleUploadToExternalServer(
                  index,
                  null,
                  file,
                  profileName + selectedFileExtension,
                  "user_profile",
                );
              });
              await Promise.all(uploadPromises);
            } catch (error) {
              console.error(error);
            }
          }
        }
        handleCreateLogs("Update profile", description, user?._id);
        successMessage("Update profile success", 2000);
        userRefetch();
        handleGetUser();
        eventUploadTrigger.trigger();
      }
    } catch (error: any) {
      console.error(error);
      const cutErr = error.message.replace(/(ApolloError: )?Error: /, "");
      const description = [
        {
          update_profile: "Update profile information",
          status: "Error",
        },
      ];
      handleCreateLogs("Update profile", description, user?._id);
      errorMessage(
        manageGraphqlError.handleErrorMessage(
          cutErr || "Something wrong please try again !",
        ) as string,
        2000,
      );
    }
  };

  // deactive user
  const handleDeactive = async () => {
    try {
      if (checked) {
        const userData = await updateUser({
          variables: {
            id: user?._id,
            body: {
              status: "deleted",
            },
          },
        });
        if (userData?.data?.updateUser) {
          successMessage("Your an account deactive", 3000);
          setMessage(
            "Your an account deactive please contact vshare.net support",
          );
          setTimeout(() => {
            signOut();
          }, 5000);
          const description = [
            {
              inactive_account: "Inactive Account",
              status: "Success",
            },
          ];
          handleCreateLogs("Update profile", description, user?._id);
        }
      } else {
        setMessage("Please confirm deactive an account");
        setTimeout(() => {
          setMessage(null);
        }, 3000);
      }
    } catch (error: any) {
      const cutErr = error.message.replace(/(ApolloError: )?Error: /, "");
      const description = [
        {
          inactive_account: "Inactive Account",
          status: "Failed",
        },
      ];
      errorMessage(
        manageGraphqlError.handleErrorMessage(cutErr) as string,
        3000,
      );
      handleCreateLogs("Update profile", description, user?._id);
    }
  };

  const handleReset = () => {
    setFiles(null);
    setPreview("");
  };

  return (
    <Fragment>
      {activeStatus && (
        <MUI.BoxAccountSetting maxWidth={isTablet && isMobile && "xl"}>
          <Breadcrumbs
            aria-label="breadcrumb"
            sx={{
              margin: "1.5rem 0",
              padding: isTablet ? "0 1.5rem" : isMobile ? "0 1rem" : "",
            }}
          >
            <Link
              underline="hover"
              color="inherit"
              onClick={() => window.history.back()}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#2F998B",
                fontWeight: "500",
                fontSize: "16px",
                cursor: "pointer",
              }}
            >
              Account Settings
            </Link>
            <Link
              underline="hover"
              color="inherit"
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#2F998B",
                fontWeight: "500",
                fontSize: "16px",
              }}
            >
              Account
            </Link>
          </Breadcrumbs>
          <MUI.BoxShowTabs>
            <MUI.ButtonTab
              startIcon={<PeopleAltOutlinedIcon />}
              onClick={() => setActiveStatus(1)}
              sx={{
                background: activeStatus == 1 ? "#17766B" : "",
                color: activeStatus == 1 ? "#ffffff" : "",
              }}
            >
              Account
            </MUI.ButtonTab>
            <MUI.ButtonTab
              startIcon={<VerifiedUserOutlinedIcon />}
              onClick={() => setActiveStatus(2)}
              sx={{
                background: activeStatus === 2 ? "#17766B" : "",
                color: activeStatus === 2 ? "#ffffff" : "",
              }}
            >
              Security
            </MUI.ButtonTab>
          </MUI.BoxShowTabs>
          <MUI.BoxShowTabDetail>
            {activeStatus == 1 && (
              <>
                <MUI.PaperGlobal elevation={6}>
                  <Typography
                    variant={isMobile ? "h6" : "h4"}
                    sx={{ color: "#5D596C" }}
                  >
                    Profile Details
                  </Typography>
                  <MUI.BoxShowAccountHeader>
                    {preview && selectedImageType === "image" ? (
                      <>
                        <img
                          src={preview}
                          alt="image"
                          style={{
                            objectFit: "fill",
                            borderRadius: "8px",
                            boxShadow: "rgba(0, 0, 0, 0.16) 0px 1px 4px",
                          }}
                        />
                      </>
                    ) : (
                      <>
                        {selectedSvgCode && selectedImageType === "avatar" ? (
                          <>
                            <img
                              src={`data:image/svg+xml;utf8,${encodeURIComponent(
                                selectedSvgCode,
                              )}`}
                              alt="user_avatar_image"
                              style={{
                                objectFit: "fill",
                                borderRadius: "8px",
                              }}
                            />
                          </>
                        ) : (
                          <>
                            {userAccount?.profile ? (
                              <>
                                <img
                                  src={
                                    isProfileImageFound
                                      ? ENV_KEYS.VITE_APP_BUNNY_PULL_ZONE +
                                        userAccount?.newName +
                                        "-" +
                                        userAccount?._id +
                                        "/" +
                                        ENV_KEYS.VITE_APP_THUMBNAIL_PATH +
                                        "/" +
                                        getFilenameWithoutExtension(
                                          userAccount?.profile,
                                        ) +
                                        `.${ENV_KEYS.VITE_APP_THUMBNAIL_EXTENSION}`
                                      : ENV_KEYS.VITE_APP_BUNNY_PULL_ZONE +
                                        userAccount?.newName +
                                        "-" +
                                        userAccount?._id +
                                        "/" +
                                        ENV_KEYS.VITE_APP_ZONE_PROFILE +
                                        "/" +
                                        userAccount?.profile
                                  }
                                  onError={() => setIsProfileImageFound(false)}
                                  alt="profile"
                                  style={{
                                    objectFit: "fill",
                                    borderRadius: "8px",
                                    boxShadow:
                                      "brgba(0, 0, 0, 0.16) 0px 3px 6px, rgba(0, 0, 0, 0.23) 0px 3px 6px",
                                  }}
                                />
                              </>
                            ) : (
                              <img
                                src={noProfile}
                                alt="user_no_image"
                                style={{
                                  objectFit: "fill",
                                  borderRadius: "8px",
                                  boxShadow:
                                    "brgba(0, 0, 0, 0.16) 0px 3px 6px, rgba(0, 0, 0, 0.23) 0px 3px 6px",
                                }}
                              />
                            )}
                          </>
                        )}
                      </>
                    )}
                    <MUI.BoxShowHeaderDetail>
                      <MUI.BoxShowButtons>
                        <MUI.ButtonUploadProfile
                          component="label"
                          variant="contained"
                          color="primaryTheme"
                          sx={{
                            mr: "16px",
                          }}
                          onClick={() => setIsDialogGenerateAvatarOpen(true)}
                        >
                          Generate avatar
                        </MUI.ButtonUploadProfile>
                        <MUI.ButtonUploadProfile
                          component="label"
                          variant="contained"
                          color="primaryTheme"
                        >
                          Upload new photo
                          <input
                            type="file"
                            name="image"
                            hidden
                            onChange={handleFile}
                          />
                        </MUI.ButtonUploadProfile>
                        <MUI.ButtonReset onClick={handleReset}>
                          Reset
                        </MUI.ButtonReset>
                      </MUI.BoxShowButtons>
                      <Typography variant="h6">
                        Allowed JPG, JPEG and PNG. Max size of 800 k
                      </Typography>
                    </MUI.BoxShowHeaderDetail>
                  </MUI.BoxShowAccountHeader>
                  <Divider sx={{ margin: isMobile ? "1rem 0" : "2rem 0" }} />
                  <MUI.BoxShowUserDetail>
                    <Grid
                      container
                      rowSpacing={1}
                      columnSpacing={{ xs: 1, sm: 2, md: 3 }}
                    >
                      <Grid item xs={6}>
                        <InputLabel
                          shrink
                          htmlFor="bootstrap-input"
                          sx={{
                            fontSize: "1.2rem",
                            fontWeight: "500",
                            color: "#5D596C",
                            marginTop: "0.8rem",
                          }}
                        >
                          First name
                        </InputLabel>
                        <FormControl fullWidth>
                          <OutlinedInput
                            placeholder="Please enter text"
                            size="small"
                            sx={{
                              fontSize: "0.8rem",
                              fontWeight: "500",
                              color: "#5D596C",
                              padding: isMobile ? "0" : "0.2rem 0",
                            }}
                            value={userAccount?.firstName || ""}
                            onChange={(e) =>
                              setUserAccount({
                                ...userAccount,
                                firstName: e.target.value,
                              })
                            }
                          />
                        </FormControl>
                      </Grid>
                      <Grid item xs={6}>
                        <InputLabel
                          shrink
                          htmlFor="bootstrap-input"
                          sx={{
                            fontSize: "1.2rem",
                            fontWeight: "500",
                            color: "#5D596C",
                            marginTop: "0.8rem",
                          }}
                        >
                          Last name
                        </InputLabel>
                        <FormControl fullWidth>
                          <OutlinedInput
                            placeholder="Please enter text"
                            size="small"
                            sx={{
                              fontSize: "0.8rem",
                              fontWeight: "500",
                              color: "#5D596C",
                              padding: isMobile ? "0" : "0.2rem 0",
                            }}
                            value={userAccount?.lastName || ""}
                            onChange={(e) =>
                              setUserAccount({
                                ...userAccount,
                                lastName: e.target.value,
                              })
                            }
                          />
                        </FormControl>
                      </Grid>
                      <Grid item xs={6}>
                        <InputLabel
                          shrink
                          htmlFor="bootstrap-input"
                          sx={{
                            fontSize: "1.2rem",
                            fontWeight: "500",
                            color: "#5D596C",
                            marginTop: "0.8rem",
                          }}
                        >
                          Email
                        </InputLabel>
                        <FormControl fullWidth>
                          <OutlinedInput
                            placeholder="Please enter text"
                            size="small"
                            sx={{
                              fontSize: "0.8rem",
                              fontWeight: "500",
                              color: "#5D596C",
                              padding: isMobile ? "0" : "0.2rem 0",
                            }}
                            disabled={true}
                            value={userAccount?.email || ""}
                            onChange={(e) =>
                              setUserAccount({
                                ...userAccount,
                                email: e.target.value,
                              })
                            }
                          />
                        </FormControl>
                      </Grid>
                      <Grid item xs={6}>
                        <InputLabel
                          shrink
                          htmlFor="bootstrap-input"
                          sx={{
                            fontSize: "1.2rem",
                            fontWeight: "500",
                            color: "#5D596C",
                            marginTop: "0.8rem",
                          }}
                        >
                          Username
                        </InputLabel>
                        <FormControl fullWidth>
                          <OutlinedInput
                            placeholder="Please enter text"
                            size="small"
                            sx={{
                              fontSize: "0.8rem",
                              fontWeight: "500",
                              color: "#5D596C",
                              padding: isMobile ? "0" : "0.2rem 0",
                            }}
                            value={userAccount?.username || ""}
                            onChange={(e) =>
                              setUserAccount({
                                ...userAccount,
                                username: e.target.value,
                              })
                            }
                          />
                        </FormControl>
                      </Grid>
                      <Grid item xs={6}>
                        <InputLabel
                          shrink
                          htmlFor="bootstrap-input"
                          sx={{
                            fontSize: "1.2rem",
                            fontWeight: "500",
                            color: "#5D596C",
                            marginTop: "0.8rem",
                          }}
                        >
                          Phone number
                        </InputLabel>
                        <FormControl fullWidth>
                          <OutlinedInput
                            placeholder="Please enter text"
                            size="small"
                            sx={{
                              fontSize: "0.8rem",
                              fontWeight: "500",
                              color: "#5D596C",
                              padding: isMobile ? "0" : "0.2rem 0",
                            }}
                            value={userAccount?.phone || ""}
                            onChange={(e) =>
                              setUserAccount({
                                ...userAccount,
                                phone: e.target.value,
                              })
                            }
                          />
                        </FormControl>
                      </Grid>
                      <Grid item xs={6}>
                        <InputLabel
                          shrink
                          htmlFor="bootstrap-input"
                          sx={{
                            fontSize: "1.2rem",
                            fontWeight: "500",
                            color: "#5D596C",
                            marginTop: "0.8rem",
                          }}
                        >
                          Address
                        </InputLabel>
                        <FormControl fullWidth>
                          <OutlinedInput
                            placeholder="Please enter text"
                            size="small"
                            sx={{
                              fontSize: "0.8rem",
                              fontWeight: "500",
                              color: "#5D596C",
                              padding: isMobile ? "0" : "0.2rem 0",
                            }}
                            value={userAccount?.address || ""}
                            onChange={(e) =>
                              setUserAccount({
                                ...userAccount,
                                address: e.target.value,
                              })
                            }
                          />
                        </FormControl>
                      </Grid>
                      <Grid item xs={6}>
                        <InputLabel
                          shrink
                          htmlFor="bootstrap-input"
                          sx={{
                            fontSize: "1.2rem",
                            fontWeight: "500",
                            color: "#5D596C",
                            marginTop: "0.8rem",
                          }}
                        >
                          State
                        </InputLabel>
                        <FormControl fullWidth>
                          <OutlinedInput
                            placeholder="Please enter text"
                            size="small"
                            sx={{
                              fontSize: "0.8rem",
                              fontWeight: "500",
                              color: "#5D596C",
                              padding: isMobile ? "0" : "0.2rem 0",
                            }}
                            value={userAccount?.state || ""}
                            onChange={(e) =>
                              setUserAccount({
                                ...userAccount,
                                state: e.target.value,
                              })
                            }
                          />
                        </FormControl>
                      </Grid>
                      <Grid item xs={6}>
                        <InputLabel
                          shrink
                          htmlFor="bootstrap-input"
                          sx={{
                            fontSize: "1.2rem",
                            fontWeight: "600",
                            color: "#5D596C",
                            marginTop: "0.8rem",
                          }}
                        >
                          Zip code
                        </InputLabel>
                        <FormControl fullWidth>
                          <OutlinedInput
                            placeholder="Please enter text"
                            size="small"
                            sx={{
                              fontSize: "0.8rem",
                              fontWeight: "500",
                              color: "#5D596C",
                              padding: isMobile ? "0" : "0.2rem 0",
                            }}
                            value={userAccount?.zipCode || ""}
                            onChange={(e) =>
                              setUserAccount({
                                ...userAccount,
                                zipCode: e.target.value,
                              })
                            }
                          />
                        </FormControl>
                      </Grid>
                      <Grid item xs={6}>
                        <InputLabel
                          shrink
                          htmlFor="bootstrap-input"
                          sx={{
                            fontSize: "1.2rem",
                            fontWeight: "500",
                            color: "#5D596C",
                            marginTop: "0.8rem",
                          }}
                        >
                          Country
                        </InputLabel>
                        <FormControl fullWidth>
                          <OutlinedInput
                            placeholder="Please enter text"
                            size="small"
                            sx={{
                              fontSize: "0.8rem",
                              fontWeight: "500",
                              color: "#5D596C",
                              padding: isMobile ? "0" : "0.2rem 0",
                            }}
                            value={userAccount?.country || ""}
                            onChange={(e) =>
                              setUserAccount({
                                ...userAccount,
                                country: e.target.value,
                              })
                            }
                          />
                        </FormControl>
                      </Grid>
                    </Grid>
                    <MUI.BoxShowActionButton>
                      <Button
                        color="primaryTheme"
                        variant="contained"
                        sx={{
                          padding: isMobile ? "0.3rem 0.5rem" : "0.5rem 2rem",
                          fontSize: isMobile ? "0.8rem" : "",
                        }}
                        fullWidth={isMobile ? true : false}
                        onClick={handleUpdateUser}
                      >
                        Save Change
                      </Button>
                      <Button
                        color="greyTheme"
                        variant="contained"
                        sx={{
                          marginLeft: "1.5rem",
                          padding: isMobile ? "0.3rem 0.5rem" : "0.5rem 4rem",
                          fontSize: isMobile ? "0.8rem" : "",
                        }}
                        fullWidth={isMobile ? true : false}
                        onClick={() => navigate("/dashboard")}
                      >
                        Cancel
                      </Button>
                    </MUI.BoxShowActionButton>
                  </MUI.BoxShowUserDetail>
                </MUI.PaperGlobal>

                {/* Delete account */}
                {showDeativeAccount && (
                  <MUI.PaperGlobal
                    elevation={6}
                    sx={{
                      marginTop: "2rem",
                    }}
                  >
                    <Typography
                      variant="h4"
                      sx={{
                        color: "#5D596C",
                        fontSize: isMobile ? "0.8rem" : "",
                      }}
                    >
                      Delete Account
                    </Typography>
                    <Alert
                      severity="warning"
                      sx={{
                        marginTop: "1rem",
                      }}
                    >
                      <AlertTitle
                        sx={{
                          fontSize: isMobile ? "0.8rem" : "1rem",
                          color: "#FF9F43",
                        }}
                      >
                        Are you sure you want to delete your account?
                      </AlertTitle>
                      <Typography
                        variant="h6"
                        sx={{
                          color: "#FF9F43",
                          fontSize: isMobile ? "0.8rem" : "1rem",
                        }}
                      >
                        Once you delete your account, there is no going back.
                        Please be certain.
                      </Typography>
                    </Alert>
                    <Box
                      sx={{
                        color: "#6F6B7D",
                        margin: "1rem 0",
                        fontSize: "0.8rem",
                      }}
                    >
                      <FormControlLabel
                        required
                        sx={{ color: "#6F6B7D" }}
                        control={
                          <Checkbox checked={checked} onChange={handleChange} />
                        }
                        label="I confirm my account deactivation"
                      />
                    </Box>
                    {message && (
                      <Typography
                        component="p"
                        sx={{ color: theme.palette.error.main }}
                      >
                        {message}
                      </Typography>
                    )}
                    <Box sx={{ margin: "1rem 0" }}>
                      <Button
                        color="error"
                        variant="contained"
                        sx={{
                          padding: isMobile ? "0.3rem 0.5rem" : "0.5rem 2rem",
                          fontSize: isMobile ? "0.8rem" : "",
                        }}
                        disabled={message ? true : false}
                        fullWidth={isMobile ? true : false}
                        onClick={handleDeactive}
                      >
                        Deactive Account
                      </Button>
                    </Box>
                  </MUI.PaperGlobal>
                )}
              </>
            )}
            {activeStatus == 2 && (
              <>
                <ChangeUserPasswordSection />
                {showTwoFactor && (
                  <TwoFactor data={userAccount} refetch={handleGetUser} />
                )}
                s
                <LoginDevice />
              </>
            )}
            {activeStatus == 3 && (
              <>
                <MUI.PaperGlobal elevation={5}>
                  <Typography
                    variant={isMobile ? "h6" : "h4"}
                    sx={{ color: "#5D596C" }}
                  >
                    Current Plan
                  </Typography>
                  <MUI.BoxShowPlanDetail>
                    <MUI.BoxLeftShowPlanDetail>
                      <Typography variant="h5">
                        Your Current Paln is Basic
                      </Typography>
                      <Typography variant="h6">
                        A simple start for everyone
                      </Typography>
                      <Typography variant="h5">
                        Active until Dec 09, 2021
                      </Typography>
                      <Typography variant="h6">
                        We will send you a notification upon Subscription
                        expiration
                      </Typography>
                      <Typography variant="h5">
                        $199 Per month &nbsp;{" "}
                        <Chip
                          label="Chip Filled"
                          sx={{
                            background: "#DAE9E7",
                            color: "#17766B",
                            fontWeight: "800",
                          }}
                        />
                      </Typography>
                      <Typography variant="h6">
                        Standard plan for small to medium businesses
                      </Typography>
                      <MUI.BoxShowActionsButton
                        sx={{
                          marginTop: "2rem",
                          width: "100%",
                        }}
                      >
                        <Button
                          sx={{
                            background: "#17766B",
                            color: "#ffffff",
                            padding: isMobile ? "0.3rem 0rem" : "0.5rem 2rem",
                            fontSize: isMobile ? "0.8rem" : "",
                            "&:hover": {
                              color: "#17766B",
                            },
                          }}
                          fullWidth={isMobile ? true : false}
                        >
                          Save
                        </Button>
                        <Button
                          sx={{
                            marginLeft: isMobile ? "0.5rem" : "1.5rem",
                            background: "#F1F1F2",
                            color: "#5D596C",
                            padding: isMobile ? "0.3rem 0.5rem" : "0.5rem 4rem",
                            fontSize: isMobile ? "0.8rem" : "",
                            "&:hover": {
                              color: "#17766B",
                            },
                          }}
                          fullWidth={isMobile ? true : false}
                        >
                          Cancel
                        </Button>
                      </MUI.BoxShowActionsButton>
                    </MUI.BoxLeftShowPlanDetail>
                    <MUI.BoxRightShowPlanDetail>
                      <Alert
                        severity="warning"
                        sx={{
                          marginTop: "1rem",
                          borderRadius: "10px",
                        }}
                      >
                        <AlertTitle
                          sx={{
                            fontSize: isMobile ? "0.8rem" : "1rem",
                            color: "#FF9F43",
                            fontWeight: "800",
                          }}
                        >
                          We need your attention!
                        </AlertTitle>
                        <Typography
                          variant="h6"
                          sx={{
                            color: "#FF9F43",
                            fontSize: isMobile ? "0.8rem" : "1rem",
                          }}
                        >
                          Your plan requires update
                        </Typography>
                      </Alert>
                      <MUI.BoxShowRemainDay>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            margin: "0.5rem 0",
                          }}
                        >
                          <Typography variant="h5">Days</Typography>
                          <Typography variant="h5">24 of 30 days</Typography>
                        </Box>
                        <BorderLinearProgress
                          variant="determinate"
                          value={50}
                        />
                        <Typography variant="h6">
                          6 days remaining until your plan requires update
                        </Typography>
                      </MUI.BoxShowRemainDay>
                    </MUI.BoxRightShowPlanDetail>
                  </MUI.BoxShowPlanDetail>
                </MUI.PaperGlobal>
                <MUI.PaperGlobal sx={{ marginTop: "2rem" }}>
                  <Typography variant="h5">Payment History</Typography>
                  <MUI.BoxShowPaymentHistoryHeader>
                    <MUI.BoxShowLeftPaymentHistory>
                      <FormControl sx={{ width: "50%" }} size="small">
                        <InputLabel id="demo-simple-select-label">
                          10
                        </InputLabel>
                        <Select
                          labelId="demo-simple-select-label"
                          id="demo-simple-select"
                          label="10"
                        >
                          <MenuItem value={10}>10</MenuItem>
                          <MenuItem value={20}>20</MenuItem>
                          <MenuItem value={30}>30</MenuItem>
                          <MenuItem value={30}>50</MenuItem>
                        </Select>
                      </FormControl>
                      <Button
                        startIcon={<AddIcon />}
                        sx={{
                          background: "#17766B",
                          color: "#ffffff",
                          fontSize: isMobile ? "0.8rem" : "",
                          "&:hover": {
                            color: "#17766B",
                          },
                          padding: isTablet
                            ? "0.4rem 0.2rem"
                            : isMobile
                            ? "0.4rem 0.6rem"
                            : "0.4rem 2rem",
                          width: isMobile ? "45%" : "auto",
                        }}
                        size="small"
                      >
                        Create Invoice
                      </Button>
                    </MUI.BoxShowLeftPaymentHistory>
                    <MUI.BoxShowRightPaymentHistory>
                      <FormControl sx={{ width: "50%" }}>
                        <OutlinedInput
                          placeholder="Search Invoice"
                          size="small"
                          sx={{
                            fontSize: "0.8rem",
                            fontWeight: "500",
                            color: "#5D596C",
                          }}
                          type="text"
                        />
                      </FormControl>
                      <FormControl
                        sx={{
                          width: isMobile ? "45%" : "50%",
                          marginLeft: isTablet
                            ? "0.5rem"
                            : isMobile
                            ? "0"
                            : "2rem",
                        }}
                        size="small"
                      >
                        <InputLabel id="demo-simple-select-label">
                          Select Status
                        </InputLabel>
                        <Select
                          labelId="demo-simple-select-label"
                          id="demo-simple-select"
                          label="10"
                        >
                          <MenuItem value={10}>paid</MenuItem>
                          <MenuItem value={20}>cancel</MenuItem>
                          <MenuItem value={30}>pending</MenuItem>
                        </Select>
                      </FormControl>
                    </MUI.BoxShowRightPaymentHistory>
                  </MUI.BoxShowPaymentHistoryHeader>
                  <Box sx={{ marginTop: isMobile ? "1rem" : "2rem" }}>
                    <DataGrid
                      autoHeight
                      rows={rows}
                      columns={columns}
                      hideFooterPagination
                      rowHeight={60}
                    />
                  </Box>
                </MUI.PaperGlobal>
              </>
            )}
            {activeStatus == 4 && (
              <MUI.PaperGlobal elevation={5} sx={{ padding: "1.5rem" }}>
                <Typography
                  variant="h6"
                  sx={{ color: "#5D596C", fontWeight: "600" }}
                >
                  Recent Devices
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    fontSize: "0.8rem",
                    color: "#5D596C",
                    margin: "0.5rem 0",
                  }}
                >
                  We need permission from your browser to show notification.{" "}
                  <strong>Request Permission</strong>
                </Typography>
                <TableContainer component={Paper} sx={{ marginTop: "2rem" }}>
                  <Table
                    sx={{ minWidth: 650, border: "1px solid #DBDADE" }}
                    aria-label="caption table"
                  >
                    <TableHead>
                      <MUI.RowTableRow>
                        <MUI.CellTableCell>TYPE</MUI.CellTableCell>
                        <MUI.CellTableCell>EMAIL</MUI.CellTableCell>
                        <MUI.CellTableCell>BROWSER</MUI.CellTableCell>
                        <MUI.CellTableCell>APP</MUI.CellTableCell>
                      </MUI.RowTableRow>
                    </TableHead>
                    <TableBody>
                      <MUI.RowTableRow>
                        <MUI.CellTableCell component="th">
                          New for you
                        </MUI.CellTableCell>
                        <MUI.CellTableCell>
                          <FormControlLabel
                            label=""
                            control={<Checkbox defaultChecked />}
                          />
                        </MUI.CellTableCell>
                        <MUI.CellTableCell>
                          <FormControlLabel
                            label=""
                            control={<Checkbox defaultChecked />}
                          />
                        </MUI.CellTableCell>
                        <MUI.CellTableCell>
                          <FormControlLabel
                            label=""
                            control={<Checkbox defaultChecked />}
                          />
                        </MUI.CellTableCell>
                      </MUI.RowTableRow>
                      <MUI.RowTableRow>
                        <MUI.CellTableCell component="th">
                          Account activity
                        </MUI.CellTableCell>
                        <MUI.CellTableCell>
                          <FormControlLabel
                            label=""
                            control={<Checkbox defaultChecked />}
                          />
                        </MUI.CellTableCell>
                        <MUI.CellTableCell>
                          <FormControlLabel
                            label=""
                            control={<Checkbox defaultChecked />}
                          />
                        </MUI.CellTableCell>
                        <MUI.CellTableCell>
                          <FormControlLabel
                            label=""
                            control={<Checkbox defaultChecked />}
                          />
                        </MUI.CellTableCell>
                      </MUI.RowTableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </MUI.PaperGlobal>
            )}
            {activeStatus == 5 && (
              <>
                <MUI.PaperGlobal elevation={5} sx={{ padding: "1.5rem" }}>
                  <Typography
                    variant="h6"
                    sx={{ color: "#5D596C", fontWeight: "600" }}
                  >
                    Create an API key
                  </Typography>
                  <Grid
                    container
                    rowSpacing={1}
                    columnSpacing={{ xs: 1, sm: 2, md: 3 }}
                    mt={4}
                  >
                    <Grid item xs={12} md={6} lg={6}>
                      <InputLabel
                        shrink
                        htmlFor="bootstrap-input"
                        sx={{
                          fontSize: "1.2rem",
                          fontWeight: "500",
                          color: "#5D596C",
                          marginTop: "0.8rem",
                        }}
                      >
                        Choose the api key type you want to create
                      </InputLabel>
                      <FormControl size="small" fullWidth>
                        <InputLabel id="demo-simple-select-label">
                          10
                        </InputLabel>
                        <Select
                          labelId="demo-simple-select-label"
                          id="demo-simple-select"
                          label="10"
                          sx={{ padding: isMobile ? "0" : "0.2rem 0" }}
                        >
                          <MenuItem value={10}>10</MenuItem>
                          <MenuItem value={20}>20</MenuItem>
                          <MenuItem value={30}>30</MenuItem>
                          <MenuItem value={30}>50</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <InputLabel
                        shrink
                        htmlFor="bootstrap-input"
                        sx={{
                          fontSize: "1.2rem",
                          fontWeight: "500",
                          color: "#5D596C",
                          marginTop: "0.8rem",
                        }}
                      >
                        Name the API key
                      </InputLabel>
                      <FormControl fullWidth>
                        <OutlinedInput
                          placeholder="Server key 1"
                          size="small"
                          sx={{
                            fontSize: "0.8rem",
                            fontWeight: "500",
                            color: "#5D596C",
                            padding: isMobile ? "0" : "0.2rem 0",
                          }}
                        />
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} mt={4}>
                      <Button
                        sx={{
                          background: "#17766B",
                          color: "#ffffff",
                          padding: isMobile ? "0.3rem 0.5rem" : "0.5rem 2rem",
                          fontSize: isMobile ? "0.8rem" : "",
                        }}
                        fullWidth
                      >
                        Save Change
                      </Button>
                    </Grid>
                  </Grid>
                </MUI.PaperGlobal>
                <MUI.PaperGlobal sx={{ marginTop: "2rem" }}>
                  <Typography
                    variant="h6"
                    sx={{ color: "#5D596C", fontWeight: "600" }}
                  >
                    API Key List & Access
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{
                      fontSize: "0.9rem",
                      color: "#5D596C",
                      margin: "0.5rem 0",
                    }}
                  >
                    An API key is a simple encrypted string that identifies an
                    application without any principal. They are useful for
                    accessing public data anonymously, and are used to associate
                    API requests with your project for quota and billing.
                  </Typography>
                  <MUI.BoxShowServerDetail>
                    <MUI.BoxShowServerHeader>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "start",
                        }}
                      >
                        <Typography variant="h4">Server Key 1</Typography>
                        <Chip
                          label="Full Access"
                          sx={{
                            background: "#DAE9E7",
                            color: "#17766B",
                            fontWeight: "800",
                            marginLeft: "1rem",
                          }}
                        />
                      </Box>
                      <IconButton>
                        <MoreVertIcon />
                      </IconButton>
                    </MUI.BoxShowServerHeader>
                    <MUI.BoxShowCopyKey>
                      <input
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        style={{
                          border: "none",
                          outline: "none",
                          backgroundColor: "#F8F8F8",
                          width: "40ch",
                          fontSize: "0.9rem",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          color: "#5D596C",
                        }}
                      />
                      <CopyToClipboard text={value} onCopy={handleCopy}>
                        <ContentCopyIcon />
                      </CopyToClipboard>
                    </MUI.BoxShowCopyKey>
                    <Typography
                      variant="h6"
                      sx={{
                        fontSize: "0.9rem",
                        color: "#5D596C",
                        margin: "0.5rem 0",
                      }}
                    >
                      Created on 12 Feb 2021, 10:30 GTM+2G30
                    </Typography>
                  </MUI.BoxShowServerDetail>
                  <MUI.BoxShowServerDetail>
                    <MUI.BoxShowServerHeader>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "start",
                        }}
                      >
                        <Typography variant="h4">Server Key 1</Typography>
                        <Chip
                          label="Full Access"
                          sx={{
                            background: "#DAE9E7",
                            color: "#17766B",
                            fontWeight: "800",
                            marginLeft: "1rem",
                          }}
                        />
                      </Box>
                      <IconButton>
                        <MoreVertIcon />
                      </IconButton>
                    </MUI.BoxShowServerHeader>
                    <MUI.BoxShowCopyKey>
                      <input
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        style={{
                          border: "none",
                          outline: "none",
                          backgroundColor: "#F8F8F8",
                          width: "40ch",
                          fontSize: "0.9rem",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          color: "#5D596C",
                        }}
                      />
                      <CopyToClipboard text={value} onCopy={handleCopy}>
                        <ContentCopyIcon />
                      </CopyToClipboard>
                    </MUI.BoxShowCopyKey>
                    <Typography
                      variant="h6"
                      sx={{
                        fontSize: "0.9rem",
                        color: "#5D596C",
                        margin: "0.5rem 0",
                      }}
                    >
                      Created on 12 Feb 2021, 10:30 GTM+2G30
                    </Typography>
                  </MUI.BoxShowServerDetail>
                  <MUI.BoxShowServerDetail>
                    <MUI.BoxShowServerHeader>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "start",
                        }}
                      >
                        <Typography variant="h4">Server Key 1</Typography>
                        <Chip
                          label="Full Access"
                          sx={{
                            background: "#DAE9E7",
                            color: "#17766B",
                            fontWeight: "800",
                            marginLeft: "1rem",
                          }}
                        />
                      </Box>
                      <IconButton>
                        <MoreVertIcon />
                      </IconButton>
                    </MUI.BoxShowServerHeader>
                    <MUI.BoxShowCopyKey>
                      <input
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        style={{
                          border: "none",
                          outline: "none",
                          backgroundColor: "#F8F8F8",
                          width: "40ch",
                          fontSize: "0.9rem",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          color: "#5D596C",
                        }}
                      />
                      <CopyToClipboard text={value} onCopy={handleCopy}>
                        <ContentCopyIcon />
                      </CopyToClipboard>
                    </MUI.BoxShowCopyKey>
                    <Typography
                      variant="h6"
                      sx={{
                        fontSize: "0.9rem",
                        color: "#5D596C",
                        margin: "0.5rem 0",
                      }}
                    >
                      Created on 12 Feb 2021, 10:30 GTM+2G30
                    </Typography>
                  </MUI.BoxShowServerDetail>
                </MUI.PaperGlobal>
              </>
            )}
          </MUI.BoxShowTabDetail>
        </MUI.BoxAccountSetting>
      )}
      <DialogGenerateAvatar
        isOpen={isDialogGenerateAvatarOpen}
        onClose={() => setIsDialogGenerateAvatarOpen(false)}
        onConfirm={(svgCode) => {
          setSelectedSvgCode(svgCode);
          setIsDialogGenerateAvatarOpen(false);
          setSelectedImageType("avatar");
        }}
      />
    </Fragment>
  );
}

export default AccountInfo;
