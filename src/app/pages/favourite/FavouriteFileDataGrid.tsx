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
import { getFileType } from "utils/file.util";
import { convertBytetoMBandGB } from "utils/storage.util";

const FavouriteFilesDataGridContainer = styled("div")(() => ({
  height: "100%",
  display: "flex",
  flexDirection: "column",
}));

const FileIconContainer = styled("div")(() => ({
  width: "24px",
  display: "flex",
  alignItems: "center",
}));

function FavouriteFileDataGrid(props) {
  const [hover, setHover] = useState("");
  const [isPage, setIsPage] = useState(false);
  const [anchorEvent, setAnchorEvent] = React.useState(null);
  const [menuDropdownAnchor, setMenuDropdownAnchor] = React.useState(null);
  const [isLoaded, setIsloaded] = useState<any>(null);

  const handlePopperOpen = (event) => {
    const id = event.currentTarget.dataset.id;
    const row = props.data.find((r) => r.id === id);
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
      width: 60,
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
        const { filename } = params.row;
        return (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              overflow: "hidden",
              columnGap: "12px",
            }}
          >
            <FileIconContainer>
              <FileIcon
                extension={getFileType(filename)}
                {...{ ...defaultStyles[getFileType(filename) as string] }}
              />
            </FileIconContainer>
            <div
              className="file_name"
              style={{
                whiteSpace: "nowrap",
                textOverflow: "ellipsis",
                overflow: "hidden",
              }}
            >
              {filename}
            </div>
          </div>
        );
      },
      flex: 1,
    },
    {
      field: "size",
      headerName: "Size",
      renderCell: (params) => convertBytetoMBandGB(params.row.size),
      editable: false,
      flex: 1,
    },
    {
      field: "updatedAt",
      headerName: "Date",
      editable: false,
      renderCell: (params) =>
        moment(params.row.actionDate).format("YYYY-MM-DD h:mm:ss"),
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
    <FavouriteFilesDataGridContainer>
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
    </FavouriteFilesDataGridContainer>
  );
}

export default FavouriteFileDataGrid;
