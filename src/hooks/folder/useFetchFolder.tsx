import { useLazyQuery } from "@apollo/client";
import { QUERY_FOLDER } from "api/graphql/folder.graphql";
import { EventUploadTriggerContext } from "contexts/EventUploadTriggerProvider";
import { useContext, useEffect, useMemo } from "react";

const useFetchFolder = ({ folderUrl, userId }: any) => {
  const [getData, { data: dataFetching }] = useLazyQuery(QUERY_FOLDER, {
    fetchPolicy: "no-cache",
  });

  const eventUploadTrigger = useContext(EventUploadTriggerContext);

  useEffect(() => {
    if (userId || folderUrl) {
      getData({
        variables: {
          where: {
            ...(folderUrl && {
              url: folderUrl,
            }),
            ...(folderUrl && {
              createdBy: userId,
            }),
          },
          orderBy: "updatedAt_DESC",
        },
      });
    }
  }, [folderUrl, userId, eventUploadTrigger?.triggerData]);

  const data = useMemo(() => {
    const [queryData] = dataFetching?.folders?.data || [];
    const queryTotal = dataFetching?.folders?.total || null;
    return {
      data: queryData,
      total: queryTotal,
    };
  }, [dataFetching]);

  return data;
};

export default useFetchFolder;
