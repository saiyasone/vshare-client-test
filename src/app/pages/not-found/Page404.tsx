import styled from "@emotion/styled";
import { Helmet } from "react-helmet-async";
import { NavLink } from "react-router-dom";

import { Button as MuiButton, Typography } from "@mui/material";
import { spacing } from "@mui/system";

const Button: any = styled(MuiButton)(spacing);

const Wrapper = styled.div`
  padding: ${(props: any) => props.theme.spacing(6)};
  text-align: center;
  background: transparent;

  ${(props: any) => props.theme.breakpoints.up("md")} {
    padding: ${(props: any) => props.theme.spacing(10)};
  }
`;

function Page404() {
  return (
    <Wrapper>
      <Helmet title="404 Error" />
      <Typography component="h1" variant="h1" align="center" gutterBottom>
        404
      </Typography>
      <Typography component="h2" variant="h5" align="center" gutterBottom>
        Page not found.
      </Typography>
      <Typography component="h2" variant="body1" align="center" gutterBottom>
        The page you are looking for might have been removed.
      </Typography>

      <Button
        component={NavLink}
        to="/"
        variant="contained"
        color="secondary"
        mt={2}
      >
        Return to website
      </Button>
    </Wrapper>
  );
}

export default Page404;
