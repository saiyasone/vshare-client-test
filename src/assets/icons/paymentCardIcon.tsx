import Amex from "../images/payment/amex.svg?react";
import Diners from "../images/payment/diners.svg?react";
import Jcb from "../images/payment/jcb.svg?react";
import Mastercard from "../images/payment/mastercard.svg?react";
import Visa from "../images/payment/visa.svg?react";

export const MastercardIcon = (props) => {
  return <Mastercard {...props} />;
};

export const VisaIcon = (props) => {
  return <Visa {...props} />;
};
export const AmexIcon = (props) => {
  return <Amex {...props} />;
};

export const JcbIcon = (props) => {
  return <Jcb {...props} />;
};
export const DinersIcon = (props) => {
  return <Diners {...props} />;
};
