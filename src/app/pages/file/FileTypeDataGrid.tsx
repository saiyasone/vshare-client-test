import React, { useState } from "react";
import { FileIcon, defaultStyles } from "react-file-icon";
import "styles/pagination.style.css";

// material ui icon and component
import { Box, Checkbox } from "@mui/material";
import ResponsivePagination from "react-responsive-pagination";

import { styled } from "@mui/material/styles";
import Action from "components/action-table/Action";
import FileDataGrid from "components/file/FileDataGrid";
import moment from "moment";
import { combineOldAndNewFileNames, getFileType } from "utils/file.util";
import { convertBytetoMBandGB } from "utils/storage.util";
const FileTypeDataGridContainer = styled("div")(() => ({
  height: "100%",
  display: "flex",
  flexDirection: "column",
}));

const FileIconContainer = styled("div")(() => ({
  width: "24px",
  height: "24px",
  display: "flex",
  alignItems: "center",
}));

function FileTypeDataGrid(props) {
  const { pagination, total, handleSelect } = props;
  const [hover, setHover] = useState("");
  const [anchorEvent, setAnchorEvent] = React.useState(null);
  const [menuDropdownAnchor, setMenuDropdownAnchor] = React.useState(null);

  const handlePopperOpen = (event) => {
    const id = event.currentTarget.dataset.id;
    const row = props.data?.find((r) => r.id === id);
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
            onClick={() => handleSelect(_id)}
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
              columnGap: "12px",
            }}
          >
            <FileIconContainer>
              <FileIcon
                extension={getFileType(filename)}
                {...{ ...defaultStyles[getFileType(filename) as string] }}
              />
            </FileIconContainer>
            <div className="file_name">
              {combineOldAndNewFileNames(filename, params?.row?.newFilename)}
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
        moment(params.row.updatedAt).format("D MMM YYYY, h:mm A"),
      flex: 1,
    },
    {
      field: "action",
      headerName: "Actions",
      flex: 1,
      headerAlign: "center",
      align: "center",
      editable: false,
      sortable: false,
      renderCell: (params) => {
        return (
          <Action
            params={params}
            eventActions={{
              hover,
              setHover,
              handleEvent: (action, data) => {
                props.handleEvent(action, data);
              },
            }}
            anchor={[menuDropdownAnchor, setMenuDropdownAnchor]}
          />
        );
      },
    },
  ];

  return (
    <FileTypeDataGridContainer>
      <FileDataGrid
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
        }}
        // handleSelection={handleSelect}
        data={props.data}
      />
      {total > props.data?.length && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            width: "90%",
            mt: 3,
          }}
        >
          <ResponsivePagination
            total={pagination?.total}
            current={pagination?.currentPage}
            onPageChange={pagination?.setCurrentPage}
          />
        </Box>
      )}
    </FileTypeDataGridContainer>
  );
}

export default FileTypeDataGrid;
