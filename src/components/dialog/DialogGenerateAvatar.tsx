import { Box, Grid, Typography } from "@mui/material";
import { styled as muiStyled } from "@mui/system";
import multiavatar from "@multiavatar/multiavatar/esm";
import BaseDialogV1 from "components/BaseDialogV1";
import { useMemo, useState } from "react";
import { generateRandomName } from "utils/string.util";
import { v4 as uuidv4 } from "uuid";
import NormalButton from "../../components/NormalButton";

const DialogGenerateAvatarBoby = muiStyled("div")(({ theme }) => ({
  width: "100%",
  display: "flex",
  flexDirection: "column",
  padding: theme.spacing(5),
}));

const DialogGenerateAvatar = (props) => {
  const [showDelayedRefreshSvgList, setShowDelayedRefreshSvgList] =
    useState<any>(false);
  const [refreshSvgList, triggerRefreshSvgList] = useState<any>(false);
  const [selectedSvgId, setSelectedSvgId] = useState<any>(null);
  const [selectedSvgError, setSelectedSvgError] = useState<any>("");
  const svgList = useMemo(() => {
    setSelectedSvgId("");
    return Array.from({ length: 64 }).map(() => {
      return {
        id: uuidv4(),
        code: multiavatar(generateRandomName()),
      };
    });
  }, [refreshSvgList]);

  return (
    <BaseDialogV1
      {...props}
      dialogProps={{
        PaperProps: {
          sx: {
            overflowY: "initial",
            maxWidth: "650px",
          },
        },
        sx: {
          columnGap: "20px",
        },
      }}
      dialogContentProps={{
        sx: {
          backgroundColor: "white !important",
          borderRadius: "6px",
          padding: (theme) => `${theme.spacing(5)}`,
        },
      }}
    >
      <DialogGenerateAvatarBoby>
        <Typography
          component="div"
          sx={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            rowGap: (theme) => theme.spacing(3),
            fontWeight: "bold",
            color: (theme) => theme.palette.primaryTheme!.brown(),
          }}
        >
          <Typography component="div">
            <Grid container spacing={2}>
              {svgList.map((svgCode) => {
                return (
                  <Grid item xs={3} sm={2} md={1.5} key={svgCode.id}>
                    <Typography
                      component="button"
                      sx={{
                        transition: "100ms",
                        borderRadius: "4px",
                        ":hover": {
                          border: (theme) =>
                            `1px solid ${theme.palette.primaryTheme!.main}`,
                        },
                        border: "1px solid #F0F0F0",
                        ...(selectedSvgId === svgCode.id && {
                          border: (theme) =>
                            `1px solid ${theme.palette.primaryTheme!.main}`,
                        }),
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        justifyContent: "center",
                        cursor: "pointer",
                      }}
                      onClick={() => setSelectedSvgId(svgCode.id)}
                    >
                      <Typography
                        component="img"
                        src={`data:image/svg+xml;utf8,${encodeURIComponent(
                          svgCode.code,
                        )}`}
                      />
                    </Typography>
                  </Grid>
                );
              })}
            </Grid>
          </Typography>
        </Typography>
        {selectedSvgError && (
          <Typography
            component="div"
            sx={{
              marginTop: 2,
              fontWeight: 600,
              color: (theme) => theme.palette.error.main,
            }}
          >
            {selectedSvgError}
          </Typography>
        )}
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            columnGap: (theme) => theme.spacing(3),
            marginTop: 4,
          }}
        >
          <NormalButton
            sx={{
              width: "auto",
              padding: (theme) => `${theme.spacing(2)} ${theme.spacing(4)}`,
              borderRadius: (theme) => theme.spacing(1),
              backgroundColor: (theme) => theme.palette.primaryTheme!.main,
              color: "white !important",
              display: "flex",
              alignItems: "center",
              ...(showDelayedRefreshSvgList && {
                opacity: 0.7,
              }),
            }}
            {...{
              ...(!showDelayedRefreshSvgList
                ? {
                    onClick: () => {
                      setShowDelayedRefreshSvgList(true);
                      setTimeout(() => {
                        triggerRefreshSvgList((prevState) => !prevState);
                        setShowDelayedRefreshSvgList(false);
                      }, 3000);
                    },
                  }
                : {
                    disabled: true,
                  }),
            }}
          >
            {showDelayedRefreshSvgList ? "loading..." : "refresh"}
          </NormalButton>
          <NormalButton
            sx={{
              width: "auto",
              padding: (theme) => `${theme.spacing(2)} ${theme.spacing(4)}`,
              borderRadius: (theme) => theme.spacing(1),
              backgroundColor: (theme) => theme.palette.primaryTheme!.main,
              color: "white !important",
              display: "flex",
              alignItems: "center",
            }}
            onClick={() => {
              const selectedSvgList = svgList.find(
                (svgCode) => svgCode.id === selectedSvgId,
              )?.code;
              if (selectedSvgList) {
                props.onConfirm(selectedSvgList);
                setSelectedSvgError("");
              } else {
                setSelectedSvgError("You didn't select an avartar");
              }
            }}
          >
            Confirm
          </NormalButton>
        </Box>
      </DialogGenerateAvatarBoby>
    </BaseDialogV1>
  );
};

export default DialogGenerateAvatar;
