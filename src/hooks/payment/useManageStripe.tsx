import { useLazyQuery } from "@apollo/client";
import { QUERY_PAYMENT } from "api/graphql/payment.graphql";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { paymentState } from "stores/features/paymentSlice";

const useStripeManage = (_id: any) => {
  const dispatch = useDispatch();
  const dataPayment = useSelector(paymentState);
  const [payment, { data: isPaymentId }] = useLazyQuery(QUERY_PAYMENT, {
    fetchPolicy: "no-cache",
  });

  const customQueryPayment = () => {};

  React.useEffect(() => {
    customQueryPayment();
  }, [dataPayment, dispatch, payment]);

  return {
    customQueryPayment,
    data: isPaymentId?.getPayments?.data[0]?._id || null,
  };
};
export default useStripeManage;
