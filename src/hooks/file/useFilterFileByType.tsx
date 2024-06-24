import AudioIcon from "assets/images/client-dashboard/audio.svg?react";
import FileIcon from "assets/images/client-dashboard/file.svg?react";
import ImageIcon from "assets/images/client-dashboard/image.svg?react";
import OthersIcon from "assets/images/client-dashboard/other.svg?react";
import TextIcon from "assets/images/client-dashboard/text.svg?react";
import VideoIcon from "assets/images/client-dashboard/video.svg?react";
import React from "react";
import { convertBytetoMBandGB } from "utils/storage.util";
import { stringPluralize } from "utils/string.util";

const useFilterFileByType = ({ files }) => {
  const data = React.useMemo(() => {
    return [
      {
        title: `${files.documentFileData.totalLength} ${stringPluralize(
          files.documentFileData.totalLength,
          "Document",
          "s",
        )}`,
        total: files
          ? convertBytetoMBandGB(files.documentFileData.totalSize)
          : 0,
        icon: {
          element: <FileIcon />,
          style: {
            color: "#10b981",
            backgroundColor: "rgba(23,118,107,0.1)",
          },
        },
      },
      {
        title: `${files.imageFileData.totalLength} ${stringPluralize(
          files.imageFileData.totalLength,
          "Image",
          "s",
        )}`,
        total: files
          ? convertBytetoMBandGB(files.imageFileData.totalSize)
          : null,
        icon: {
          element: <ImageIcon />,
          style: {
            color: "#10b981",
            backgroundColor: "rgba(23,118,107,0.1)",
          },
        },
      },
      {
        title: `${files.videoFileData.totalLength} ${stringPluralize(
          files.videoFileData.totalLength,
          "Video",
          "s",
        )}`,
        total: files
          ? convertBytetoMBandGB(files.videoFileData.totalSize)
          : null,
        icon: {
          element: <VideoIcon />,
          style: {
            color: "#10b981",
            backgroundColor: "rgba(23,118,107,0.1)",
          },
        },
      },
      {
        title: `${files.audioFileData.totalLength} ${stringPluralize(
          files.audioFileData.totalLength,
          "Audio",
          "s",
        )}`,
        total: files
          ? convertBytetoMBandGB(files.audioFileData.totalSize)
          : null,
        icon: {
          element: <AudioIcon />,
          style: {
            color: "#10b981",
            backgroundColor: "rgba(23,118,107,0.1)",
          },
        },
      },
      {
        title: `${files.textFileData.totalLength} ${stringPluralize(
          files.textFileData.totalLength,
          "Text",
          "s",
        )}`,
        total: files
          ? convertBytetoMBandGB(files.textFileData.totalSize)
          : null,
        icon: {
          element: <TextIcon />,
          style: {
            color: "#10b981",
            backgroundColor: "rgba(23,118,107,0.1)",
          },
        },
      },
      {
        title: "Others",
        total: files
          ? convertBytetoMBandGB(files.otherFileData.totalSize)
          : null,
        icon: {
          element: <OthersIcon />,
          style: {
            color: "#10b981",
            backgroundColor: "rgba(23,118,107,0.1)",
          },
        },
      },
    ];
  }, [files]);
  return data;
};

export default useFilterFileByType;
