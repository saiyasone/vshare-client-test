import styled from "@emotion/styled";
import { Paper, Typography } from "@mui/material";
import logoVShareSvg from "assets/images/logo-vshare.svg";
import React from "react";
import { FaLock } from "react-icons/fa";
import ForgotPasswordUsage from "./ForgotPasswordUsage";

const Wrapper = styled(Paper)`
  padding: ${(props: any) => props.theme.spacing(6)};

  ${(props: any) => props.theme.breakpoints.up("md")} {
    padding: ${(props: any) => props.theme.spacing(10)};
  }
  ${(props: any) => props.theme.breakpoints.down("sm")} {
    padding: ${(props: any) => props.theme.spacing(4)};
    margin: ${(props: any) => props.theme.spacing(4)};
  }
  box-shadow: rgba(149, 157, 165, 0.2) 0px 8px 24px;
`;
//components
const LogoBrand = styled("div")({
  display: "flex",
  justifyContent: "center",
  marginBottom: "2rem",
});

function ForgotPassword() {
  return (
    <React.Fragment>
      <Wrapper>
        <LogoBrand>
          <img src={logoVShareSvg} alt="logo" width="130px" />
        </LogoBrand>
        <Typography component="h1" variant="h4" align="left" gutterBottom>
          Forget Password? <FaLock fill="#9e9d24" size="16" />
        </Typography>
        <Typography component="h2" variant="body1" align="left" sx={{ mt: 2 }}>
          Enter you email, and we'll send you instructions to reset your
          password.
        </Typography>
        <Typography component="li" variant="body2" align="left" sx={{ mt: 3 }}>
          Enter email account registered on vshare.net.
        </Typography>
        <Typography component="li" variant="body2" align="left">
          Check message on your email account.
        </Typography>

        <ForgotPasswordUsage />
      </Wrapper>
    </React.Fragment>
  );
}

export default ForgotPassword;
