import Address from "../images/pricing/address.svg?react";
import Cart from "../images/pricing/cart.svg?react";
import Confirmation from "../images/pricing/confirmation.svg?react";
import Payment from "../images/pricing/payment.svg?react";

export const CartIcon = (props) => {
  return (
    <Cart
      {...props}
      style={{
        "--payment-cart-color": props.style?.color || "#4B465C",
      }}
    />
  );
};

export const AddressIcon = (props) => {
  return (
    <Address
      {...props}
      style={{
        "--payment-address-color": props.style?.color || "#4B465C",
      }}
    />
  );
};

export const PaymentIcon = (props) => {
  return (
    <Payment
      {...props}
      style={{
        ...props.style,
        "--payment-color": props.style?.color || "#4B465C",
      }}
    />
  );
};

export const ConfirmationIcon = (props) => {
  return (
    <Confirmation
      {...props}
      style={{
        ...props.style,
        "--payment-confirmation-color": props.style?.color || "#4B465C",
      }}
    />
  );
};
