import FolderEmptyIcon from "assets/images/empty/folder-empty.svg?react";
import FolderNotEmptyIcon from "assets/images/empty/folder-not-empty.svg?react";
import React, { Fragment, useState } from "react";
import { FileIcon, defaultStyles } from "react-file-icon";

//function
import { Box, Checkbox } from "@mui/material";
import { styled } from "@mui/material/styles";
import Action2 from "components/action-table/Action2";
import FileDataGrid from "components/file/FileDataGrid";
import { trashMenuItems } from "constants/menuItem.constant";
import moment from "moment";
import { getFileType } from "utils/file.util";
import { convertBytetoMBandGB } from "utils/storage.util";

const TrashDataGridContainer = styled("div")(() => ({
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

const FolderIconContainer = styled("div")(() => ({
  width: "30px",
}));

function TrashDataGrid(props) {
  const [hover, setHover] = useState("");
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
      field: "name",
      headerName: "Name",
      editable: false,
      flex: 1,
      minWidth: "300px",
      renderCell: (params) => {
        const { name, checkTypeItem, totalItems } = params.row;
        return (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              overflow: "hidden",
              columnGap: checkTypeItem === "folder" ? "6px" : "12px",
            }}
          >
            {checkTypeItem === "folder" ? (
              <FolderIconContainer>
                {totalItems > 0 ? <FolderNotEmptyIcon /> : <FolderEmptyIcon />}
              </FolderIconContainer>
            ) : (
              <FileIconContainer>
                <FileIcon
                  extension={getFileType(name)}
                  {...{ ...defaultStyles[getFileType(name) as string] }}
                />
              </FileIconContainer>
            )}
            <div
              className="file_name"
              style={{
                whiteSpace: "nowrap",
                textOverflow: "ellipsis",
                overflow: "hidden",
              }}
            >
              {name}
            </div>
          </div>
        );
      },
    },
    {
      field: "size",
      headerName: "Size",
      renderCell: (params) => {
        return (
          <Fragment>
            <Box>
              {params?.row?.size ? convertBytetoMBandGB(params.row.size) : "--"}
            </Box>
          </Fragment>
        );
      },
      editable: false,
      flex: 1,
      minWidth: 80,
    },
    {
      field: "updatedAt",
      headerName: "Date",
      editable: false,
      renderCell: (params) =>
        moment(params.row.updatedAt).format("YYYY-MM-DD h:mm:ss"),
      flex: 1,
      minWidth: 180,
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
          <Action2
            params={params}
            eventActions={{
              hover,
              setHover,
              handleEvent: (action, data) => props.handleEvent(action, data),
            }}
            menuItems={trashMenuItems}
            shortMenuItems={trashMenuItems}
            anchor={[menuDropdownAnchor, setMenuDropdownAnchor]}
          />
        );
      },
    },
  ];

  return (
    <TrashDataGridContainer>
      <FileDataGrid
        handleSelection={props.handleSelection}
        dataGrid={{
          sx: {
            "& .MuiDataGrid-columnSeparator": { display: "none" },
            borderRadius: 0,
            "& .MuiDataGrid-virtualScroller": {
              overflowX: "scroll",
            },
          },
          checked: true,
          hideFooter: true,
          disableColumnFilter: true,
          disableColumnMenu: true,
          componentsProps: {
            row: {
              onMouseEnter: handlePopperOpen,
              onMouseLeave: handlePopperClose,
            },
          },
          columns,
        }}
        data={props.data}
      />
    </TrashDataGridContainer>
  );
}

export default TrashDataGrid;
