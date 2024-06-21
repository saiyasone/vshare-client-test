import { useMutation } from "@apollo/client";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import { LoadingButton } from "@mui/lab";
import {
  Box,
  Button,
  InputAdornment,
  OutlinedInput,
  Typography,
  createTheme,
  styled,
  useMediaQuery,
} from "@mui/material";
import { MUTATION_UPDATE_FILE } from "api/graphql/file.graphql";
import { MUTATION_UPDATE_FOLDER } from "api/graphql/folder.graphql";
import {
  MUTATION_FORGET_FILE_PASSWORD,
  MUTATION_REMOVE_FILE_PASSWORD,
} from "api/graphql/other.graphql";
import vshareIcon from "assets/images/file-password-icon.png";
import BaseDialogV1 from "components/BaseDialogV1";
import CryptoJS from "crypto-js";
import useManageGraphqlError from "hooks/useManageGraphqlError";
import { Fragment, useState } from "react";
import { FileIcon, defaultStyles } from "react-file-icon";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { FaTrash } from "react-icons/fa";
import { errorMessage, successMessage } from "utils/alert.util";
import { getFileType } from "utils/file.util";

const theme = createTheme();

const HeaderPasswordContainer = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: "1rem",
  marginBottom: "0.5rem",
});

const HeaderTitle = styled("div")({
  display: "flex",
  alignItems: "center",
  maxWidth: "100%",
  h2: {
    fontSize: "1.1rem",
    fontWeight: "bold",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",

    [theme.breakpoints.down("sm")]: {
      fontSize: "0.8rem",
    },
  },
});

const HeaderForm = styled(Box)({
  margin: "0.5rem 0",
});

const HeaderForgetPassword = styled("div")({
  textAlign: "center",

  img: {
    height: "50px",
    objectFit: "cover",
  },
});

const ForgetPasswordContainer = styled("div")({
  marginTop: "1.5rem",
  textAlign: "center",

  h2: {
    fontWeight: "bold",
    fontSize: "1rem",
    marginBottom: "0.5rem",
  },

  h4: {
    fontSize: "0.9rem",
    lineHeight: "1.2rem",
  },
});

const FormInput = styled("div")({
  display: "flex",
  alignItems: "center",
  gap: "1rem",
  [theme.breakpoints.down("sm")]: {
    gap: "0.6rem",
  },
});

const FormLabel = styled("label")({
  display: "block",
  marginBottom: 2,
  fontSize: "0.85rem",
});

const FormAction = styled("div")({
  paddingTop: 10,
  marginTop: "1rem",
  display: "flex",
  alignItems: "center",
  gap: "1rem",
  justifyContent: "center",

  [theme.breakpoints.down("sm")]: {
    marginTop: "0.5rem",
  },
});

const ForgetLinkContainer = styled("div")({
  textAlign: "center",
  marginTop: "0.8rem",
});
const ForgetLinkAction = styled("button")({
  color: "#17766B",
  fontSize: "0.8rem",
  cursor: "pointer",
  border: 0,
  outline: "none",
  backgroundColor: "transparent",
  textDecoration: "underline",
});

function DialogCreateFilePassword(props) {
  const manageGraphqlError = useManageGraphqlError();
  const { dataValue, onClose, onConfirm, filename, checkType, isUpdate } =
    props;

  const [isLoading, setIsLoading] = useState(false);
  const [isForget, setIsForget] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [lockPassword, setLockPassword] = useState("");
  const [textPassword, setTextPassword] = useState("");

  // graphql
  const [forgetPasswordAction] = useMutation(MUTATION_FORGET_FILE_PASSWORD);
  const [updateFile] = useMutation(MUTATION_UPDATE_FILE);
  const [updateFolder] = useMutation(MUTATION_UPDATE_FOLDER);
  const [removePasswordAction] = useMutation(MUTATION_REMOVE_FILE_PASSWORD);

  const isMobile = useMediaQuery("(max-width:500px)");

  async function handleUpdateFile() {
    if (!lockPassword) {
      return;
    }

    const genCodePassword = CryptoJS.MD5(lockPassword).toString();

    if (checkType === "folder") {
      try {
        const result = await updateFolder({
          variables: {
            data: {
              access_password: lockPassword,
            },

            where: {
              _id: dataValue?._id,
            },
          },
        });

        if (result.data?.updateFolders?._id) {
          successMessage("Lock folder successful!", 2000);
          onConfirm();
          handleCloseForm();
        }
      } catch (error: any) {
        const cutErr = error.message.replace(/(ApolloError: )?Error: /, "");
        errorMessage(
          manageGraphqlError.handleErrorMessage(cutErr) as string,
          3000,
        );
      }
    } else {
      try {
        const result = await updateFile({
          variables: {
            data: {
              filePassword: genCodePassword,
            },

            where: {
              _id: dataValue?._id,
            },
          },
        });

        if (result.data?.updateFiles?._id) {
          successMessage("Lock file successful!", 2000);
          handleCloseForm();
          onConfirm();
        }
      } catch (error: any) {
        const cutErr = error.message.replace(/(ApolloError: )?Error: /, "");
        errorMessage(
          manageGraphqlError.handleErrorMessage(
            cutErr || "Something went wrong, Please try again",
          ) as string,
          3000,
        );
      }
    }
  }

  async function forgetFilePassword() {
    setIsLoading(true);
    try {
      const result = await forgetPasswordAction({
        variables: {
          data: { _id: dataValue?._id, type: checkType },
        },
      });

      if (result.data?.forgotPasswordFolderAndFile?.status === 200) {
        successMessage(
          "Check your account for the link to reset your password.",
          3000,
        );

        setIsLoading(false);
        handleCloseForm();
      }
    } catch (error: any) {
      setIsLoading(false);
      const cutErr = error.message.replace(/(ApolloError: )?Error: /, "");
      errorMessage(
        manageGraphqlError.handleErrorMessage(cutErr) as string,
        3000,
      );
    }
  }

  const generateMainPassword = () => {
    const length = 8;
    const charset =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
    let password = "";
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }

    setLockPassword(password);
  };

  async function handleRemovePassword() {
    try {
      const result = await removePasswordAction({
        variables: {
          data: {
            password: textPassword,
          },
          where: {
            _id: dataValue?._id,
            type: checkType,
          },
        },
      });

      if (result.data?.removePasswordFolderAndFile?.status) {
        successMessage("Removed password successfully", 3000);
        onConfirm();
        handleCloseForm();
      }
    } catch (error: any) {
      const cutErr = error.message.replace(/(ApolloError: )?Error: /, "");
      errorMessage(manageGraphqlError.handleErrorMessage(cutErr) as any, 3000);
    }
  }

  function clearGenerate() {
    setLockPassword("");
  }

  function handleCloseForm() {
    clearGenerate();
    setIsForget(false);
    setTextPassword("");
    setShowPassword(false);
    onClose();
  }

  function handleShowPassword() {
    setShowPassword(!showPassword);
  }

  return (
    <Fragment>
      <BaseDialogV1
        {...props}
        dialogProps={{
          PaperProps: {
            sx: {
              overflowY: "initial",
              maxWidth: isUpdate ? "450px" : "500px",
            },
          },
        }}
        dialogContentProps={{
          padding: "20px",
          sx: {
            backgroundColor: "white !important",
            borderRadius: "6px",
            padding: 0,
          },
        }}
        onClose={handleCloseForm}
      >
        <Box sx={{ padding: 10 }}>
          {!isUpdate && (
            <Fragment>
              <HeaderPasswordContainer>
                {/* <FiLock /> */}
                <HeaderTitle>
                  {checkType === "file" && (
                    <Box sx={{ width: "30px", mr: 3 }}>
                      <FileIcon
                        extension={getFileType(dataValue?.newFilename)}
                        {...defaultStyles[
                          getFileType(dataValue?.newFilename) as string
                        ]}
                      />
                    </Box>
                  )}
                  <Typography variant="h2">{filename}</Typography>
                </HeaderTitle>
              </HeaderPasswordContainer>

              <HeaderForm>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleUpdateFile();
                  }}
                >
                  <FormLabel htmlFor="passwordLink">Enter password</FormLabel>
                  <FormInput>
                    <OutlinedInput
                      id="passwordLink"
                      type={showPassword ? "text" : "password"}
                      placeholder="........"
                      fullWidth={true}
                      size="small"
                      onChange={(e) => setLockPassword(e.target.value)}
                      value={lockPassword}
                      endAdornment={
                        <InputAdornment position="end" sx={{ mr: 1 }}>
                          <Box
                            sx={{
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            {showPassword ? (
                              <AiOutlineEye
                                size="18"
                                onClick={handleShowPassword}
                              />
                            ) : (
                              <AiOutlineEyeInvisible
                                size="18"
                                onClick={handleShowPassword}
                              />
                            )}
                          </Box>
                        </InputAdornment>
                      }
                    />

                    <Button variant="contained" onClick={generateMainPassword}>
                      <LockOpenIcon
                        sx={{
                          fontSize: "18px",
                          cursor: "pointer",
                          mr: 1,
                          color: "#fff",
                        }}
                      />
                      {!isMobile && "Random"}
                    </Button>
                  </FormInput>

                  <FormAction>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={lockPassword ? false : true}
                      fullWidth={isMobile ? true : false}
                    >
                      Create password
                    </Button>
                  </FormAction>
                </form>
              </HeaderForm>
            </Fragment>
          )}

          {isUpdate && (
            <Fragment>
              <HeaderForgetPassword>
                <img src={vshareIcon} alt="vshare logo" />
              </HeaderForgetPassword>

              {isForget ? (
                <ForgetPasswordContainer>
                  <Typography variant="h2">Forget password ?</Typography>
                  <Typography variant="h4">
                    To update your file password, simply click the button below
                    and follow the instructions
                  </Typography>

                  <LoadingButton
                    onClick={forgetFilePassword}
                    type="button"
                    variant="contained"
                    fullWidth={true}
                    loading={isLoading}
                    sx={{ marginTop: 5 }}
                  >
                    Forget password
                  </LoadingButton>
                </ForgetPasswordContainer>
              ) : (
                <ForgetPasswordContainer sx={{ textAlign: "left" }}>
                  <Typography variant="h2" textAlign="center">
                    Remove password
                  </Typography>
                  <HeaderForm sx={{ mt: 3 }}>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleRemovePassword();
                      }}
                    >
                      <FormLabel>Enter your current password</FormLabel>
                      <FormInput>
                        <OutlinedInput
                          type={showPassword ? "text" : "password"}
                          placeholder="Password"
                          fullWidth={true}
                          size="small"
                          onChange={(e) => setTextPassword(e.target.value)}
                          value={textPassword}
                          endAdornment={
                            <InputAdornment position="end" sx={{ mr: 1 }}>
                              <Box
                                sx={{
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
                                {showPassword ? (
                                  <AiOutlineEye
                                    size="18"
                                    onClick={handleShowPassword}
                                  />
                                ) : (
                                  <AiOutlineEyeInvisible
                                    size="18"
                                    onClick={handleShowPassword}
                                  />
                                )}
                              </Box>
                            </InputAdornment>
                          }
                        />
                      </FormInput>

                      <FormAction sx={{ marginTop: "0.6rem" }}>
                        <Button
                          type="submit"
                          variant="contained"
                          color="error"
                          disabled={textPassword ? false : true}
                        >
                          <FaTrash style={{ marginRight: 10 }} />
                          Remove password
                        </Button>
                      </FormAction>
                    </form>
                  </HeaderForm>

                  <ForgetLinkContainer>
                    <ForgetLinkAction
                      onClick={() => {
                        setIsForget(true);
                      }}
                    >
                      Forget password ?
                    </ForgetLinkAction>
                  </ForgetLinkContainer>
                </ForgetPasswordContainer>
              )}
            </Fragment>
          )}
        </Box>
      </BaseDialogV1>
    </Fragment>
  );
}

export default DialogCreateFilePassword;
