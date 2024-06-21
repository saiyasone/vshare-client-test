import { useLazyQuery, useMutation } from "@apollo/client";
import { QUERY_FILE } from "api/graphql/file.graphql";
import { MUTATION_UPDATE_EXPORT_LINK } from "api/graphql/folder.graphql";
import moment from "instances/moment.instance";
import { useEffect } from "react";
import { errorMessage } from "utils/alert.util";
import { convertBytetoMBandGB } from "utils/storage.util";
import useAuth from "./useAuth";

const useExportCSV = ({ folderId, exportRef }) => {
  const { user }: any = useAuth();
  const [updateExportCSV] = useMutation(MUTATION_UPDATE_EXPORT_LINK);
  const [getFile, { data: getFileData }] = useLazyQuery(QUERY_FILE, {
    fetchPolicy: "no-cache",
  });

  async function handleGetAllFile() {
    try {
      if (folderId) {
        await updateExportCSV({
          variables: {
            data: {
              getLinkBy: parseInt(user?._id),
            },
            where: {
              _id: folderId,
            },
          },
          onCompleted: async (data) => {
            if (data?.updateStatusFolderExportLink) {
              const result = await getFile({
                variables: {
                  where: {
                    folder_id: folderId,
                    status: "active",
                  },
                },
              });
              if (result.data?.files?.data?.length > 0) {
                await exportRef?.current?.link.click();
              }
            }
          },
        });
      }
    } catch (error: any) {
      errorMessage(error?.message, 3000);
    }
  }

  useEffect(() => {
    handleGetAllFile();
  }, [folderId]);

  return {
    data:
      getFileData?.files?.data?.map((item, index) => {
        return {
          ID: index + 1,
          Filename: item.filename,
          ShortUrl: item.shortUrl ?? "",
          Size: convertBytetoMBandGB(item.size),
          // Url: item.url,
          createdAt: item.createdAt
            ? moment(item.createdAt).format("DD-MM-YYYY")
            : "",
        };
      }) || [],
  };
};

export default useExportCSV;
