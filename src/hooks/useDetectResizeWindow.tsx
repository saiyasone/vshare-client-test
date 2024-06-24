import { useEffect, useState } from "react";

const useDetectResizeWindow = () => {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const [canBeScrolled, setCanBeScrolled] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
      if (document.body.clientHeight > window.innerHeight) {
        setCanBeScrolled(true);
      } else {
        setCanBeScrolled(false);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return { windowSize, canBeScrolled };
};

export default useDetectResizeWindow;
