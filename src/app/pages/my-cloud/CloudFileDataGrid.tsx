import React, { Fragment, useState } from "react";
import { FileIcon, defaultStyles } from "react-file-icon";
import ResponsivePagination from "react-responsive-pagination";
import "styles/pagination.style.css";

// material ui icon and component
import { Box, Checkbox } from "@mui/material";

// component

// graphql

//function
import { styled } from "@mui/material/styles";
import Action from "components/action-table/Action";
import FileDataGrid from "components/file/FileDataGrid";
import moment from "moment";
import { combineOldAndNewFileNames, getFileType } from "utils/file.util";
import { convertBytetoMBandGB } from "utils/storage.util";

const CloudFilesDataGridContainer = styled("div")(() => ({
  height: "100%",
  display: "flex",
  flexDirection: "column",
}));

function CloudFileDataGrid(props) {
  const [hover, setHover] = useState("");
  const [isPage, setIsPage] = useState(false);
  const [anchorEvent, setAnchorEvent] = React.useState(null);
  const [menuDropdownAnchor, setMenuDropdownAnchor] = React.useState(null);
  const [isLoaded, setIsloaded] = useState<any>(null);

  const handlePopperOpen = (event) => {
    const id = event.currentTarget.dataset.id;
    const row = props.data.find((r) => r._id === id);
    setHover(row);
    setAnchorEvent(event.currentTarget);
  };

  const handlePopperClose = () => {
    if (anchorEvent == null) {
      return;
    }
    setHover("");
    setAnchorEvent(null);
  };

  React.useEffect(() => {
    if (props.data?.length > 0) {
      setIsloaded(true);
    }
  }, [props.data]);

  React.useEffect(() => {
    if (props?.total > 10) {
      setIsPage(true);
    } else {
      setIsPage(false);
    }
  }, [props?.data]);

  const columns = [
    {
      field: "checkboxAction",
      headerName: "",
      editable: false,
      sortable: false,
      width: 50,
      renderCell: (params) => {
        const { _id } = params?.row || {};

        return (
          <Checkbox
            checked={
              !!props?.dataSelector?.selectionFileAndFolderData?.find(
                (el) => el?.id === _id,
              ) && true
            }
            aria-label={"checkbox" + _id}
            onClick={() => props?.handleSelection(_id)}
          />
        );
      },
    },
    {
      field: "filename",
      headerName: "Name",
      editable: false,
      renderCell: (params) => {
        return (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              columnGap: "12px",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{ width: "24px", display: "flex", alignItems: "center" }}
              mt={2}
              onClick={() => props.handleEvent("preview", params.row)}
            >
              <FileIcon
                color="white"
                extension={getFileType(params.row.filename)}
                {...{
                  ...defaultStyles[getFileType(params.row.filename) as string],
                }}
              />
            </Box>
            <span
              style={{
                whiteSpace: "nowrap",
                textOverflow: "ellipsis",
                overflow: "hidden",
              }}
            >
              {combineOldAndNewFileNames(
                params?.row?.filename,
                params?.row?.newFilename,
              )}
            </span>
          </div>
        );
      },
      flex: 1,
    },
    {
      field: "size",
      headerName: "File size",
      flex: 1,
      renderCell: (params) => {
        return (
          <span>
            {convertBytetoMBandGB(params.row.size ? params.row.size : 0)}
          </span>
        );
      },
    },
    {
      field: "updatedAt",
      headerName: "Lasted Update",
      editable: false,
      renderCell: (params) => {
        return (
          <span>
            {moment(params.row.updatedAt).format("D MMM YYYY, h:mm A")}
          </span>
        );
      },
      flex: 1,
    },
    {
      field: "action",
      headerName: "",
      flex: 1,
      align: "right",
      editable: false,
      sortable: false,
      renderCell: (params) => {
        return (
          <Action
            params={params}
            eventActions={{
              hover,
              setHover,
              handleEvent: (action, data) => props.handleEvent(action, data),
            }}
            anchor={[menuDropdownAnchor, setMenuDropdownAnchor]}
          />
        );
      },
    },
  ];

  return (
    <CloudFilesDataGridContainer>
      <FileDataGrid
        handleSelection={props.handleSelection}
        dataGrid={{
          sx: {
            "& .MuiDataGrid-columnSeparator": { display: "none" },
          },
          checked: true,
          disableColumnFilter: true,
          disableColumnMenu: true,
          componentsProps: {
            row: {
              onMouseEnter: handlePopperOpen,
              onMouseLeave: handlePopperClose,
            },
          },
          onRowDoubleClick: (params) => {
            props.handleEvent("preview", params.row);
          },
          columns,
          hideFooter: true,
          getRowId: (row) => row._id,
        }}
        data={props.data}
      />
      {props.pagination.total > 1 && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            width: "90%",
            mt: 3,
          }}
        >
          {isLoaded !== null && isLoaded && (
            <Fragment>
              {isPage && (
                <ResponsivePagination
                  current={props.pagination.currentPage}
                  total={props.pagination.total}
                  onPageChange={props.pagination.setCurrentPage}
                />
              )}
            </Fragment>
          )}
        </Box>
      )}
    </CloudFilesDataGridContainer>
  );
}

export default CloudFileDataGrid;
