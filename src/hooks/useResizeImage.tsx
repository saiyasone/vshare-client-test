import axios from "axios";
import { ENV_KEYS } from "constants/env.constant";
import _ from "lodash";
import { useEffect, useState } from "react";
import { encryptData } from "utils/secure.util";

const useResizeImage = ({
  imagePath,
  user,
  fileType,
  width = 200,
  height = 200,
  storageZoneName = ENV_KEYS.VITE_APP_STORAGE_ZONE,
}) => {
  const [imageSrc, setImageSrc] = useState<any>("");
  const [imageFound, setImageFound] = useState<any>(null);
  useEffect(() => {
    if (fileType === "image") {
      const fetchResizeImage = async (imagePath, userId) => {
        try {
          const enData = encryptData({
            storageZoneName,
            path: imagePath,
            createdBy: userId,
            width: `${width}`,
            height: `${height}`,
          });
          const res = await axios.get(
            `${ENV_KEYS.VITE_APP_LOAD_URL}downloader/file/resize-image?file=${enData}`,
            {
              responseType: "arraybuffer",
            },
          );
          if (_.isArrayBuffer(res.data)) {
            if (res.data.byteLength > 50) {
              const blob = new Blob([res.data], { type: "image/jpeg" });

              const url = URL.createObjectURL(blob);

              setImageSrc(url);
              setImageFound(true);
              return () => URL.revokeObjectURL(url);
            } else {
              setImageFound(false);
            }
          } else {
            setImageFound(false);
          }
        } catch (e) {
          setImageFound(false);
        }
      };
      if (imagePath && user?._id) {
        fetchResizeImage(imagePath, user?._id);
      } else {
        setImageFound(false);
      }
    }
  }, [imagePath, user, fileType]);

  return { imageSrc, imageFound };
};

export default useResizeImage;
