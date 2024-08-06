import axios from "axios";
import { ENV_KEYS } from "constants/env.constant";
import CryptoJS from "crypto-js";
import * as uuid from "uuid";

const baseURL = ENV_KEYS.VITE_APP_LOAD_URL;
const chunkSize = 50 * 1024 * 1024; // 100MB

export const encryptHeader = (
  newName?: string,
  createdBy?: string,
  pathBunny?: string,
) => {
  // PATH: string,
  // FILENAME: string,
  // CREATEDBY: string,

  //   const auth = {
  //     createdBy,
  //     PATH: "hell",
  //     FILENAME: filename,
  //   };
  const auth = {
    createdBy,
    PATH: pathBunny,
    FILENAME: newName,
  };

  try {
    const secretKey = ENV_KEYS.VITE_APP_UPLOAD_SECRET_KEY;
    const key = CryptoJS.enc.Utf8.parse(secretKey);
    const iv = CryptoJS.lib.WordArray.random(16);
    const encrypted = CryptoJS.AES.encrypt(JSON.stringify(auth), key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });
    const cipherText = encrypted.ciphertext.toString(CryptoJS.enc.Base64);
    const ivText = iv.toString(CryptoJS.enc.Base64);
    const encryptedData = cipherText + ":" + ivText;
    return encryptedData;
  } catch (error) {
    console.error("Error encrypting header:", error);
    return null;
  }
};

export function getTag(file: any): Promise<any> {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise<any>(async (resolve, reject) => {
    try {
      const url = `${baseURL}initiate-multipart-upload`;

      // const uploadIdList: any = [];
      const fileName = file.newName;
      const headers = {
        encryptedheaders: encryptHeader(fileName, file.createdBy, file?.path),
      };
      const options = {
        headers,
        method: `POST`,
        url: url,
      };

      const run = await axios<{ uploadId?: string }>(options);
      const uploadId = await run.data?.uploadId;

      resolve(uploadId);
    } catch (error: any) {
      console.log(`error complete get tag`, error.message);
      reject(error.message);
    }
  });
}

export function getTarget(uploads: Array<any>): Promise<any> {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise<any>(async (resolve, reject) => {
    try {
      const url = `${baseURL}generate-presigned-url`;
      const targetList: any = [];

      for (let i = 0; i < uploads.length; i++) {
        const file = uploads[i].file;
        const numParts = Math.ceil(file.size / chunkSize);
        const item: any[] = [];

        for (let partNumber = 1; partNumber <= numParts; partNumber++) {
          const start = (partNumber - 1) * chunkSize;
          const end = Math.min(start + chunkSize, file.size);
          const blob = file.slice(start, end);

          try {
            const formData = new FormData();
            formData.append("partNumber", partNumber.toString());
            formData.append("uploadId", uploads[i].uploadId);

            const fileName = file.newName;
            const headers = {
              encryptedheaders: encryptHeader(
                fileName,
                file.createdBy,
                file.path,
              ),
            };
            const options = {
              method: `POST`,
              url: url,
              headers: headers,
              data: formData,
            };
            const run = await axios(options);
            const target = await run.data.url;

            const model: any = {
              file,
              target,
              uploadId: uploads[i].uploadId,
              partNumber: partNumber,
              blob,
              fileType: uploads[i].file.type,
              uuid: uuid.v4(),
              size: file.size,
            };
            item.push(model);
          } catch (error: any) {
            console.error(`Error uploading part ${partNumber}:`, error);
          }
        }
        targetList.push(item);
      }

      resolve(targetList);
    } catch (error: any) {
      console.log(`error complete get target`, error.message);
      reject(error.message);
    }
  });
}

export function startTransaction(
  target: any,
  // handleProgress?: (uploadId: any, partNumber: any, percentage: number) => void,
): Promise<any> {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise<any>(async (resolve, reject) => {
    try {
      console.log(`my target`, target);
      // let percentComplete = 0;
      const request = new XMLHttpRequest();
      request.open("PUT", target.target, true);
      request.setRequestHeader("Content-Type", target.fileType);
      // request.upload.onprogress = (event) => {
      //   if (event.lengthComputable) {
      //     percentComplete = Math.round(
      //       ((event.loaded + (target.partNumber - 1) * chunkSize) * 100) /
      //         target.size,
      //     );
      //     console.log({ percentComplete });
      //     handleProgress?.(target.uploadId, target.partNumber, percentComplete);
      //   }
      // };
      request.onreadystatechange = function () {
        if (request.readyState === 4 && request.status === 200) {
          const model = {
            ETag: request.getResponseHeader("ETag"),
            PartNumber: target.partNumber,
          };

          const response = {
            data: model,
            message: "success",
          };
          resolve(response);
          if (request.getResponseHeader("ETag")) {
            //
          }
        }
      };
      request.send(target.blob);
    } catch (error: any) {
      console.log(`error start transaction`, error.message);
      reject(error.message);
    }
  });
}

export function endTransaction(
  parts: Array<any>,
  uploads: Array<any>,
): Promise<any> {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise<any>(async (resolve, reject) => {
    try {
      const url = `${baseURL}complete-multipart-upload`;
      for (let i = 0; i < uploads.length; i++) {
        const file = uploads[i].file;
        const fileName = file.newName;
        const headers = {
          encryptedheaders: encryptHeader(fileName, file.createdBy, file?.path),
        };
        const formData = new FormData();
        formData.append("parts", JSON.stringify(parts[i]));
        formData.append("uploadId", uploads[i]?.uploadId);
        const options = {
          method: `POST`,
          url: url,
          headers: headers,
          data: formData,
        };
        await axios(options);
      }

      console.log(`===== complete end transaction =====`);
      resolve("success");
    } catch (error: any) {
      // console.log({ uploads });
      console.log(`error end transaction`, error.message);
      reject(error.message);
    }
  });
}
