import { Box, Paper, Typography } from "@mui/material";
import { TbSlash } from "react-icons/tb";
import BreadcrumbNavigate from "../../../components/BreadcrumbNavigate";
import TicketForm from "./TicketForm";
import * as MUI from "./styles/createTicket.style";
import { HeaderLayout } from "./styles/ticket2.style";

function CreateTicket() {
  return (
    <>
      <Box sx={{ mt: 3 }}>
        <HeaderLayout>
          <BreadcrumbNavigate
            separatorIcon={<TbSlash />}
            disableDefault
            title="support-ticket"
            titlePath="/support-ticket"
            path={["support-ticket"]}
            readablePath={["New", "New Support Ticket"]}
            handleNavigate={() => {}}
          />
        </HeaderLayout>
        <MUI.TicketContainer>
          <Paper
            sx={{
              mt: (theme) => theme.spacing(3),
              boxShadow: (theme) => theme.baseShadow.secondary,
              flex: "1 1 0",
            }}
          >
            <MUI.TicketBody>
              <Typography variant="h4" fontWeight={400}>
                Add Your Ticket
              </Typography>

              <Box mt={3}>
                <TicketForm />
              </Box>
            </MUI.TicketBody>
          </Paper>
        </MUI.TicketContainer>
      </Box>
    </>
  );
}

export default CreateTicket;
