import { Skeleton } from "@mui/material";
import React from "react";

const AdaptiveSkeleton: React.FC<any> = (props) => {
  return (
    <>
      {props.loading ? (
        <Skeleton
          animation="wave"
          sx={{
            width: "100%",
            maxWidth: "100%",
            height: "100%",
            transform: "scale(1)",
            ...(props.sx || {}),
          }}
        >
          {props.children}
        </Skeleton>
      ) : (
        props.children
      )}
    </>
  );
};

export default AdaptiveSkeleton;
