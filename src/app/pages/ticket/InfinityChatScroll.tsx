import { CircularProgress } from "@mui/material";
import { useEffect, useState } from "react";
import {
  ChatPanelInfinity,
  ChatPanelInfinityContainer,
  ChatPanelLoading,
} from "./styles/chat.style";

const InifinityChatScroll = (props) => {
  const { children, chatMessages, hasMore, onRefreshLimit } = props;
  const [chats, setChats] = useState<any[]>([]);
  const [hasData, setHasData] = useState(false);

  const ShowLoadingComponent = () => {
    return (
      <ChatPanelLoading>
        <CircularProgress color="primary" />
      </ChatPanelLoading>
    );
  };

  const refreshLimit = () => {
    onRefreshLimit();
  };

  useEffect(() => {
    setChats(chatMessages);
  }, [chatMessages]);

  useEffect(() => {
    setHasData(hasMore);
  }, [hasMore]);

  return (
    <ChatPanelInfinityContainer id="scrollableDiv">
      <ChatPanelInfinity
        dataLength={chats.length}
        next={refreshLimit}
        inverse={true}
        hasMore={hasData}
        scrollableTarget="scrollableDiv"
        loader={ShowLoadingComponent()}
      >
        {children}
      </ChatPanelInfinity>
    </ChatPanelInfinityContainer>
  );
};

export default InifinityChatScroll;
