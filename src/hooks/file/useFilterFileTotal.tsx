import React from "react";
import {
  TbFileDownload,
  TbFileReport,
  TbFileSearch,
  TbFileSymlink,
} from "react-icons/tb";
import { intToPrettyString } from "utils/covert.util";
import { convertBytetoMBandGB } from "utils/storage.util";
import { stringPluralize } from "utils/string.util";

const useFilterFileTotal = ({ totalStorage, files, dataSpace }) => {
  const data = React.useMemo(() => {
    return [
      {
        title: "available storage",
        total: dataSpace?.getSpaces?.totalStorage
          ? convertBytetoMBandGB(
              Number(dataSpace?.getSpaces?.totalStorage || 0) -
                Number(dataSpace?.getSpaces?.usedStorage || 0),
            )
          : "0 B",
        icon: {
          element: <TbFileReport />,
          style: {
            color: "#10b981",
            backgroundColor: "rgba(23,118,107,0.1)",
          },
        },
      },
      {
        title: "used storage",
        total: dataSpace?.getSpaces?.usedStorage
          ? convertBytetoMBandGB(Number(dataSpace?.getSpaces?.usedStorage || 0))
          : "0 B",
        icon: {
          element: <TbFileSymlink />,
          style: {
            color: "#ffa44f",
            backgroundColor: "#ffefe1",
          },
        },
      },

      {
        title: "active files",
        total: totalStorage
          ? convertBytetoMBandGB(Number(files.totalActiveSize))
          : "0 B",
        icon: {
          element: <TbFileSearch />,
          style: {
            color: "#29c770",
            backgroundColor: "#e5f8ed",
          },
        },
      },

      {
        title: "total downloads",
        total: totalStorage
          ? `${intToPrettyString(files.downloadedDataCount)} ${stringPluralize(
              files.downloadedDataCount,
              "Download",
              "s",
            )}`
          : "0 B",
        icon: {
          element: <TbFileDownload />,
          style: {
            color: "#eb5f60",
            backgroundColor: "#fceaea",
          },
        },
      },
    ];
  }, [totalStorage, files, dataSpace]);

  return {
    data,
  };
};

export default useFilterFileTotal;
