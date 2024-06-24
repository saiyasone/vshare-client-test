import useDeepEqualEffect from "hooks/useDeepEqualEffect";
import { createContext, useState } from "react";

export const EventUploadTriggerContext = createContext<any>(null);

export const EventUploadTriggerProvider = (props) => {
  const [triggerData, setTriggerData] = useState<any>({});
  const trigger = () => {
    setTriggerData((state) => ({
      ...state,
      isTriggered: true,
      type: "file",
    }));
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
    <EventUploadTriggerContext.Provider value={{ triggerData, trigger }}>
      {props.children}
    </EventUploadTriggerContext.Provider>
  );
};
