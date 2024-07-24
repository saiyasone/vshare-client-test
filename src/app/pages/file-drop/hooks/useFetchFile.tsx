import { useLazyQuery } from "@apollo/client";
import { QUERY_FILE } from "api/graphql/file.graphql";
import React from "react";
import useDeepEqualEffect from "../../../../hooks/useDeepEqualEffect";

const useFetchFile = ({ filter }) => {
  const [isDataFound, setDataFound] = React.useState<boolean | null>(null);
  const [getData, { data: dataFetching, loading }] = useLazyQuery(QUERY_FILE, {
    fetchPolicy: "no-cache",
  });

  const customgetFiles = () => {
    getData({
      variables: {
        where: {
          dropUrl: filter.url,
          status: "active",
        },
      },
    });
  };

  useDeepEqualEffect(() => {
    customgetFiles();
  }, [filter]);

  const data = React.useMemo(() => {
    const queryData = dataFetching?.files?.data || [];
    const queryTotal = dataFetching?.files?.total || null;
    if (queryData !== undefined) {
      if (queryData.length > 0) {
        setDataFound(true);
      } else {
        setDataFound(false);
      }
    }
    return {
      data: queryData,
      total: queryTotal,
      loading,
      isDataFound,
      customgetFiles,
    };
  }, [dataFetching, isDataFound]);

  return data;
};

export default useFetchFile;
