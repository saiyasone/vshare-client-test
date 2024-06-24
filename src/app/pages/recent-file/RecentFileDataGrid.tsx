import React, { useState } from "react";
import { FileIcon, defaultStyles } from "react-file-icon";

//function
import { Checkbox } from "@mui/material";
import { styled } from "@mui/material/styles";
import Action from "components/action-table/Action";
import FileDataGrid from "components/file/FileDataGrid";
import moment from "moment";
import { getFileType } from "utils/file.util";
import { convertBytetoMBandGB } from "utils/storage.util";

const RecentDataGridContainer = styled("div")(() => ({
  height: "100%",
  display: "flex",
  flexDirection: "column",
}));

const FileIconContainer = styled("div")(() => ({
  width: "24px",
  display: "flex",
  alignItems: "center",
}));

function RecentFileDataGrid(props) {
  const [hover, setHover] = useState("");
  const { handleSelection } = props;
  const [anchorEvent, setAnchorEvent] = React.useState(null);
  const [menuDropdownAnchor, setMenuDropdownAnchor] = React.useState(null);

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
    <RecentDataGridContainer>
      <FileDataGrid
        handleSelection={handleSelection}
        dataGrid={{
          sx: {
            "& .MuiDataGrid-columnSeparator": { display: "none" },
            "& .MuiDataGrid-virtualScroller::-webkit-scrollbar": {
              display: "none",
            },
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
        data={props.data}
      />
    </RecentDataGridContainer>
  );
}

export default RecentFileDataGrid;
