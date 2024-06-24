import React, { useContext, useEffect, useState } from "react";

import { Box, Grid, useMediaQuery } from "@mui/material";

//component
import { useLazyQuery } from "@apollo/client";
import { QUERY_GET_SPACE } from "api/graphql/space.graphql";
import AdaptiveSkeleton from "components/AdaptiveSkeleton";
import { EventUploadTriggerContext } from "contexts/EventUploadTriggerProvider";
import useFetchFile from "hooks/file/useFetchFile";
import useFetchFileByMostDownload from "hooks/file/useFetchFileByMostDownload";
import useFilterFileByDate from "hooks/file/useFilterFileByDate";
import useFilterFileByType from "hooks/file/useFilterFileByType";
import useFilterFileTotal from "hooks/file/useFilterFileTotal";
import useAuth from "hooks/useAuth";
import "swiper/css";
import { convertBytetoMBandGB } from "utils/storage.util";
import GraphSpace from "./GraphSpace";
import MostDownload from "./MostDownload";
import StatisticFileType from "./StatisticFileType";
import StatisticFileTypeItem from "./StatisticFileTypeItem";
import TotalCard from "./TotalCard";
import {
  DashboardContainer,
  DashboardItem,
} from "./styles/clientDashboard.style";
import "./styles/clientDashboard.style.css";

const ITEM_PER_PAGE = 5;
const ClientDashboard = () => {
  const { user }: any = useAuth();
  const [dataFilter, setDataFilter] = useState({});
  const isMobile = useMediaQuery("(max-width:768px)");
  const eventUploadTrigger = useContext(EventUploadTriggerContext);
  const [getSpace, { data: dataSpace, loading: loadingSpace }] = useLazyQuery(
    QUERY_GET_SPACE,
    {
      fetchPolicy: "no-cache",
    },
  );

  useEffect(() => {
    if (eventUploadTrigger?.triggerData?.isTriggered) {
      getSpace();
    }
  }, [eventUploadTrigger?.triggerData]);

  useEffect(() => {
    getSpace();
  }, []);

  const [currentMostDownloadPage, setCurrentMostDownloadPage] = useState(1);

  useEffect(() => {
    setDataFilter((prevState) => {
      const result: any = {
        ...prevState,
        skip: (currentMostDownloadPage - 1) * ITEM_PER_PAGE,
      };
      if (currentMostDownloadPage - 1 === 0) {
        delete result.skip;
      }
      return result;
    });
  }, [currentMostDownloadPage]);

  //data files without filters
  const dataFiles = useFetchFile({
    user,
  });

  //files query
  const { data: totalList } = useFilterFileTotal({
    totalStorage: user?.storage,
    files: dataFiles.data,
    dataSpace,
  });

  //weekly, monthly, yearly
  const [selectValue, setSelectValue] = React.useState("weekly");
  const { labels, data: graphData }: any = useFilterFileByDate({
    options: selectValue,
    files: dataFiles.data,
  });

  // file types
  const totalTypeList = useFilterFileByType({ files: dataFiles.data });

  const fileByMostDownload = useFetchFileByMostDownload({
    user,
    dataFilter: {
      data: dataFilter,
      limit: ITEM_PER_PAGE,
    },
  });

  return (
    <DashboardContainer
      sx={{
        ...(isMobile
          ? {
              padding: (theme) => theme.spacing(5),
              marginTop: (theme) => theme.spacing(5),
              marginBottom: (theme) => theme.spacing(5),
            }
          : {
              marginTop: (theme) => theme.spacing(5),
            }),
      }}
    >
      <DashboardItem>
        {isMobile ? (
          <Box
            sx={{
              backgroundColor: (theme) =>
                theme.palette.mode === "dark" ? "#fff" : "#fff",
              borderRadius: "8px",
              padding: (theme) => theme.spacing(5),
              boxShadow: "rgba(0, 0, 0, 0.09) 0px 3px 12px",
            }}
          >
            <Grid container spacing={5}>
              {totalList.map((totalItem, index) => {
                return (
                  <Grid item xs={6} sm={6} md={3} lg={3} key={index}>
                    <TotalCard {...totalItem} />
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        ) : (
          <Grid container spacing={5}>
            {totalList.map((totalItem, index) => {
              return (
                <Grid item xs={6} sm={6} md={6} lg={3} key={index}>
                  <AdaptiveSkeleton loading={loadingSpace}>
                    <TotalCard {...totalItem} />
                  </AdaptiveSkeleton>
                </Grid>
              );
            })}
          </Grid>
        )}
      </DashboardItem>
      <DashboardItem>
        <Grid container spacing={5}>
          <Grid item xs={12} md={6}>
            <AdaptiveSkeleton loading={loadingSpace}>
              <GraphSpace
                {...{
                  packageName: user?.packageId?.name,
                  ...(dataFiles.data.totalSize && {
                    usedSpace: convertBytetoMBandGB(
                      Number(dataFiles.data.totalSize),
                    ),
                  }),
                  ...(user?.storage && {
                    totalSpace: convertBytetoMBandGB(
                      Number(dataSpace?.getSpaces?.totalStorage || 0),
                    ),
                  }),
                }}
                data={graphData}
                labels={labels}
                select={{
                  value: selectValue,
                  onChange: (e) => {
                    setSelectValue(e);
                  },
                }}
              />
            </AdaptiveSkeleton>
          </Grid>
          <Grid item xs={12} md={6} lg={6}>
            <AdaptiveSkeleton loading={loadingSpace}>
              <MostDownload
                onSearch={(e) =>
                  setDataFilter((prevState) => {
                    setCurrentMostDownloadPage(1);
                    const result: any = {
                      ...prevState,
                      filename: e,
                    };
                    if (e) {
                      delete result.skip;
                    }

                    return result;
                  })
                }
                data={fileByMostDownload.data}
                total={fileByMostDownload.total}
                pagination={{
                  total:
                    Math.ceil(fileByMostDownload.total / ITEM_PER_PAGE) > 4
                      ? 4
                      : Math.ceil(fileByMostDownload.total / ITEM_PER_PAGE),
                  currentPage: currentMostDownloadPage,
                  setCurrentPage: setCurrentMostDownloadPage,
                }}
              />
            </AdaptiveSkeleton>
          </Grid>
        </Grid>
      </DashboardItem>
      <DashboardItem>
        <AdaptiveSkeleton loading={loadingSpace}>
          <StatisticFileType>
            <Grid container rowSpacing={5} columnSpacing={2}>
              {totalTypeList.map((totalItem, index) => {
                return (
                  <Grid item xs={4} sm={4} md={3} lg={2} key={index}>
                    <StatisticFileTypeItem {...totalItem} />
                  </Grid>
                );
              })}
            </Grid>
          </StatisticFileType>
        </AdaptiveSkeleton>
      </DashboardItem>
    </DashboardContainer>
  );
};

export default ClientDashboard;
