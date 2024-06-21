import IconReply from "@mui/icons-material/Reply";
import { Box, CircularProgress, IconButton, Typography } from "@mui/material";
import { ENV_KEYS } from "constants/env.constant";
import CryptoJS from "crypto-js";
import heEntry from "he";
import { useEffect, useRef, useState } from "react";
import { FileIcon, defaultStyles } from "react-file-icon";
import { useDispatch } from "react-redux";
import { setChatMessage } from "stores/features/chatSlice";
import { getTimeLineChat } from "utils/date.util";
import { getFileType } from "utils/file.util";
import * as MUI from "./styles/chat.style";

function ReplyPanel(props) {
  const { chat, ticketStatus } = props;
  const [progress, setProgress] = useState({
    id: "",
    percentage: 0,
  });
  const dispatch = useDispatch();
  const messagesEndRef = useRef<any>(null);

  const { VITE_APP_DOWNLOAD_URL, VITE_APP_STORAGE_ZONE } = ENV_KEYS;
  const SECRET_KEY = ENV_KEYS.VITE_APP_UPLOAD_SECRET_KEY;

  const bunnyDownloadURL = VITE_APP_DOWNLOAD_URL;
  const storageZone = VITE_APP_STORAGE_ZONE;
  const bunnyKey = ENV_KEYS.VITE_APP_ACCESSKEY_BUNNY;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollTo(0, 0);
    // messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleReply = (chat) => {
    dispatch(setChatMessage(chat));
  };

  async function onDownloadFile(chat, file) {
    try {
      const user = chat?.createdByCustomer?._id
        ? chat?.createdByCustomer
        : chat?.createdByStaff;

      const headers = {
        accept: "*/*",
        storageZoneName: storageZone,
        isFolder: false,
        path: user?.newName + "-" + user?._id + "/" + file?.newNameImage,
        fileName: CryptoJS.enc.Utf8.parse(file?.image),
        AccessKey: bunnyKey,
      };

      const key = CryptoJS.enc.Utf8.parse(SECRET_KEY);
      const iv = CryptoJS.lib.WordArray.random(16);
      const encrypted = CryptoJS.AES.encrypt(JSON.stringify(headers), key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      });
      const cipherText = encrypted.ciphertext.toString(CryptoJS.enc.Base64);
      const ivText = iv.toString(CryptoJS.enc.Base64);
      const encryptedData = cipherText + ":" + ivText;

      const response = await fetch(bunnyDownloadURL, {
        headers: { encryptedHeaders: encryptedData },
      });

      if (!response.body) return;

      const contentLength = await response.headers.get("Content-Length");
      const totalLength: any =
        typeof contentLength === "string" && parseInt(contentLength);
      let receivedLength = 0;

      const reader = await response.body.getReader();
      const chunks: any[] = [];
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done, value }: any = await reader.read();
        if (done) break;

        chunks.push(value);
        receivedLength += value.length;
        if (typeof totalLength === "number") {
          const step =
            parseFloat((receivedLength / totalLength).toFixed(2)) * 100;

          if (step > 0) {
            setProgress({
              id: file?.newNameImage,
              percentage: step,
            });
          }
        }
      }

      const blob = new Blob(chunks);
      const href = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = href;
      link.download = file?.image;
      document.body.appendChild(link);
      link.click();

      setProgress({ id: "", percentage: 0 });
      document.body.removeChild(link);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    scrollToBottom();
  }, [chat]);

  return (
    <Box className="chat-panel" ref={messagesEndRef}>
      {chat?.createdByStaff?._id ? (
        <MUI.ChatListContainer className="chat-user">
          {/* <img src={iconPerson} alt="icon-person" /> */}
          <MUI.ChatBoxListContainer>
            <MUI.ChatBoxContainer>
              <MUI.ChatBoxCardContainer className="box-card-user">
                <MUI.ChatBoxCard className="user">
                  {/* message reply */}
                  {chat?.replyMessage?._id ? (
                    <Box className="reply-box user">
                      <Typography component="p">You</Typography>
                      <Box>
                        <Typography component="span">
                          {heEntry.decode(
                            chat?.replyMessage?.message || "No message",
                          )}
                        </Typography>
                      </Box>
                    </Box>
                  ) : null}

                  <Typography component="span">
                    {heEntry.decode(chat.message)}
                  </Typography>
                  <Box className="timeDate user">
                    <Typography component="small">
                      {getTimeLineChat(chat.createdAt)}
                    </Typography>
                  </Box>
                </MUI.ChatBoxCard>
                {ticketStatus !== "close" && (
                  <IconButton
                    color="primary"
                    aria-label="reply-message"
                    sx={{ marginLeft: "0.38rem", padding: "7px" }}
                    onClick={() => handleReply(chat)}
                  >
                    <IconReply sx={{ fontSize: "1.4rem" }} />
                  </IconButton>
                )}
              </MUI.ChatBoxCardContainer>
            </MUI.ChatBoxContainer>

            {/* Chat Files */}
            <MUI.ChatBoxFileListContainer>
              {chat?.image?.length
                ? chat?.image?.map((file, index) => {
                    return file?.image ? (
                      <MUI.ChatBoxFileItem
                        className="user"
                        key={index}
                        sx={{ mt: 1.3 }}
                        onClick={() => onDownloadFile(chat, file)}
                      >
                        <Box className="icon-file">
                          <Box
                            sx={{
                              width: "20px",
                              mr: 3,
                            }}
                          >
                            <FileIcon
                              color="white"
                              extension={getFileType(file?.image)}
                              {...{
                                ...defaultStyles[
                                  getFileType(file?.image) as string
                                ],
                              }}
                            />
                          </Box>
                          <Typography component="span">{file.image}</Typography>

                          {file.newNameImage === progress?.id && (
                            <CircularProgress
                              variant="determinate"
                              size="1rem"
                              value={progress.percentage}
                              sx={{ ml: 3 }}
                            />
                          )}
                        </Box>
                        {/* <IconButton
                            aria-label="download-file"
                            size="small"
                            color="default"
                            onClick={() => onDownloadFile(chat, file)}
                          >
                            <FileDownload
                              className="icon-download-user"
                              sx={{
                                fontSize: "1rem",
                              }}
                            />
                          </IconButton> */}
                      </MUI.ChatBoxFileItem>
                    ) : null;
                  })
                : null}
            </MUI.ChatBoxFileListContainer>
          </MUI.ChatBoxListContainer>
        </MUI.ChatListContainer>
      ) : (
        <MUI.ChatListContainer className="chat-owner">
          <MUI.ChatBoxListContainer>
            <MUI.ChatBoxContainer>
              <MUI.ChatBoxCardContainer>
                <MUI.ChatBoxCard className="owner">
                  {chat?.replyMessage?._id ? (
                    <Box className="reply-box">
                      <Typography component="p">Admin</Typography>
                      <Box>
                        <Typography component="span">
                          {heEntry.decode(
                            chat?.replyMessage?.message || "No message",
                          )}
                        </Typography>
                      </Box>
                    </Box>
                  ) : null}
                  <Typography component="span">
                    {heEntry.decode(chat.message)}
                  </Typography>
                  <Box className="timeDate owner">
                    <Typography component="small">
                      {getTimeLineChat(chat.createdAt)}
                    </Typography>
                  </Box>
                </MUI.ChatBoxCard>
              </MUI.ChatBoxCardContainer>
              {/* <Box className="timeDate owner">
                <Typography component="small">
                  {moment(chat.createdAt).format("HH:mm")}
                </Typography>
              </Box> */}
            </MUI.ChatBoxContainer>

            {/* Chat Files */}
            <MUI.ChatBoxFileListContainer>
              {chat?.image.length
                ? chat?.image?.map((file, index) => {
                    return file?.image ? (
                      <MUI.ChatBoxFileItem
                        className="user"
                        key={index}
                        sx={{ mt: 1.3 }}
                        onClick={() => onDownloadFile(chat, file)}
                      >
                        <Box className="icon-file">
                          <Box
                            sx={{
                              width: "20px",
                              mr: 3,
                            }}
                          >
                            <FileIcon
                              color="white"
                              extension={getFileType(file?.image)}
                              {...{
                                ...defaultStyles[
                                  getFileType(file?.image) as string
                                ],
                              }}
                            />
                          </Box>
                          <Typography component="span">
                            {file?.image}
                          </Typography>

                          {file.newNameImage === progress?.id && (
                            <CircularProgress
                              variant="determinate"
                              size="1rem"
                              value={progress.percentage}
                              sx={{ ml: 3 }}
                            />
                          )}
                        </Box>
                      </MUI.ChatBoxFileItem>
                    ) : null;
                  })
                : null}
            </MUI.ChatBoxFileListContainer>
          </MUI.ChatBoxListContainer>
          {/* <img src={iconPerson} alt="icon-person" /> */}
        </MUI.ChatListContainer>
      )}
    </Box>
  );
}

export default ReplyPanel;
