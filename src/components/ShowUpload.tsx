import { useLazyQuery, useMutation } from "@apollo/client";
import fileLogo from "assets/images/logo-1.svg";
import axios from "axios";
import CryptoJS from "crypto-js";
import * as React from "react";
import { useDropzone } from "react-dropzone";
import * as MUI from "styles/showUpload.style";
import { UAParser } from "ua-parser-js";
// component and functions

// material ui component or icons
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import DownloadDoneIcon from "@mui/icons-material/DownloadDone";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  LinearProgress,
  Tooltip,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import {
  MUTATION_ACTION_FILE,
  MUTATION_CREATE_FILE,
  MUTATION_DELETE_FILE,
} from "api/graphql/file.graphql";
import {
  MUTATION_CANCEL_UPLOAD_FOLDER,
  MUTATION_UPLOAD_FOLDER,
  QUERY_FOLDER,
} from "api/graphql/folder.graphql";
import { ENV_KEYS } from "constants/env.constant";
import { EventUploadTriggerContext } from "contexts/EventUploadTriggerProvider";
import { FolderContext } from "contexts/FolderProvider";
import {
  endTransaction,
  getTag,
  getTarget,
  startTransaction,
  startTransactionV1,
} from "hooks/uploads/useClientUpload";
import useAuth from "hooks/useAuth";
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { errorMessage, successMessage, warningMessage } from "utils/alert.util";
import { calculateTime } from "utils/date.util";
import { cutSpaceError } from "utils/error.util";
import { getFileNameExtension } from "utils/file.util";
import { encryptData } from "utils/secure.util";
import { convertBytetoMBandGB } from "utils/storage.util";
import { limitContent } from "utils/string.util";

export default function ShowUpload(props) {
  const {
    open,
    data,
    onSelectMore,
    onDeleteData,
    onClose,
    onRemoveAll,
    folderData,
    parentComponent,
  } = props;

  const navigate = useNavigate();
  const { CancelToken } = axios;
  const theme = useTheme();
  const BUNNY_URL = ENV_KEYS.VITE_APP_BUNNY_URL;
  const { user: userAuth }: any = useAuth();
  const UA = new UAParser();
  const result = UA.getResult();
  // apollo
  const [queryPath, { data: newPath }] = useLazyQuery(QUERY_FOLDER, {
    fetchPolicy: "no-cache",
  });

  const [uploadFiles] = useMutation(MUTATION_CREATE_FILE);
  const [deleteFile] = useMutation(MUTATION_DELETE_FILE);
  const [uplodFolder] = useMutation(MUTATION_UPLOAD_FOLDER);
  const [actionFile] = useMutation(MUTATION_ACTION_FILE);
  const [cancelUploadFolder] = useMutation(MUTATION_CANCEL_UPLOAD_FOLDER);

  const [files, setFiles] = useState<any[]>([]);
  const [fileId, setFileId] = useState({});
  const [fileTimes, setFileTimes] = useState<any[]>([]);
  const [fileProgress, setFileProgress] = useState({});
  const [fileSpeeds, setFileSpeeds] = useState<any[]>([]);
  const [successfulFiles, setSuccessfulFiles] = useState<any>([]);
  const [hideSelectMore, setHideSelectMore] = useState(0);
  const [isHide, setIsHide] = useState<any>(false);
  const [cancelStatus, setCancelStatus] = useState<any>(false);
  const [isSuccess, setIsSuccess] = useState<any>(false);
  const [cancelToken, setCancelToken] = useState({});
  const [uploadingId, setUploadingId] = useState(0);
  const [canClose, setCanClose] = useState(false);

  // presign
  const [progressBar, setProgressBar] = useState<any>({});
  const [uploads, setUploads] = useState<any[]>([]);
  const [presignSuccesFiles, setPresignSuccesFiles] = useState<any[]>([]);
  const [requestMap, setRequestMap] = useState(new Map());

  // presign v2
  const [fileStates, setFileStates] = useState<Record<number, any>>({});
  const [startUplload, setStartUpload] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const chunkSize = 10 * 1024 * 1024;

  const [hideFolderSelectMore, setHideFolderSelectMore] = useState(0);
  const [cancelFolderStatus, setCancelFolderStatus] = useState<any>(false);
  const [isHideFolder, setIsHideFolder] = useState<any>(false);
  const [isFolderSuccess, setIsFolderSuccess] = useState<any>(false);
  const { folderId, trackingFolderData }: any = useContext(FolderContext);
  const [folderCancelTokenSource, setFolderCancelTokenSource] =
    useState<any>(null);
  const [folderSpeed, setFolderSpeed] = useState({});
  const [folderStartTimeMap, setFolderStartTimeMap] = useState({});
  const eventUploadTrigger = useContext(EventUploadTriggerContext);
  const [folderProgressMap, setFolderProgressMap] = useState({});
  const [country, setCountry] = useState("");
  const LOAD_UPLOAD_URL = ENV_KEYS.VITE_APP_LOAD_UPLOAD_URL;
  // const useDataSetting = useManageSetting();
  const user = trackingFolderData?.createdBy?._id
    ? trackingFolderData?.createdBy
    : userAuth;

  // const settingKeys = {};

  const folderNames: Set<any> = new Set();
  folderData?.forEach((fileArray) => {
    fileArray.forEach((file) => {
      const folderName = file.webkitRelativePath.split("/")[0];
      folderNames.add(folderName);
    });
  });

  React.useEffect(() => {
    const fetchIPAddress = async () => {
      try {
        setCountry("other");
        // const responseIp = await axios.get(ENV_KEYS.VITE_APP_LOAD_GETIP_URL);
        // const ip = responseIp?.data;
        // if (ip) {
        //   const res = await axios.get(
        //     `https://pro.ip-api.com/json/${ip}?key=x0TWf62F7ukWWpQ`,
        //   );
        //   if (res) {
        //     setCountry(res?.data?.countryCode);
        //   }
        // }
      } catch (error) {
        setCountry("other");
        console.error("Error fetching IP address:");
      }
    };
    fetchIPAddress();
  }, []);

  // functions
  React.useEffect(() => {
    if (data) {
      setFiles(data);
    }
    if (folderData?.length < 0 && data?.length < 0) {
      handleCloseModal();
    }
  }, [data, newPath]);

  const handleUploadSuccess = (index) => {
    setSuccessfulFiles((prev) => [...prev, index]);
  };

  const handleUploadCancel = (index, type) => {
    onDeleteData(index, type);
  };

  const isSuccessful = (index) => {
    return successfulFiles.includes(index) || isSuccess[index];
  };

  const isPresignSuccessful = (data) => {
    return presignSuccesFiles.includes(data);
  };

  const handleCancleUploadFile = async (index) => {
    const id = fileId[index];
    await deleteFile({
      variables: {
        id: id,
      },
      onCompleted: () => {
        setCancelStatus((prev) => ({
          ...prev,
          [index]: true,
        }));
      },
    });

    if (cancelToken[index]) {
      cancelToken[index].cancel();
      setCancelToken((prev) => {
        const newState = { ...prev };
        delete newState[index];
        return newState;
      });
    }
  };

  const handleCancelUploadFolder = async (folderKey) => {
    try {
      await cancelUploadFolder({
        variables: {
          where: {
            _id: uploadingId,
            checkFolder: folderId > 0 ? "sub" : "main",
          },
        },
        onCompleted: () => {
          setCancelFolderStatus((prev) => ({
            ...prev,
            [folderKey]: true,
          }));

          setFolderSpeed((prev) => ({
            ...prev,
            [folderKey]: 0,
          }));

          setFolderStartTimeMap((prev) => ({
            ...prev,
            [folderKey]: "0",
          }));

          setFolderProgressMap((prev) => ({
            ...prev,
            [folderKey]: 0,
          }));
        },
      });

      if (folderCancelTokenSource[folderKey]) {
        folderCancelTokenSource[folderKey].cancel();
      }
    } catch (error: any) {
      errorMessage(error, 2000);
    }
  };

  const handleUploadDone = () => {
    onRemoveAll();
    setIsHide(false);
  };

  const handleUploadToExternalServer = async (
    index,
    id,
    file,
    newName,
    path,
  ) => {
    const startTime: any = new Date();
    setIsHide((prev) => ({
      ...prev,
      [index]: true,
    }));

    let filePath = "";
    if (path === "main") {
      filePath = "";
    } else {
      filePath = "/" + path;
    }

    // const url =
    BUNNY_URL + user?.newName + "-" + user?._id + filePath + "/" + newName;
    const pathBunny = user?.newName + "-" + user?._id + filePath;

    setFileId((prev) => ({
      ...prev,
      [index]: id,
    }));

    try {
      const headers = {
        createdBy: user?._id,
        PATH: pathBunny,
        FILENAME: newName,
      };

      const source = CancelToken.source();
      const cancelToken = source.token;
      setCancelToken((prev) => ({
        ...prev,
        [index]: source,
      }));

      const blob = new Blob([file], {
        type: file.type,
      });
      const newFile = new File([blob], file.name, { type: file.type });

      const formData = new FormData();
      formData.append("file", newFile);

      const encryptedData = encryptData(headers);

      const response = await axios.post(LOAD_UPLOAD_URL, formData, {
        headers: {
          encryptedHeaders: encryptedData,
        },
        cancelToken,
        onUploadProgress: (progressEvent: any) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total,
          );
          setFileProgress((prev) => ({
            ...prev,
            [index]: percentCompleted,
          }));
          const speed = convertBytetoMBandGB(
            progressEvent.loaded / ((Date.now() - startTime) / 1000),
          );
          const endTime = Date.now();
          const duration = calculateTime(endTime - startTime);
          setFileSpeeds((prev) => {
            const arr: any[] = [...prev];
            arr[index] = speed;
            return arr;
          });
          setFileTimes((prev) => {
            const arr: any[] = [...prev];
            arr[index] = duration;
            return arr;
          });
        },
      });

      if (response.data) {
        handleUploadSuccess(index);
      }
      setIsSuccess((prev) => ({
        ...prev,
        [index]: true,
      }));
      setIsHide((prev) => ({
        ...prev,
        [index]: false,
      }));
    } catch (error) {
      if (axios.isCancel(error)) {
        successMessage("Upload cancelled", 2000);
      } else {
        errorMessage("Upload failed", 3000);
      }
    } finally {
      setSuccessfulFiles([]);
    }
  };

  const handleUploadToInternalServer = async (fileData) => {
    setHideSelectMore(1);
    setCanClose(true);
    const filesArray: any[] = Array.from(fileData);
    if (fileData.length > 0) {
      try {
        const uploadPromises = filesArray.map(async (file, index) => {
          const randomName = Math.floor(1111111111 + Math.random() * 999999);
          let path = "";
          let newFilePath = "";
          if (folderId > 0) {
            const queryfolderPath = await queryPath({
              variables: {
                where: {
                  _id: folderId,
                  createdBy: user?._id,
                },
              },
            });
            const newPath = queryfolderPath?.data?.folders?.data[0]?.newPath;
            if (newPath) {
              path = newPath;
              newFilePath =
                newPath + "/" + randomName + getFileNameExtension(file.name);
            }
          }
          const uploading = await uploadFiles({
            variables: {
              data: {
                destination: "",
                newFilename: randomName + getFileNameExtension(file.name),
                filename: file.name,
                fileType: file.type,
                size: file.size.toString(),
                checkFile: folderId > 0 ? "sub" : "main",
                ...(folderId > 0 ? { folder_id: folderId } : {}),
                ...(folderId > 0 ? { newPath: newFilePath } : {}),
                country: country,
                device: result.os.name || "" + result.os.version || "",
                totalUploadFile: filesArray.length,
              },
            },
          });

          if (uploading?.data?.createFiles?._id) {
            const fileId = uploading?.data?.createFiles?._id;
            await handleActionFile(fileId);
            await handleUploadToExternalServer(
              index,
              fileId,
              file,
              randomName + getFileNameExtension(file.name),
              folderId > 0 ? path : "main",
            );
          }
        });

        await Promise.all(uploadPromises);
        await eventUploadTrigger?.trigger();
        setCanClose(false);
        setHideSelectMore(2);
      } catch (error: any) {
        console.error(error);
        setCanClose(false);
        setHideSelectMore(0);
        const message = cutSpaceError(error.message);
        if (message) {
          errorMessage("Your space isn't enough", 3000);
        } else {
          handleErrorFiles(error);
        }
      }
    }
  };

  const handleUploadToInternalServerV1 = async (fileData) => {
    setHideSelectMore(1);
    setCanClose(true);

    try {
      const filesArray: any[] = fileData;
      const tagList: any[] = [];

      // # loop get all tag
      for (let i = 0; i < filesArray.length; i++) {
        let path = "";
        let newFilePath = "";

        const randomName = Math.floor(111111111 + Math.random() * 999999999);
        const model = files[i];

        if (folderId > 0) {
          const queryfolderPath = await queryPath({
            variables: {
              where: {
                _id: folderId,
                createdBy: user?._id,
              },
            },
          });

          const newPath = queryfolderPath?.data?.folders?.data[0]?.newPath;
          if (newPath) {
            path = newPath;
            newFilePath =
              newPath + "/" + randomName + getFileNameExtension(model.name);
          }
        }
        const pathBunny = user?.newName + "-" + user?._id + "/" + path;

        model.createdBy = user._id;
        const newName = String(randomName + getFileNameExtension(model.name));
        model.newFilename = newName;
        model.path = pathBunny;
        model.newPath = newFilePath;

        const uploading = await uploadFiles({
          variables: {
            data: {
              destination: "",
              newFilename: randomName + getFileNameExtension(model.name),
              filename: model.name,
              fileType: model.type,
              size: model.size.toString(),
              checkFile: folderId > 0 ? "sub" : "main",
              ...(folderId > 0 ? { folder_id: folderId } : {}),
              ...(folderId > 0 ? { newPath: newFilePath } : {}),
              country: country,
              device: result.os.name || "" + result.os.version || "",
              totalUploadFile: filesArray.length,
            },
          },
        });

        const fileId = await uploading.data?.createFiles?._id;
        if (fileId) {
          await handleActionFile(fileId);
          const round = await getTag(model);
          tagList.push({ file: model, uploadId: round });
        } else {
          throw new Error("Uploading failed");
        }
      }
      setUploads(tagList);

      // # send all tag to target
      const sendTag = await getTarget(tagList);
      const targetList = sendTag;

      const partsData: Array<any> = [];
      const myparts: Array<any> = [];

      for (let i = 0; i < targetList.length; i++) {
        const startDate: any = new Date();
        const item: Array<any> = [];

        for (let j = 0; j < targetList[i].length; j++) {
          // const run = await startTransaction(
          //   targetList[i][j],
          //   startDate,
          //   (uploadId, partNumber, percentage) => {
          //     setPresignSuccesFiles((prev: any) => {
          //       const succssFile = { ...prev };
          //       if (!succssFile[uploadId]) {
          //         succssFile[uploadId] = {};
          //       }
          //       succssFile[uploadId][partNumber] = false;
          //       succssFile[uploadId].finished = percentage > 99 ? true : false;
          //       return succssFile;
          //     });
          //     setProgressBar((prev: any) => {
          //       const updatedProgress = { ...prev };
          //       if (!updatedProgress[uploadId]) {
          //         updatedProgress[uploadId] = {};
          //       }
          //       updatedProgress[uploadId][partNumber] = percentage;
          //       updatedProgress[uploadId].total =
          //         updatedProgress[uploadId][partNumber];
          //       return updatedProgress;
          //     });
          //   },
          //   (uploadId, partNumber, speed, duration) => {
          //     setFileSpeeds((prev: any) => {
          //       const updateSpeed = { ...prev };
          //       if (!updateSpeed[uploadId]) {
          //         updateSpeed[uploadId] = {};
          //       }
          //       updateSpeed[uploadId][partNumber] = speed;
          //       updateSpeed[uploadId].total = updateSpeed[uploadId][partNumber];
          //       return updateSpeed;
          //     });
          //     setFileTimes((prev: any) => {
          //       const updatedTimes = { ...prev };
          //       if (!updatedTimes[uploadId]) {
          //         updatedTimes[uploadId] = {};
          //       }
          //       updatedTimes[uploadId][partNumber] = duration;
          //       updatedTimes[uploadId].total =
          //         updatedTimes[uploadId][partNumber];
          //       return updatedTimes;
          //     });
          //   },
          // );
          // if (run.message == "success") {
          //   item.push(run.data);
          // }

          const { request, promise } = await startTransactionV1(
            targetList[i][j],
            startDate,
            (uploadId, partNumber, percentage) => {
              setPresignSuccesFiles((prev: any) => {
                const succssFile = { ...prev };
                if (!succssFile[uploadId]) {
                  succssFile[uploadId] = {};
                }
                succssFile[uploadId][partNumber] = false;
                succssFile[uploadId].finished = percentage > 99 ? true : false;
                return succssFile;
              });
              setProgressBar((prev: any) => {
                const updatedProgress = { ...prev };
                if (!updatedProgress[uploadId]) {
                  updatedProgress[uploadId] = {};
                }
                updatedProgress[uploadId][partNumber] = percentage;
                updatedProgress[uploadId].total =
                  updatedProgress[uploadId][partNumber];
                return updatedProgress;
              });
            },
            (uploadId, partNumber, speed, duration) => {
              setFileSpeeds((prev: any) => {
                const updateSpeed = { ...prev };
                if (!updateSpeed[uploadId]) {
                  updateSpeed[uploadId] = {};
                }
                updateSpeed[uploadId][partNumber] = speed;
                updateSpeed[uploadId].total = updateSpeed[uploadId][partNumber];
                return updateSpeed;
              });
              setFileTimes((prev: any) => {
                const updatedTimes = { ...prev };
                if (!updatedTimes[uploadId]) {
                  updatedTimes[uploadId] = {};
                }
                updatedTimes[uploadId][partNumber] = duration;
                updatedTimes[uploadId].total =
                  updatedTimes[uploadId][partNumber];
                return updatedTimes;
              });
            },
          );

          const run = await promise;
          if (run.message === "success") {
            item.push(run.data);

            setRequestMap(
              (prevMap) =>
                new Map(prevMap.set(targetList[i][j].uploadId, request)),
            );
          }
        }

        myparts.push(item);
      }

      partsData.push(...myparts);

      // # complete all transaction
      await endTransaction(partsData, tagList);

      await eventUploadTrigger?.trigger();
      setCanClose(false);
      setHideSelectMore(2);
    } catch (error) {
      console.error(error);
      setCanClose(false);
      setHideSelectMore(0);
      const message = cutSpaceError(error.message);
      if (message) {
        errorMessage("Your space isn't enough", 3000);
      } else {
        handleErrorFiles(error);
      }
    }
  };

  const handleUploadToInternalServerV2 = async (fileData: Array<any>) => {
    setHideSelectMore(1);
    setCanClose(true);
    setStartUpload(false);
    const filesArray: any[] = Array.from(fileData);

    try {
      const fileStateEntries = await Promise.all(
        filesArray.map(async (file, index) => {
          const dataFile = file;
          const randomName = Math.floor(111111111 + Math.random() * 999999999);
          let path = "";
          let newFilePath = "";

          if (folderId > 0) {
            const queryfolderPath = await queryPath({
              variables: {
                where: {
                  _id: folderId,
                  createdBy: user?._id,
                },
              },
            });

            const newPath = queryfolderPath?.data?.folders?.data[0]?.newPath;
            if (newPath) {
              path = newPath;
              newFilePath =
                newPath + "/" + randomName + getFileNameExtension(file.name);
            }
          }
          const pathBunny = user?.newName + "-" + user?._id + "/" + path;

          const newName = String(
            randomName + getFileNameExtension(dataFile.name),
          );
          dataFile.createdBy = user._id;
          dataFile.newFilename = newName;
          dataFile.path = pathBunny;
          dataFile.newPath = newFilePath;

          const uploading = await uploadFiles({
            variables: {
              data: {
                destination: "",
                newFilename: randomName + getFileNameExtension(dataFile.name),
                filename: dataFile.name,
                fileType: dataFile.type,
                size: dataFile.size.toString(),
                checkFile: folderId > 0 ? "sub" : "main",
                ...(folderId > 0 ? { folder_id: folderId } : {}),
                ...(folderId > 0 ? { newPath: newFilePath } : {}),
                country: country,
                device: result.os.name || "" + result.os.version || "",
                totalUploadFile: filesArray.length,
              },
            },
          });

          const fileId = await uploading.data?.createFiles?._id;
          if (fileId) {
            await handleActionFile(fileId);
            const initiatedUpload = await initiateUpload(index, dataFile);

            return initiatedUpload || {};
          } else {
            throw new Error("Uploading failed");
          }
        }),
      );

      const newFileStates = fileStateEntries.reduce(
        (acc, entry) => ({
          ...acc,
          entry,
        }),
        {},
      );

      console.log({ newFileStates });
      // setFileStates(newFileStates);
      // setStartUpload(true);
    } catch (error) {
      errorMessage(error, 3000);
    }
  };

  const initiateUpload = async (fileIndex: number, file: File | any) => {
    try {
      const headers = {
        createdBy: file.createdBy,
        newFilename: file.newFilename,
        PATH: file.path,
      };

      const _encryptHeader = encryptData(headers);
      // await encryptHeader(file.newFilename);
      const initiateResponse = await fetch(
        `${ENV_KEYS.VITE_APP_LOAD_URL}initiate-multipart-upload`,
        {
          method: "POST",
          headers: {
            encryptedheaders: _encryptHeader!,
          },
        },
      );

      if (!initiateResponse.ok) {
        throw new Error(
          `Error initiating multipart upload: ${await initiateResponse.text()}`,
        );
      }

      const data = await initiateResponse.json();
      const uploadId = data.uploadId;

      return {
        [fileIndex]: {
          file,
          uploadId,
          parts: [],
          retryParts: [],
          uploadFinished: false,
          progress: 0,
          startTime: Date.now(),
          timeElapsed: "",
        },
      };
    } catch (error: any) {
      console.error("Error initiating upload:", error);
      alert(`Error initiating upload: ${error.message}`);
    }
  };

  const uploadFileParts = async (fileIndex: number, file: File) => {
    const numParts = Math.ceil(file.size / chunkSize);

    for (let partNumber = 1; partNumber <= numParts; partNumber++) {
      const start = (partNumber - 1) * chunkSize;
      const end = Math.min(start + chunkSize, file.size);
      const blob = file.slice(start, end);

      try {
        await uploadPart(fileIndex, partNumber, blob);
      } catch (error) {
        console.error(`Error uploading part ${partNumber}:`, error);
        setFileStates((prev) => ({
          ...prev,
          [fileIndex]: {
            ...prev[fileIndex],
            retryParts: [
              ...prev[fileIndex].retryParts,
              { partNumber, start, end },
            ],
          },
        }));
      }
    }

    setFileStates((prev) => ({
      ...prev,
      [fileIndex]: { ...prev[fileIndex], uploadFinished: true },
    }));
  };

  const uploadPart = async (
    fileIndex: number,
    partNumber: number,
    blob: Blob,
  ) => {
    const { uploadId, file } = fileStates[fileIndex];
    const numParts = Math.ceil(file.size / chunkSize);
    const formData = new FormData();
    formData.append("partNumber", partNumber.toString());
    formData.append("uploadId", uploadId);

    const headers = {
      createdBy: user?._id,
      PATH: file.path,
      FILENAME: file.newFilename,
    };
    const _encryptHeader = await encryptData(headers);
    const presignedResponse = await fetch(
      `${ENV_KEYS.VITE_APP_LOAD_URL}generate-presigned-url`,
      {
        method: "POST",
        headers: {
          encryptedheaders: _encryptHeader!,
        },
        body: formData,
      },
    );

    if (!presignedResponse.ok) {
      throw new Error(
        `Error generating presigned URL for part ${partNumber}: ${await presignedResponse.text()}`,
      );
    }

    const { url } = await presignedResponse.json();

    return new Promise<void>((resolve, reject) => {
      console.log({ partNumber });
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", url, true);
      xhr.setRequestHeader("Content-Type", blob.type);

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          setFileStates((prev) => ({
            ...prev,
            [fileIndex]: {
              ...prev[fileIndex],
              parts: [
                ...prev[fileIndex].parts,
                { ETag: xhr.getResponseHeader("ETag"), PartNumber: partNumber },
              ],
            },
          }));
          console.log({ partNumber });
          const percentComplete = Math.round((partNumber * 100) / numParts);
          setFileStates((prev) => ({
            ...prev,
            [fileIndex]: { ...prev[fileIndex], progress: percentComplete },
          }));

          // let allParts: any = [];
          // allParts = [
          //   ...allParts,
          //   { ETag: xhr.getResponseHeader("ETag"), PartNumber: partNumber },
          // ];
          // allParts.push({ ETag: xhr.getResponseHeader('ETag'), PartNumber: partNumber })

          if (percentComplete >= 100) {
            console.log({ fileStates });
            const endTime = Date.now();
            const timeTaken =
              (endTime - fileStates[fileIndex].startTime) / 1000; // time in seconds
            setFileStates((prev) => ({
              ...prev,
              [fileIndex]: {
                ...prev[fileIndex],
                uploadFinished: true,
                timeElapsed: `Upload completed in ${(timeTaken / 60).toFixed(
                  2,
                )} minutes`,
              },
            }));
          }
          setUploadComplete(true);
          resolve();
        } else {
          reject(
            new Error(`Error uploading part ${partNumber}: ${xhr.statusText}`),
          );
        }
      };

      xhr.onerror = () =>
        reject(
          new Error(`Error uploading part ${partNumber}: ${xhr.statusText}`),
        );

      xhr.send(blob);
    });
  };

  const tryCompleteMultipartUpload = async (
    fileIndex: number,
    parts: any,
    uploadId: string,
    file: File | any,
  ) => {
    setUploadComplete(false);
    const formData = new FormData();
    formData.append("parts", JSON.stringify(parts));
    formData.append("uploadId", uploadId);

    const headers = {
      PATH: files,
      FILENAME: file.newFilename,
      createdBy: user?._id,
    };
    const _encryptHeader = encryptData(headers);

    try {
      const completeResponse = await fetch(
        `${ENV_KEYS.VITE_APP_LOAD_URL}complete-multipart-upload`,
        {
          method: "POST",
          headers: {
            encryptedheaders: _encryptHeader!,
          },
          body: formData,
        },
      );

      if (!completeResponse.ok) {
        const errorText = await completeResponse.text();
        throw new Error(`Error completing multipart upload: ${errorText}`);
      }

      // setFileStates((prev) => ({ ...prev, [fileIndex]: { ...prev[fileIndex], parts: [], uploadFinished: false } }));

      const endTime = Date.now();
      const timeTaken = (endTime - fileStates[fileIndex].startTime) / 1000; // time in seconds
      setFileStates((prev) => ({
        ...prev,
        [fileIndex]: {
          ...prev[fileIndex],
          parts: [],
          uploadFinished: false,
          timeElapsed: `Upload completed in ${(timeTaken / 60).toFixed(
            2,
          )} minutes`,
        },
      }));
    } catch (error: any) {
      console.error("Error completing multipart upload:", error);
      // alert(`Error completing multipart upload: ${error.message}`);
    }
  };

  const retryFailedParts = async () => {
    if (!navigator.onLine) return;
    console.log("retry when failed to upload files");
    console.log({ fileStates });

    const promises = Object.keys(fileStates).map(async (fileIndex) => {
      const { retryParts, file } = fileStates[parseInt(fileIndex)];
      console.log("start====1", fileIndex);
      setFileStates((prev) => ({
        ...prev,
        [fileIndex]: { ...prev[parseInt(fileIndex)], retryParts: [] },
      }));

      for (const { partNumber, start, end } of retryParts) {
        const blob = file.slice(start, end);
        try {
          await uploadPart(parseInt(fileIndex), partNumber, blob);
          console.log("start====2", fileIndex);
        } catch (error) {
          console.error(`Error retrying part ${partNumber}: `, error);
          setFileStates((prev) => ({
            ...prev,
            [fileIndex]: {
              ...prev[parseInt(fileIndex)],
              retryParts: [
                ...prev[parseInt(fileIndex)].retryParts,
                { partNumber, start, end },
              ],
            },
          }));
        }
      }
    });

    await Promise.all(promises);
  };

  React.useEffect(() => {
    const startUploads = async () => {
      for (const fileIndex of Object.keys(fileStates)) {
        if (!fileStates[parseInt(fileIndex)]?.uploadFinished) {
          uploadFileParts(
            parseInt(fileIndex),
            fileStates[parseInt(fileIndex)]?.file,
          );
        }
      }
    };
    if (startUploads) {
      startUploads();
    }
  }, [startUplload]);

  React.useEffect(() => {
    const completeFunction = async () => {
      if (Object.values(fileStates).length === files.length) {
        Object.values(fileStates).map(async (fileState, fileIndex) => {
          if (
            fileState?.progress >= 100 &&
            fileState?.retryParts?.length <= 0 &&
            fileState?.parts?.length > 0 &&
            uploadComplete
          ) {
            console.log("start complete:: ", fileIndex, { fileState });
            await tryCompleteMultipartUpload(
              fileIndex,
              [...(fileState?.parts || [])],
              fileState?.uploadId,
              files[fileIndex],
            );
          }
        });
      }
    };
    completeFunction();
  }, [fileStates, uploadComplete]);

  React.useEffect(() => {
    window.addEventListener("online", retryFailedParts);
    window.addEventListener("offline", () =>
      console.log("Network connection lost"),
    );

    return () => {
      window.removeEventListener("online", retryFailedParts);
      window.removeEventListener("offline", () =>
        console.log("Network connection lost"),
      );
    };
  }, [fileStates]);

  const handleCancelPresignUpload = (uploadId: string) => {
    const request = requestMap.get(uploadId);
    if (request) {
      request.abort();
      setRequestMap((prev: any) => {
        const newMap = new Map(prev);
        newPath.delete(uploadId);
        return newMap;
      });
    }
  };

  const handleUploadFolder = async () => {
    setHideFolderSelectMore(1);
    setCanClose(true);
    let successFolderCount = 0;
    try {
      const foldersArray = Array.from(folderData);
      const totalFolders = foldersArray.length;
      for (const key in foldersArray) {
        const files: any = foldersArray[key];
        const folderKey = key.toString();
        let folderStartTime: any = new Date();
        const progressArray = Array(files.length).fill(0);
        let totalBytesUploaded = 0;
        setFolderProgressMap((prev) => ({
          ...prev,
          [folderKey]: 0,
        }));
        setIsHideFolder((prev) => ({
          ...prev,
          [folderKey]: true,
        }));

        const newObjects = files.map((file) => ({
          path: file.webkitRelativePath,
          type: file.type,
          size: file.size.toString(),
        }));

        const folderCancelTokenSource: any = CancelToken.source();
        setFolderCancelTokenSource({
          ...folderCancelTokenSource,
          [folderKey]: folderCancelTokenSource,
        });

        try {
          const folderUpload = await uplodFolder({
            variables: {
              data: {
                checkFolder: folderId > 0 ? "sub" : "main",
                pathFolder: newObjects,
                ...(folderId > 0 ? { parentkey: folderId } : {}),
                folder_type: "folder",
              },
              cancelToken: folderCancelTokenSource.token,
              destination: "",
            },
          });

          if (folderUpload?.data?.uploadFolder.status === 200) {
            setUploadingId(folderUpload?.data?.uploadFolder._id);
            const arrayPath = folderUpload?.data?.uploadFolder.path;

            if (arrayPath && arrayPath.length > 0) {
              await Promise.all(
                arrayPath.map(async (path, index) => {
                  const file = files[index];
                  const blob = new Blob([file], {
                    type: file.type,
                  });
                  const newFile = new File([blob], file.name, {
                    type: file.type,
                  });

                  const lastIndex = path.newPath?.lastIndexOf("/");
                  const resultPath = path.newPath?.substring(0, lastIndex);
                  const resultFileName = path?.newPath?.substring(lastIndex);

                  const secretKey = ENV_KEYS.VITE_APP_UPLOAD_SECRET_KEY;
                  const headers = {
                    createdBy: user?._id,
                    PATH: user?.newName + "-" + user?._id + "/" + resultPath,
                    FILENAME: resultFileName?.substring(1),
                  };

                  const key = CryptoJS.enc.Utf8.parse(secretKey);
                  const iv = CryptoJS.lib.WordArray.random(16);
                  const encrypted = CryptoJS.AES.encrypt(
                    JSON.stringify(headers),
                    key,
                    {
                      iv: iv,
                      mode: CryptoJS.mode.CBC,
                      padding: CryptoJS.pad.Pkcs7,
                    },
                  );
                  const cipherText = encrypted.ciphertext.toString(
                    CryptoJS.enc.Base64,
                  );
                  const ivText = iv.toString(CryptoJS.enc.Base64);
                  const encryptedData = cipherText + ":" + ivText;

                  const formData = new FormData();
                  formData.append("file", newFile);

                  const source = folderCancelTokenSource;
                  const options = {
                    method: "POST",
                    url: LOAD_UPLOAD_URL,
                    headers: {
                      "Content-Type": "application/octet-stream",
                      encryptedHeaders: encryptedData,
                    },
                    data: formData,
                    onUploadProgress: function (progressEvent) {
                      const bytesUploaded = progressEvent.loaded;
                      totalBytesUploaded += bytesUploaded;

                      const folderSpeed = convertBytetoMBandGB(
                        totalBytesUploaded /
                          ((Date.now() - folderStartTime) / 1000),
                      );

                      const folderEndTime = Date.now();
                      const duration = calculateTime(
                        folderEndTime - folderStartTime,
                      );

                      setFolderSpeed((prev) => ({
                        ...prev,
                        [folderKey]: folderSpeed,
                      }));

                      setFolderStartTimeMap((prev) => ({
                        ...prev,
                        [folderKey]: duration,
                      }));

                      if (source.token.reason) {
                        return;
                      }

                      const fileProgress = Math.round(
                        (bytesUploaded * 100) / file.size,
                      );
                      progressArray[index] = fileProgress;

                      const totalProgress = Math.round(
                        progressArray.reduce((acc, p) => acc + p, 0) /
                          progressArray.length,
                      );
                      console.log({ folderKey });
                      setFolderProgressMap((prev) => ({
                        ...prev,
                        [folderKey]: totalProgress,
                      }));
                    },
                    cancelToken: source.token,
                  };

                  await axios.request(options);
                  // coutFileUpload++;
                }),
              );

              successFolderCount++;

              setIsHideFolder((prev) => ({
                ...prev,
                [folderKey]: false,
              }));
              setIsFolderSuccess((prev) => ({
                ...prev,
                [folderKey]: true,
              }));
            }
          }
          await eventUploadTrigger?.trigger();
        } catch (error: any) {
          const message = cutSpaceError(error.message);
          if (error.message === "Error: Your package has been limited") {
            navigate("/pricing");
          } else if (message) {
            errorMessage("Your space isn't enough", 3000);
          } else {
            handleErrorFiles(error);
          }
        } finally {
          folderStartTime = new Date();
          setCanClose(false);
          if (successFolderCount === totalFolders) {
            setHideFolderSelectMore(2);
          }
        }
      }
    } catch (error: any) {
      const cutError = error.message.replace(/(ApolloError: )?Error: /, "");
      if (cutError == "LOGIN_IS_REQUIRED") {
        errorMessage("Your token is expired!!", 3000);
      } else if (
        cutError ==
        "NOT_ENOUGH_SIZE,SPACEPACKAGE:ຄວາມຈຸຂອງUSER, TOTALSIZEALL:ຄວາມຈຸທີ່USERໃຊ້,SIZENOW:ຄວາມຈຸປັດຈຸບັນ"
      ) {
        errorMessage(
          "Your space is not enough. Please upgrade to pro package",
          3000,
        );
      } else {
        errorMessage("Something went wrong, please try again later!", 3000);
      }
    } finally {
      // setHideFolderSelectMore(0);
      setHideSelectMore(2);
      setCanClose(false);
    }
  };

  const handleCloseModal = () => {
    setHideSelectMore(0);
    setUploads([]);
    onClose();
    onRemoveAll();
    handleUploadDone();
    setFileProgress({});
    setIsSuccess(false);
    setIsHide(false);
    setIsFolderSuccess(false);
    setFolderProgressMap({});
    setFileSpeeds([]);
    setFileTimes([]);
    setCancelStatus(false);
    setCancelFolderStatus(false);
    setHideFolderSelectMore(0);
    setFolderSpeed({});
    setFolderStartTimeMap({});
    setFolderProgressMap({});
    setProgressBar({});
  };

  const handleWarningMessage = () => {
    warningMessage("Please wait until upload done!", 2000);
  };

  const handleSelectMore = () => {
    onSelectMore();
  };

  const handleActionFile = async (id) => {
    try {
      await actionFile({
        variables: {
          fileInput: {
            createdBy: parseInt(user?._id),
            fileId: parseInt(id),
            actionStatus: "upload",
          },
        },
      });
    } catch (error) {
      console.error(error);
      errorMessage("You action file wrong", 2000);
    }
  };

  const mobileScreen = useMediaQuery(theme.breakpoints.down("md"));

  function LinearProgressWithLabel(props) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box sx={{ width: "100%", mr: 1 }}>
          <LinearProgress variant="determinate" {...props} />
        </Box>
        <Box sx={{ minWidth: 35 }}>
          <Typography color="text.secondary">{`${Math.round(
            props.value,
          )}%`}</Typography>
        </Box>
      </Box>
    );
  }

  function handleErrorFiles(msgError) {
    const error = msgError.message.replace(/(ApolloError: )?Error: /, "");
    let packageUpload = 0;
    packageUpload = parseInt(userAuth?.packageId?.numberOfFileUpload || 0);

    if (error === "LOGIN_IS_REQUIRED") {
      errorMessage("Please login again", 3000);
    } else if (error === "FOLDER_ID_IS_NOT_NULL") {
      errorMessage("Folder is not found", 3000);
    } else if (error.includes("UPLOAD_MORE_THAN")) {
      errorMessage(
        `You can't upload up to ${packageUpload} files at time. Please try again`,
        3000,
      );
    } else if (error === "TOTALUPLOADFILE_IS_NOT_UNDEFINED") {
      errorMessage("Upload file total is missing", 3000);
    } else if (error === "FILE_MAIN_FOLDER_ID_NOT_ZERO") {
      errorMessage("Main folder is not empty", 3000);
    } else {
      errorMessage(error, 3000);
    }
  }

  const { isDragActive } = useDropzone();

  return (
    <React.Fragment>
      <Dialog
        onClose={canClose ? () => {} : handleCloseModal}
        open={open}
        fullWidth
        maxWidth="sm"
      >
        <Box
          sx={{ textAlign: "center", padding: "1.5rem 0.5rem 0.5rem 0.5rem" }}
        >
          <Typography
            variant="h5"
            sx={{
              color: "#5D586C",
              [theme.breakpoints.down("sm")]: {
                fontSize: "0.9rem",
                fontWeight: 400,
              },
            }}
          >
            Upload, Drag and drop your files here to upload
          </Typography>
        </Box>
        <DialogContent
          style={{
            padding: "0",
          }}
        >
          <Box
            sx={{
              padding: "0.5rem 1.5rem 2rem 1.5rem",
              [theme.breakpoints.down("sm")]: {
                padding: "0.5rem",
              },
            }}
          >
            <Box>
              {hideSelectMore == 1 || hideFolderSelectMore == 1 ? (
                <Box
                  sx={{
                    border: "2px dashed #5D9F97",
                    borderRadius: "10px",
                    padding: "1rem 0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "column",
                    cursor: "pointer",
                  }}
                >
                  <CircularProgress size={mobileScreen ? 20 : 40} />
                  <Typography
                    variant="h3"
                    sx={{
                      margin: "0.2rem",
                      fontSize: "1.125rem",
                      mt: 3,
                      color: "#17766B",
                      [theme.breakpoints.down("sm")]: {
                        fontSize: "0.9rem",
                        fontWeight: 600,
                      },
                    }}
                  >
                    Uploading....
                  </Typography>
                </Box>
              ) : hideSelectMore == 2 || hideFolderSelectMore == 2 ? (
                <Box
                  sx={{
                    border: "2px dashed #5D9F97",
                    borderRadius: "10px",
                    padding: "1rem 0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "column",
                    cursor: "pointer",
                  }}
                >
                  <CheckCircleOutlineIcon
                    sx={{
                      color: "#17766B",
                      fontSize: "3rem",
                      [theme.breakpoints.down("sm")]: {
                        fontSize: "2rem",
                      },
                    }}
                  />
                  <Typography
                    variant="h3"
                    sx={{
                      margin: "0.2rem",
                      fontSize: "1.125rem",
                      color: "#17766B",
                      mt: 3,
                      [theme.breakpoints.down("sm")]: {
                        fontSize: "0.9rem",
                        fontWeight: 600,
                      },
                    }}
                  >
                    Files upload successfully!
                  </Typography>
                </Box>
              ) : (
                <Box
                  onClick={
                    parentComponent == "clientDashboard"
                      ? () => {}
                      : handleSelectMore
                  }
                >
                  <Tooltip
                    title={
                      parentComponent == "clientDashboard"
                        ? "Drag and drop files here"
                        : "Double click for select more"
                    }
                    placement="top"
                    followCursor
                  >
                    <Box
                      sx={{
                        border: "2px dashed #5D9F97",
                        borderRadius: "10px",
                        padding: "0 0 1rem 0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexDirection: "column",
                        cursor: "pointer",
                        background:
                          isDragActive && parentComponent == "clientDashboard"
                            ? "#5D9F97"
                            : "#ffffff",
                      }}
                      // {...(parentComponent !== "floating_button" &&
                      //   getRootProps())}
                    >
                      <img src={fileLogo} alt="file icon" />
                      {isDragActive && parentComponent == "clientDashboard" ? (
                        <Typography
                          variant="h6"
                          sx={{
                            margin: "0.1rem",
                            fontSize: "1rem",
                            color:
                              isDragActive &&
                              parentComponent == "clientDashboard"
                                ? "#ffffff"
                                : "#000000",
                            [theme.breakpoints.down("sm")]: {
                              fontSize: "0.7rem",
                            },
                          }}
                        >
                          Drop your files right here to upload!11
                        </Typography>
                      ) : (
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            [theme.breakpoints.down("sm")]: {
                              flexDirection: "column",
                            },
                          }}
                        >
                          {parentComponent == "clientDashboard" ? (
                            <Typography
                              variant="h3"
                              sx={{
                                margin: "0.2rem",
                                fontSize: "1.125rem",
                                [theme.breakpoints.down("sm")]: {
                                  fontSize: "0.9rem",
                                },
                                color:
                                  isDragActive &&
                                  parentComponent == "clientDashboard"
                                    ? "#ffffff"
                                    : "#17766B",
                              }}
                            >
                              Drop your files right here to upload!
                            </Typography>
                          ) : (
                            <Typography
                              variant="h3"
                              sx={{
                                margin: "0.2rem",
                                fontSize: "1.125rem",
                                [theme.breakpoints.down("sm")]: {
                                  fontSize: "0.9rem",
                                },
                                color:
                                  isDragActive &&
                                  parentComponent == "clientDashboard"
                                    ? "#ffffff"
                                    : "#17766B",
                              }}
                            >
                              Double click to&nbsp;
                              <strong
                                style={{
                                  color:
                                    isDragActive &&
                                    parentComponent == "clientDashboard"
                                      ? "#ffffff"
                                      : "#17766B",
                                }}
                              >
                                select more
                              </strong>
                            </Typography>
                          )}

                          <Typography
                            variant="h6"
                            sx={{
                              margin: "0.1rem",
                              fontSize: "1rem",
                              color:
                                isDragActive &&
                                parentComponent == "clientDashboard"
                                  ? "#ffffff"
                                  : "#000000",
                              [theme.breakpoints.down("sm")]: {
                                fontSize: "0.7rem",
                              },
                            }}
                          >
                            Max file size 50 MB
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Tooltip>
                </Box>
              )}
            </Box>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
              }}
            >
              {Array.from(folderNames)?.map((val, index) => {
                return (
                  <MUI.ShowFileUploadBox key={index}>
                    <MUI.ShowFileDetailBox>
                      <MUI.ShowNameAndProgress>
                        <Typography variant="h5">
                          {mobileScreen
                            ? limitContent(val, 15)
                            : limitContent(val, 25)}
                        </Typography>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "start",
                            justifyContent: "start",
                            marginTop: "0.3rem",
                          }}
                        >
                          <Typography
                            variant="h6"
                            sx={{
                              borderRight: "1px solid #817D8D",
                              paddingRight: "0.5rem",
                              marginRight: "0.5rem",
                            }}
                          >
                            Time:&nbsp;
                            {folderStartTimeMap[index]
                              ? folderStartTimeMap[index]
                              : 0}
                          </Typography>
                          <Typography variant="h6">
                            Speed:&nbsp;
                            {folderSpeed[index] ? folderSpeed[index] : 0}
                          </Typography>
                        </Box>
                      </MUI.ShowNameAndProgress>
                      <MUI.ShowActionButtonBox>
                        {cancelFolderStatus[index] ? (
                          <Chip
                            label="Cancled"
                            color="error"
                            variant="outlined"
                          />
                        ) : isFolderSuccess[index] ? (
                          <IconButton sx={{ background: "#EEFBF3" }}>
                            <DownloadDoneIcon sx={{ color: "#17766B" }} />
                          </IconButton>
                        ) : (
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-around",
                            }}
                          >
                            {isHideFolder[index] &&
                              folderProgressMap[index] < 100 && (
                                <Tooltip
                                  title="Cancel upload"
                                  placement="top"
                                  followCursor
                                >
                                  <IconButton
                                    onClick={() =>
                                      handleCancelUploadFolder(index)
                                    }
                                  >
                                    <HighlightOffIcon
                                      sx={{
                                        color: "#555555",
                                        cursor: "pointer",
                                      }}
                                    />
                                  </IconButton>
                                </Tooltip>
                              )}
                            {!isHideFolder[index] && (
                              <Tooltip
                                title={"Delete" + " " + val}
                                placement="top"
                                followCursor
                              >
                                <IconButton
                                  onClick={() =>
                                    handleUploadCancel(index, "folder")
                                  }
                                >
                                  <DeleteForeverIcon
                                    sx={{ color: "#D93025" }}
                                  />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Box>
                        )}
                      </MUI.ShowActionButtonBox>
                    </MUI.ShowFileDetailBox>
                    {cancelFolderStatus[index] ? (
                      ""
                    ) : (
                      <Box sx={{ width: "100%", marginTop: "0.5rem" }}>
                        <LinearProgressWithLabel
                          variant="determinate"
                          value={
                            !folderProgressMap[index]
                              ? 0
                              : folderProgressMap[index]
                          }
                          sx={{ borderRadius: "5px", height: "5px" }}
                        />
                      </Box>
                    )}
                  </MUI.ShowFileUploadBox>
                );
              })}

              {files?.map((val, index) => {
                const progress = fileProgress[index] || 0;
                const upload = uploads.find(
                  (upload) => upload?.file?.name === val.name,
                );

                const isFilePresignedSuccess = upload
                  ? presignSuccesFiles[upload.uploadId]?.finished || false
                  : false;
                const progressTab = upload
                  ? progressBar[upload.uploadId]?.total || 0
                  : 0;
                const timeTab = upload ? fileTimes[upload.uploadId]?.total : 0;
                const speedTab = upload
                  ? fileSpeeds[upload.uploadId]?.total
                  : 0;

                return (
                  <MUI.ShowFileUploadBox key={index}>
                    <MUI.ShowFileDetailBox>
                      <MUI.ShowNameAndProgress>
                        <Typography variant="h5">
                          {mobileScreen
                            ? limitContent(val.name, 15)
                            : limitContent(val.name, 25)}
                          &nbsp;
                          <span
                            style={{ color: "#17766B", fontSize: "0.7rem" }}
                          >
                            ({convertBytetoMBandGB(val.size)})
                          </span>
                        </Typography>
                        {cancelStatus[index] ? (
                          ""
                        ) : (
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "start",
                              justifyContent: "start",
                              marginTop: "0.3rem",
                            }}
                          >
                            <Typography
                              variant="h6"
                              sx={{
                                borderRight: "1px solid #817D8D",
                                paddingRight: "0.5rem",
                                marginRight: "0.5rem",
                              }}
                            >
                              Time:&nbsp;
                              {/* {fileTimes[index] ? fileTimes[index] : 0} */}
                              {timeTab || 0}
                            </Typography>
                            <Typography variant="h6">
                              Speed:&nbsp;
                              {/* {fileSpeeds[index] ? fileSpeeds[index] : 0} */}
                              {speedTab || 0}
                            </Typography>
                          </Box>
                        )}
                      </MUI.ShowNameAndProgress>
                      <MUI.ShowActionButtonBox>
                        {cancelStatus[index] ? (
                          <Chip
                            label="Cancled"
                            color="error"
                            variant="outlined"
                          />
                        ) : isFilePresignedSuccess ? (
                          <IconButton sx={{ background: "#EEFBF3" }}>
                            <DownloadDoneIcon sx={{ color: "#17766B" }} />
                          </IconButton>
                        ) : (
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-around",
                            }}
                          >
                            {isHide[index] && progress < 100 && (
                              <Tooltip
                                title="Cancel upload"
                                placement="top"
                                followCursor
                              >
                                <IconButton
                                  // onClick={() => handleCancleUploadFile(index)}
                                  onClick={() =>
                                    handleCancelPresignUpload(upload?.uploadId)
                                  }
                                >
                                  <HighlightOffIcon
                                    sx={{
                                      color: "#555555",
                                      cursor: "pointer",
                                    }}
                                  />
                                </IconButton>
                              </Tooltip>
                            )}
                            {!isHide[index] && (
                              <Tooltip
                                title="Delete File"
                                placement="top"
                                followCursor
                              >
                                <IconButton
                                  onClick={() =>
                                    handleUploadCancel(index, "file")
                                  }
                                >
                                  <DeleteForeverIcon
                                    sx={{ color: "#D93025" }}
                                  />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Box>
                        )}
                      </MUI.ShowActionButtonBox>
                    </MUI.ShowFileDetailBox>
                    {cancelStatus[index] ? (
                      ""
                    ) : (
                      <Box
                        sx={{
                          width: "100%",
                          marginTop: "0.5rem",
                        }}
                      >
                        <LinearProgressWithLabel
                          variant="determinate"
                          value={progressTab}
                          sx={{ borderRadius: "5px", height: "5px" }}
                        />
                      </Box>
                    )}
                  </MUI.ShowFileUploadBox>
                );
              })}
            </Box>
            <Button
              color="error"
              variant="contained"
              sx={{
                marginTop: "1rem",
                background: "#EB5F60",
                color: "#ffffff",
                fontWeight: "bold",
                "&:hover": {
                  color: "#ffffff",
                  background: "#EB5F60",
                },
              }}
              onClick={canClose ? handleWarningMessage : handleCloseModal}
              size={mobileScreen ? "small" : "medium"}
            >
              Close
            </Button>
            &nbsp;&nbsp;
            <Button
              onClick={() => {
                if (folderData?.length > 0 && data?.length > 0) {
                  handleUploadFolder();
                  handleUploadToInternalServer(data);
                } else if (data?.length > 0 && folderData?.length === 0) {
                  // handleUploadToInternalServer(data);
                  handleUploadToInternalServerV1(data);
                  // handleUploadToInternalServerV2(data);
                } else if (data?.length === 0 && folderData?.length > 0) {
                  handleUploadFolder();
                }
              }}
              variant="contained"
              sx={{ marginTop: "1rem" }}
              disabled={
                hideSelectMore != 0 || hideFolderSelectMore != 0 ? true : false
              }
              size={mobileScreen ? "small" : "medium"}
            >
              Upload Now
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </React.Fragment>
  );
}
