import useDeepEqualEffect from "hooks/useDeepEqualEffect";
import { createContext, useState } from "react";

export const EventUploadTriggerContext = createContext<any>(null);

export const EventUploadTriggerProvider = (props) => {
  const [triggerData, setTriggerData] = useState<any>({});
  const [sharePermission, setSharePermission] = useState("edit");

  const trigger = () => {
    setTriggerData((state) => ({
      ...state,
      isTriggered: true,
      type: "file",
    }));
  };

  const handleSharePermission = (permission) => {
    setSharePermission(permission || "edit");
  };

  useDeepEqualEffect(() => {
    if (triggerData.isTriggered) {
      setTriggerData((state) => ({
        ...state,
        isTriggered: false,
      }));
    }
  }, [triggerData.isTriggered]);

  return (
    <EventUploadTriggerContext.Provider
      value={{ triggerData, handleSharePermission, trigger, sharePermission }}
    >
      {props.children}
    </EventUploadTriggerContext.Provider>
  );
};
