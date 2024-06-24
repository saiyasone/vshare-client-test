import { Button, DialogContent, Typography } from "@mui/material";
import BaseDialogV1 from "components/BaseDialogV1";
import React from "react";
import {
  ReplyCloseToggleAction,
  ReplyCloseToggleContent,
} from "styles/reply.style";
import { CloseTicketButton } from "styles/ticket.style";

function DialogCloseTicket(props) {
  const { onClose, onConfirm } = props;
  const TextStyled = {
    color: "#4B465C",
  };
  return (
    <React.Fragment>
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
        <DialogContent sx={{ textAlign: "center" }}>
          <ReplyCloseToggleContent>
            <Typography variant="h3" style={TextStyled}>
              Close ticket?
            </Typography>

            <Typography variant="h5" sx={TextStyled}>
              Once a support ticket is closed, it cannot be reopened.
            </Typography>
          </ReplyCloseToggleContent>

          <ReplyCloseToggleAction>
            <Button onClick={onConfirm} variant="contained" type="button">
              Yes, closed it!
            </Button>
            <CloseTicketButton
              onClick={onClose}
              variant="contained"
              type="button"
            >
              Cancel
            </CloseTicketButton>
          </ReplyCloseToggleAction>
        </DialogContent>
      </BaseDialogV1>
    </React.Fragment>
  );
}

export default DialogCloseTicket;
