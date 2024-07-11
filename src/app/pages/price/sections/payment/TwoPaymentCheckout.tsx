import { Fragment } from "react";
import { Box } from "@mui/material";
import { LoadingButton } from "@mui/lab";

import { ENV_KEYS } from "constants/env.constant";

type Prop = {
  packageId: string;
  handleSuccess?: () => void;
};

function TwoPaymentCheckout({ packageId }: Prop) {
  const handleTwoPaymentCheckout = async () => {
    // setIsLoading(true);
    window.open(
      `${ENV_KEYS.VITE_APP_API_URL}/payments/checkout?productCode=${packageId}`,
    );
  };
  return (
    <Fragment>
      <Box>
        <LoadingButton variant="contained" onClick={handleTwoPaymentCheckout}>
          Payment
        </LoadingButton>
      </Box>
    </Fragment>
  );
}

export default TwoPaymentCheckout;
