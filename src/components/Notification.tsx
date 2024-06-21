import MuiAlert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import Stack from "@mui/material/Stack";
import * as React from "react";

const Alert = React.forwardRef<any, any>(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export default function Notification(props) {
  return (
    <Stack spacing={2} sx={{ width: "100%" }}>
      <Snackbar
        open={props.open}
        autoHideDuration={props.timeout}
        onClose={props.handleClose}
        anchorOrigin={{ horizontal: "right", vertical: "top" }}
      >
        <Alert
          onClose={props.handleClose}
          severity={props.severity}
          sx={{ width: "100%" }}
        >
          {props.message}
        </Alert>
      </Snackbar>
    </Stack>
  );
}
