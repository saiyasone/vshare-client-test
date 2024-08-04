import { IconButton, Link, Typography } from "@mui/material";
import React, {
  Fragment,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import "react-multi-carousel/lib/styles.css";

// components
import {
  // useMutation,
  useSubscription,
} from "@apollo/client";
import {
  Facebook as FacebookIcon,
  GitHub as GitHubIcon,
  Google as GoogleIcon,
} from "@mui/icons-material";
import vShareLogo from "assets/images/vshare-black-logo.png";
import { NavLink } from "react-router-dom";
import * as MUI from "./style";
import "./style.css";

import { useTheme } from "@emotion/react";
import useMediaQuery from "@mui/material/useMediaQuery";
import {
  // MUTATION_FACEBOOK_OAUTH,
  // MUTATION_GOOGLE_AUTH,
  // MUTATION_SOCIAL_AUTH,
  USER_SIGNUP_SUBSCRIPTION,
} from "api/graphql/social.graphql";
import BaseSignin from "components/BaseSignin";
import { ENV_KEYS } from "constants/env.constant";
import { SETTING_KEYS } from "constants/setting.constant";
import useAuth from "hooks/useAuth";
// import useFacebookOauth from "hooks/useFacebookOauth";
// import useGithubOauth from "hooks/useGithubOauth";
// import useGoogleOauth from "hooks/useGoogleOauth";
// import useManageGraphqlError from "hooks/useManageGraphqlError";
import useManageSetting from "hooks/useManageSetting";
import moment from "moment";
import { errorMessage, warningMessage } from "utils/alert.util";
import { v4 as uuidv4 } from "uuid";

function SignIn() {
  const theme: any = useTheme();
  const clientIdRef = useRef<string>(uuidv4());
  const authWindowRef = useRef<Window | null>(null);
  const { oauthLogin }: any = useAuth();
  const [signInCaptcha, setSignInCaptcha] = useState(null);
  const [signInLimit, setSignInLimit] = useState(null);
  const [showGithub, setShowGithub] = useState(false);
  const [showGoogle, setShowGoogle] = useState(false);
  const [showFacebook, setShowFacebook] = useState(false);
  const [hideLogin, setHideLogin] = useState(false);
  const [initialTime, setInitialTime] = useState(0);
  const [initialTimeMessage, setInitialTimeMessage] = useState("");
  const mobileScreen = useMediaQuery(theme.breakpoints.down("sm"));
  // const manageGraphqlError = useManageGraphqlError();

  // const [loginWithGoogle] = useMutation(MUTATION_GOOGLE_AUTH);
  // const [loginWithFacebook] = useMutation(MUTATION_FACEBOOK_OAUTH);
  // const [loginWithGithub] = useMutation(MUTATION_SOCIAL_AUTH);
  const useDataSetting = useManageSetting();

  // const googleOauth = useGoogleOauth(ENV_KEYS.VITE_APP_GOOGLE_CLIENT_ID,{
  //   onSuccess: async (googleDetails) => {
  //     console.log({googleDetails});
  //     try {
  //       await loginWithGoogle({
  //         variables: {
  //           dataInput: {
  //             ip: "103.43.77.35",
  //             sendToken: googleDetails.credential,
  //           },
  //         },

  //         onCompleted: async (res) => {
  //           const [data] = res.loginWithGoogle.data;
  //           const token = res.loginWithGoogle.token;
  //           oauthLogin(data, token);
  //         },
  //       });
  //     } catch (error: any) {
  //       console.log('gooogle login : ', error);
  //       const message = manageGraphqlError.handleErrorMessage(error.message);
  //       if (message) {
  //         errorMessage(message, 3000);
  //       }
  //     }
  //   },
  // });

  // const facebookOauth = useFacebookOauth(ENV_KEYS.VITE_APP_FACEBOOk_APP_ID, {
  //   onSuccess: async (facebookUser) => {
  //     try {
  //       const { first_name, last_name, picture } = facebookUser;
  //       await loginWithFacebook({
  //         variables: {
  //           dataInput: {
  //             ip: "103.43.77.35",
  //             accountId: facebookUser.id,
  //             firstName: first_name,
  //             lastName: last_name,
  //             email: facebookUser.email,
  //             provider: "facebook",
  //             username: `${first_name} ${last_name}`,
  //             profile: picture.data.url,
  //           },
  //         },
  //         onCompleted: async (res) => {
  //           const [data] = res.loginWithFacebook.data;
  //           const token = res.loginWithFacebook.token;
  //           oauthLogin(data, token);
  //         },
  //       });
  //     } catch (error: any) {
  //       const message = manageGraphqlError.handleErrorMessage(error.message);
  //       if (message) {
  //         errorMessage(message, 3000);
  //       }
  //     }
  //   },
  // });

  // const githubOauth = useGithubOauth(ENV_KEYS.VITE_APP_GITHUB_CLIENT_ID, {
  //   onSuccess: async (githubUser) => {
  //     await loginWithGithub({
  //       variables: {
  //         input: {
  //           provider: "github",
  //           accountId: githubUser.data.accountId,
  //           username: githubUser.data.username,
  //         },
  //       },
  //       onCompleted: async (res) => {
  //         const [data] = res.socialAuth.data;
  //         const token = res.socialAuth.token;
  //         oauthLogin(data, token);
  //       },
  //     });
  //   },
  // });

  //Social media auth new 20240730 ---> Phonesai
  const SocialMediaAuths = async (str_path: string) => {
    const width = 500;
    const height = 600;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    const url = `${ENV_KEYS.VITE_APP_API_URL}/auth/${str_path}?clientId=${clientIdRef.current}`;

    authWindowRef.current = window.open(
      url,
      "_blank",
      `width=${width},height=${height},left=${left},top=${top} rel='noopener noreferrer'`,
    );
  };

  const loginLimitFailure = useCallback(
    (error: any) => {
      const cutErr = error.message?.replace(/(ApolloError: )?Error: /, "");
      const isLock = cutErr?.includes("ACCOUNT_LOCKED_UNTIL");
      if (isLock) {
        const pattern = /\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/;
        const match = cutErr.match(pattern);
        const lockDate = moment(new Date(match)).format("HH:mm");
        if (match) {
          setInitialTimeMessage(lockDate);
          setHideLogin(true);
        }
        errorMessage(`Please login again on ${lockDate} minutes`, 3000);
      }
    },
    [initialTime],
  );

  function findDataSetting(productKey) {
    const res = useDataSetting.data?.find(
      (data) => data?.productKey === productKey,
    );

    return res;
  }

  useEffect(() => {
    setInitialTime(300);
  }, [initialTime]);

  useEffect(() => {
    const getDataSetting = () => {
      // SignIn Captcha
      const signInCaptchaData = findDataSetting(SETTING_KEYS.CAPCHA_GOOGLE);
      if (signInCaptchaData) setSignInCaptcha(signInCaptchaData);

      // Github
      const githubData = findDataSetting(SETTING_KEYS.OAUTH_GITHUB);
      if (githubData) {
        const data = githubData?.status;
        if (data === "on") setShowGithub(true);
      }

      // Facebook
      const facebookData = findDataSetting(SETTING_KEYS.OAUTH_FACEBOOK);
      if (facebookData) {
        const data = facebookData?.status;
        if (data === "on") setShowFacebook(true);
      }

      // Google
      const googleData = findDataSetting(SETTING_KEYS.OAUTH_GOOGLE);
      if (googleData) {
        const data = googleData?.status;
        if (data === "on") setShowGoogle(true);
      }
    };

    getDataSetting();
  }, [useDataSetting.data]);

  useEffect(() => {
    // Login Limit
    const handleLoginLimit = () => {
      const signInLimitData = findDataSetting(SETTING_KEYS.SIGN_IN_LIMIT);
      if (signInLimitData) {
        setSignInLimit(signInLimitData);
      }
    };

    handleLoginLimit();
  }, [useDataSetting.data]);

  ///wss for social auth 20240730 ---> Phonesai
  const { data, error } = useSubscription(USER_SIGNUP_SUBSCRIPTION, {
    variables: {
      signupId: clientIdRef.current,
    },
  });

  useEffect(() => {
    if (data) {
      if (!data || data?.subscribeSignupWithSocial?.message !== "SUCCESS") {
        return;
      }

      if (authWindowRef.current) {
        authWindowRef.current.close();
      }

      if (data && data.subscribeSignupWithSocial) {
        const token = data?.subscribeSignupWithSocial?.token;
        const obj = data?.subscribeSignupWithSocial?.data;

        if (token && obj) {
          oauthLogin(obj[0], token);
        } else {
          warningMessage("Login failed. Please, try again later.", 3000);
        }
      }
    }
    if (error) {
      errorMessage(
        "Subscription error at => " + (error?.message || error),
        3000,
      );
    }
  }, [data, error]);

  return (
    <React.Fragment>
      <MUI.MainBox>
        <MUI.LeftBox>
          <MUI.LeftBoxRow1>
            <Link href={`${ENV_KEYS.VITE_APP_URL_REDIRECT_LANDING_PAGE}`}>
              <img src={vShareLogo} alt="vShareLogo" />
            </Link>
          </MUI.LeftBoxRow1>

          <MUI.LeftBoxRow2>
            <Typography
              sx={{
                color: "#17766B",
                marginBottom: "1rem",
                fontWeight: 700,
                fontSize: mobileScreen ? "1.5rem" : "2rem",
              }}
            >
              Login
            </Typography>

            {/* Social Media */}
            {!hideLogin && (
              <MUI.BoxShowSocialMediaLogin>
                {showGoogle && (
                  <IconButton
                    // onClick={() => googleOauth.googleButton.click()}
                    onClick={() => SocialMediaAuths("/google")}
                    sx={{
                      border: "1px solid gray",
                      width: mobileScreen ? "30px" : "50px",
                      height: mobileScreen ? "30px" : "50px",
                      margin: "0 1rem",
                    }}
                  >
                    <GoogleIcon />
                  </IconButton>
                )}

                {showFacebook && (
                  <IconButton
                    // onClick={() => facebookOauth.signIn()}
                    onClick={() => SocialMediaAuths("/facebook")}
                    sx={{
                      border: "1px solid gray",
                      width: mobileScreen ? "30px" : "50px",
                      height: mobileScreen ? "30px" : "50px",
                      margin: "0 1rem",
                    }}
                  >
                    <FacebookIcon />
                  </IconButton>
                )}

                {showGithub && (
                  <IconButton
                    // onClick={() => githubOauth.handleGithubSignIn()}
                    onClick={() => SocialMediaAuths("/github")}
                    sx={{
                      border: "1px solid gray",
                      width: mobileScreen ? "30px" : "50px",
                      height: mobileScreen ? "30px" : "50px",
                      margin: "0 1rem",
                    }}
                  >
                    <GitHubIcon />
                  </IconButton>
                )}
              </MUI.BoxShowSocialMediaLogin>
            )}

            {hideLogin && (
              <MUI.LeftBoxRowAuthenticationLimit>
                <Typography variant="h2">
                  Whoops something went wrong.
                </Typography>
                <Typography variant="h4">
                  To many login attemps. Please try again on{" "}
                  <strong>{initialTimeMessage}</strong> minutes
                </Typography>
              </MUI.LeftBoxRowAuthenticationLimit>
            )}

            <Fragment>
              <Typography
                sx={{
                  fontSize: "1.2rem",
                  fontWeight: 500,
                  [theme.breakpoints.down("sm")]: {
                    fontSize: "0.9rem",
                  },
                }}
              >
                Or use your email account:
              </Typography>
              <MUI.BoxShowFormik>
                <BaseSignin
                  signInCaptcha={signInCaptcha}
                  signInLimit={signInLimit}
                  handleLoginFailure={loginLimitFailure}
                  hideLogin={hideLogin}
                />
              </MUI.BoxShowFormik>
            </Fragment>
          </MUI.LeftBoxRow2>
        </MUI.LeftBox>
        <MUI.RightBox>
          <Typography variant="h2">Hello, Friends!</Typography>
          <MUI.BoxShowDetail>
            <Typography variant="h4">Enter your personal details</Typography>
            <br />
            <Typography variant="h4">and Start journey with us</Typography>
          </MUI.BoxShowDetail>
          <NavLink
            to={`${ENV_KEYS.VITE_APP_URL_REDIRECT_CLIENT_PAGE}auth/sign-up`}
          >
            <MUI.ButtonGetStarted>Get Started</MUI.ButtonGetStarted>
          </NavLink>
        </MUI.RightBox>
      </MUI.MainBox>
    </React.Fragment>
  );
}

export default SignIn;
