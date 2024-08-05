import axios from "axios";
import { ENV_KEYS } from "constants/env.constant";
import CryptoJS from "crypto-js";
import * as uuid from "uuid";

const baseURL = ENV_KEYS.VITE_APP_LOAD_URL;
const chunkSize = 10 * 1024 * 1024; // 10MB

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
      console.log({ file });
      const url = `${baseURL}initiate-multipart-upload`;

      const uploadIdList: any = [];
      const fileName = file.newName;
      const headers = {
        encryptedheaders: encryptHeader(fileName, file.createdBy, file?.path),
      };
      const options = {
        method: `POST`,
        url: url,
        headers: headers,
      };
      const run = await axios(options);

      uploadIdList.push({
        file,
        name: file.name,
        newName: fileName,
        uploadId: run.data.uploadId,
        size: file.size,
        path: file.path,
      });
      console.log(`complete get tag`);

      resolve(uploadIdList);
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
        const numParts = Math.ceil(uploads[i].size / chunkSize);

        for (let partNumber = 1; partNumber <= numParts; partNumber++) {
          const start = (partNumber - 1) * chunkSize;
          const end = Math.min(start + chunkSize, uploads[i].size);
          const blob = uploads[i].file.slice(start, end);

          try {
            const formData = new FormData();
            formData.append("partNumber", partNumber.toString());
            formData.append("uploadId", uploads[i].uploadId);

            const fileName = uploads[i].name;
            const headers = {
              encryptedheaders: encryptHeader(fileName, "633"),
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
              uploadId: uploads[i].uploadId,
              target: target,
              partNumber: partNumber,
              blob: blob,
              fileType: uploads[i].file.type,
              uuid: uuid.v4(),
              size: uploads[i].size,
            };
            targetList.push(model);
          } catch (error: any) {
            console.error(`Error uploading part ${partNumber}:`, error);
          }
        }
      }

      // console.log(`targetList`, targetList);
      console.log(`===== complete get target =====`);
      resolve(targetList);
    } catch (error: any) {
      console.log(`error complete get target`, error.message);
      reject(error.message);
    }
  });
}

export function startTransaction(
  target: any,
  handleProgress?: (uploadId: any, partNumber: any, percentage: number) => void,
): Promise<any> {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise<any>(async (resolve, reject) => {
    try {
      // let request = [];
      // let parts = [];
      let percentComplete = 0;
      const request = new XMLHttpRequest();
      request.open("PUT", target.target, true);
      request.setRequestHeader("Content-Type", target.fileType);
      request.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          percentComplete = Math.round(
            ((event.loaded + (target.partNumber - 1) * chunkSize) * 100) /
              target.size,
          );
          // handleProgress(percentComplete);
          handleProgress?.(target.uploadId, target.partNumber, percentComplete);
        }
      };
      request.onreadystatechange = function () {
        // console.log(`change`, request);
        if (request.readyState === 4 && request.status === 200) {
          const model = {
            ETag: request.getResponseHeader("ETag"),
            PartNumber: target.partNumber,
          };

          if (request.getResponseHeader("ETag")) {
            const response = {
              data: model,
              message: "success",
            };
            resolve(response);
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
        const fileName = uploads?.[i]?.name;
        const headers = {
          encryptedheaders: encryptHeader(fileName, "633"),
        };
        const formData = new FormData();
        formData.append("parts", JSON.stringify([parts[i]]));
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
