import { useSubscription } from "@apollo/client";
import { Typography, useMediaQuery } from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";
import { SUBSCRIPTION_BCEL_ONE_SUBSCRIPTION } from "api/graphql/payment.graphql";
import { useRef } from "react";
import QRCode from "react-qr-code";
import { setActiveStep } from "stores/features/paymentSlice";
import NormalButton from "../../../../../components/NormalButton";

const BCELOnePaymentContainer = styled("div")({
  display: "flex",
  flexDirection: "column",
  rowGap: 12,
});

const BCELOnePayment: React.FC<any> = (props) => {
  const theme = useTheme();
  const qrCodeRef = useRef<any>(null);
  const isMobile = useMediaQuery("(max-width:900px)");

  const _bcelOneSubscription = useSubscription(
    SUBSCRIPTION_BCEL_ONE_SUBSCRIPTION,
    {
      variables: { transactionId: props.transactionId },
      /* onComplete: () => {
        console.log("test");
      }, */
      onData: () => {
        setActiveStep(3);
      },
    },
  );

  const handleDownloadQrCode = () => {
    const svgDocument = qrCodeRef.current;
    if (!svgDocument) return;
    const svgContent = new XMLSerializer().serializeToString(svgDocument);
    const svgBlob = new Blob([`${svgContent}`], { type: "image/svg+xml" });
    const url = URL.createObjectURL(svgBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "qr_code.svg";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <BCELOnePaymentContainer>
      <Typography component="div">QR Code (BCEL One Subscription)</Typography>
      {isMobile ? (
        <>
          {props.link && (
            <Typography
              component="a"
              sx={{
                width: "max-content",
                fontSize: theme.spacing(4),
                fontWeight: 600,
              }}
              href={props.link}
            >
              Payment link
            </Typography>
          )}
        </>
      ) : (
        <>
          {props.qrCode && (
            <>
              {/* <Typography
                component="img"
                src={props.qrCode}
                width={"25%"}
                ref={qrCodeRef}
                sx={{
                  boxShadow: "rgba(0, 0, 0, 0.09) 0px 3px 12px",
                }}
              /> */}
              <QRCode
                ref={qrCodeRef}
                size={200}
                style={{ float: "left" }}
                value={props.qrCode}
                viewBox={`0 0 256 256`}
              />
              <NormalButton
                onClick={handleDownloadQrCode}
                sx={{
                  height: "auto",
                  fontWeight: 600,
                  width: "max-content",
                  margin: (theme) => `${theme.spacing(2)} ${theme.spacing(4)}`,
                  borderRadius: (theme) => theme.spacing(1),
                  color: (theme) => theme.palette.primaryTheme.main,
                }}
              >
                Download an image
              </NormalButton>
            </>
          )}
        </>
      )}
    </BCELOnePaymentContainer>
  );
};

export default BCELOnePayment;
