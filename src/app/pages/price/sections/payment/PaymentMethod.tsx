import { Box, useTheme } from "@mui/material";
import { styled } from "@mui/material/styles";
import useBcelSubscirption from "hooks/payment/useBcelSubscription";
import { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  PAYMENT_METHOD,
  paymentState,
  setActivePaymentMethod,
} from "stores/features/paymentSlice";
import NormalButton from "../../../../../components/NormalButton";
import BCELOnePayment from "./BCELOnePayment";
import StripePayment from "./StripePayment";

const PaymentMethodContainer = styled("div")({
  display: "flex",
  flexDirection: "column",
  rowGap: 16,
});

const PaymentMethod = () => {
  const theme = useTheme();
  const dispatch = useDispatch();

  const paymentSelector: any = useSelector(paymentState);

  const btnMethodList = useMemo(() => {
    if (paymentSelector?.showBcelOne && paymentSelector?.showStripe) {
      return [PAYMENT_METHOD.bcelOne];
    }

    if (paymentSelector?.showStripe && !paymentSelector?.showBcelOne) {
      return [PAYMENT_METHOD.bcelOne];
    }

    if (!paymentSelector?.showStripe && paymentSelector?.showBcelOne) {
      return [PAYMENT_METHOD.bcelOne];
    }

    return [];
  }, []);

  const bcelOnePay = useBcelSubscirption();
  const paymentMethodList = () => {
    switch (paymentSelector.activePaymentMethod) {
      case PAYMENT_METHOD.bcelOne:
        return (
          <BCELOnePayment qrCode={bcelOnePay.qrCode} link={bcelOnePay.link} />
        );
      case PAYMENT_METHOD.stripe:
        return <StripePayment />;
      default:
        return;
    }
  };

  return (
    <PaymentMethodContainer>
      <Box
        sx={{
          display: "flex",
          columnGap: 1,
        }}
      >
        {btnMethodList.map((paymentMethod, index) => {
          return (
            <NormalButton
              key={index}
              sx={{
                width: "auto",
                height: "35px",
                padding: (theme) => `${theme.spacing(2)} ${theme.spacing(4)}`,
                fontWeight: 600,
                borderRadius: (theme) => theme.spacing(1),
                ...(paymentSelector.activePaymentMethod === paymentMethod
                  ? {
                      backgroundColor: (theme) =>
                        theme.palette.primaryTheme.main,
                      color: "white !important",
                    }
                  : {
                      ":hover": {
                        color: `${theme.palette.primaryTheme!.main} !important`,
                      },
                    }),
                textAlign: "center",
                display: "block",
              }}
              onClick={() => dispatch(setActivePaymentMethod(paymentMethod))}
            >
              {paymentMethod}
            </NormalButton>
          );
        })}
      </Box>
      {paymentMethodList()}
    </PaymentMethodContainer>
  );
};

export default PaymentMethod;
