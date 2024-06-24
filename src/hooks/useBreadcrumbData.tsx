import { useMemo } from "react";

const useBreadcrumbData = (inputPath, filename) => {
  const data = useMemo(() => {
    if (inputPath || filename) {
      return [inputPath, filename]
        .join("/")
        .split("/")
        .filter((data) => data);
    }
  }, [inputPath, filename]);

  return data;
};

export default useBreadcrumbData;
