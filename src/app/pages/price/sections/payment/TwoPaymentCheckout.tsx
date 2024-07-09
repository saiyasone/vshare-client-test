import { Fragment, useState } from "react";
import { Box } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { useMutation } from "@apollo/client";
import { MUTATION_CREATE_TWO_CHECKOUT } from "api/graphql/payment.graphql";
import useManageGraphqlError from "hooks/useManageGraphqlError";
import { errorMessage } from "utils/alert.util";

type Prop = {
  packageId: string;
  handleSuccess?: () => void;
};

function TwoPaymentCheckout({ packageId, handleSuccess }: Prop) {
  const [isLoading, setIsLoading] = useState(false);

  // graphql
  const manageGraphError = useManageGraphqlError();
  const [paymentCheckout] = useMutation(MUTATION_CREATE_TWO_CHECKOUT);

  const handleTwoPaymentCheckout = async () => {
    setIsLoading(true);
    try {
      await paymentCheckout({
        variables: {
          packageId,
        },
        onCompleted: () => {
          setIsLoading(false);
          handleSuccess?.();
        },
      });
    } catch (error: any) {
      setIsLoading(false);
      const cutErr = error.message.replace(/(ApolloError: )?Error: /, "");
      errorMessage(
        manageGraphError.handleErrorMessage(cutErr || "") as string,
        3000,
      );
    }
  };
  return (
    <Fragment>
      <Box>
        <LoadingButton
          variant="contained"
          loading={isLoading}
          onClick={handleTwoPaymentCheckout}
        >
          Payment
        </LoadingButton>
      </Box>
    </Fragment>
  );
}

export default TwoPaymentCheckout;
