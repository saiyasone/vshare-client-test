import { useLazyQuery } from "@apollo/client";
import { styled } from "@mui/material/styles";
import { QUERY_ONEPAY_SUBSCRIPTION } from "api/graphql/payment.graphql";
import { useState } from "react";
import { useSelector } from "react-redux";
import { paymentState } from "stores/features/paymentSlice";
import NormalButton from "../../../../../components/NormalButton";

const BCELOnePaymentContainer = styled("div")({
  display: "flex",
  flexDirection: "column",
  rowGap: 12,
});

const BCELOnePayment: React.FC<any> = (_props) => {
  const [getOnePaySubscription] = useLazyQuery(QUERY_ONEPAY_SUBSCRIPTION, {
    fetchPolicy: "no-cache",
  });
  const [params, setParams] = useState({});
  const paymentSelector: any = useSelector(paymentState);

  const handlePayWithLink = async () => {
    getOnePaySubscription({
      variables: {
        where: {
          packageId: paymentSelector.activePackageData.packageId,
          type: paymentSelector.activePackageType,
        },
      },
      onCompleted: async (data) => {
        try {
          const params = data.onePaySubscription.params;
          setParams(params);
        } catch (e) {
          console.error(e);
        }
      },
    });
  };

  return (
    <BCELOnePaymentContainer>
      <NormalButton
        onClick={handlePayWithLink}
        sx={{
          fontWeight: 600,
          width: "max-content",
          margin: (theme) => `${theme.spacing(2)} ${theme.spacing(4)}`,
          borderRadius: (theme) => theme.spacing(1),
          color: (theme) => theme.palette.primaryTheme.main,
        }}
      >
        Pay with link
      </NormalButton>
      {Object.keys(params).length > 0 && (
        <form action="https://bcel.la:9094/test" method="post">
          {Object.keys(params).map((key) => {
            return <input type="hidden" name={key} value={params[key]} />;
          })}
          <button type="submit">click</button>
        </form>
      )}
    </BCELOnePaymentContainer>
  );
};

export default BCELOnePayment;
