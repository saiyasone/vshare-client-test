import { useMutation } from "@apollo/client";
import { MUTATION_CREATE_QR_AND_SUBSCRIPTION } from "api/graphql/payment.graphql";
import { clientMockup } from "main";
import { platform } from "os";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { paymentState } from "stores/features/paymentSlice";

const useBcelSubscirption = () => {
  const { addressData, activePackageData, total, activePaymentMethod } =
    useSelector(paymentState);
  const [createQrAndSubscription] = useMutation(
    MUTATION_CREATE_QR_AND_SUBSCRIPTION,
    {
      client: clientMockup,
    },
  );

  const [qrCode, setQrCode] = useState<string>("");
  const [link, setLink] = useState<string>("");
  const [transactionId, setTransactionId] = useState<string>("");

  useEffect(() => {
    console.log({bcelPaylaod:{
      amount: total,
          card: "BCEL",
          category: 'package',
          description: activePackageData?.description?.substring(0, 25)?.replace(/\s/g,'')+"...",
          packageId: activePackageData?.packageId,
          paymentMethod: "bcelone",
          service: "BCELONE_PAY",
          status: "success",
          type: "monthly",
          platform: 'ANDROID'
    }});

    createQrAndSubscription({
      variables: {
        data: {
          amount: total,
          card: "BCEL",
          category: 'package',
          description: activePackageData?.description?.substring(1, 5),
          packageId: activePackageData?.packageId,
          paymentMethod: "bcelone",
          service: "BCELONE_PAY",
          status: "success",
          type: "monthly",
          platform: 'ANDROID'
        },
      },

    }).then((res) => {
      const { qrCode, transactionId } =
        res.data.createQrAndSubscribeForPayment || {};

      // console.log('qr=',qrCode);
      // console.log({transactionId:transactionId});
      setTransactionId(`${transactionId}`);
      setQrCode(`${qrCode}`);
      setLink(`onepay://qr/${qrCode}`);
    });
  }, []);

  return {
    qrCode,
    link,
    transactionId,
  };
};

export default useBcelSubscirption;
