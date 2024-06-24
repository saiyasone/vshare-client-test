import { Box, styled } from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers";

const DateTimePickerV1Container = styled(Box)({
  width: "100%",
  display: "flex",
  flexDirection: "column",
  height: "100%",
  minHeight: "100%",
});

const DateTimePickerV1Lable = styled(Box)(({ theme }) => ({
  fontWeight: theme.typography.fontWeightMedium,
}));

const DateTimePickerV1Content = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(1),
  width: "100%",
}));

const DateTimeInput = ({ dateTimePickerProps, ...props }) => {
  return (
    <DateTimePickerV1Container>
      <DateTimePickerV1Lable>{props.label}</DateTimePickerV1Lable>
      <DateTimePickerV1Content
        sx={{
          "& .MuiTextField-root": {
            width: "100% !important",
          },
          "& .MuiInputBase-root": {},
          "input::placeholder": {
            opacity: "1 !important",
            color: "#9F9F9F",
          },
          ...(props.dateTimePickerLayoutProps?.sx || {}),
        }}
      >
        <DateTimePicker
          format="dd/MM/yyyy HH:mm:ss"
          sx={{
            ...(dateTimePickerProps?.sx || {}),
          }}
          slotProps={{
            popper: {
              sx: {
                zIndex: "99999999999 !important",
              },
            },
            desktopPaper: {
              sx: {
                boxShadow: (theme) => `${theme.baseShadow.primary} !important`,
              },
            },
            textField: {
              InputLabelProps: {
                shrink: false,
              },
              sx: {
                input: {
                  "&::placeholder": {
                    opacity: "1 !important",
                  },
                },
                ...(dateTimePickerProps?.sx || {}),
              },
            },
            ...(props.placeholder && {
              textField: {
                placeholder: props.placeholder,
              },
            }),
          }}
          inputFormat="dd/MM/yyyy HH:mm:ss"
          {...dateTimePickerProps}
        />
      </DateTimePickerV1Content>
    </DateTimePickerV1Container>
  );
};

export default DateTimeInput;
