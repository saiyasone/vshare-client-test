import React, { useState } from "react";
import { FileIcon, defaultStyles } from "react-file-icon";
import "styles/pagination.style.css";

// material ui icon and component
import { Box, Checkbox, useMediaQuery } from "@mui/material";
//function
import { styled } from "@mui/material/styles";
import Action from "components/action-table/Action";
import FileDataGrid from "components/file/FileDataGrid";
import ActionFileShare from "components/share/ActionFileShare";
import menuItems, {
  favouriteMenuItems,
  shortFavouriteMenuItems,
  shortFileShareMenu,
} from "constants/menuItem.constant";
import moment from "moment";
import ResponsivePagination from "react-responsive-pagination";
import { DATE_PATTERN_FORMAT } from "utils/date.util";
import { combineOldAndNewFileNames, getFileType } from "utils/file.util";
import { convertBytetoMBandGB } from "utils/storage.util";
const ExtendFilesDataGridContainer = styled("div")(() => ({
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

function ExtendFileDataGrid(props) {
  const isMobile = useMediaQuery("(max-width:600px)");
  const isTablet = useMediaQuery("(min-width:600px) and (max-width:1024px)");
  const [hover, setHover] = useState("");
  const [anchorEvent, setAnchorEvent] = React.useState(null);
  const [menuDropdownAnchor, setMenuDropdownAnchor] = React.useState(null);
  // const [isLoaded, setIsloaded] = useState(null);

  const handlePopperOpen = (event) => {
    const id = event.currentTarget.dataset.id;
    const row = props.data.find((r) => r._id === id);
    setHover(row);
    setAnchorEvent(event.currentTarget);
  };

  const handleOnPreview = (data) => {
    if (isTablet || isMobile) {
      props.handleEvent("preview", data.row);
    }
  };
  // const handlePopperClose = (event) => {
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
      renderCell: (params) => {
        const { name, newName } = params.row;
        return (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              columnGap: "12px",
              overflow: "hidden",
            }}
          >
            <FileIconContainer onClick={() => handleOnPreview(params)}>
              <FileIcon
                extension={getFileType(name)}
                {...{ ...defaultStyles[getFileType(name) as string] }}
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
              {combineOldAndNewFileNames(name, newName)}
            </div>
          </div>
        );
      },
      flex: 1,
    },
    {
      field: "size",
      headerName: "Size",
      renderCell: (params) => {
        return <Box>{convertBytetoMBandGB(params.row.size)}</Box>;
      },
      editable: false,
      flex: 1,
    },
    {
      field: "updatedAt",
      headerName: "Date",
      editable: false,
      renderCell: (params) =>
        moment(params.row.updatedAt).format(DATE_PATTERN_FORMAT.datetime),
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
          <>
            {props.isFromSharingUrl ? (
              <ActionFileShare
                params={params}
                eventActions={{
                  hover,
                  setHover,
                  handleEvent: (action, data) =>
                    props.handleEvent(action, data),
                }}
                menuItems={menuItems}
                shortMenuItems={props.shortMenuItems || shortFileShareMenu}
                anchor={[menuDropdownAnchor, setMenuDropdownAnchor]}
                user={props.user}
              />
            ) : (
              <Action
                params={params}
                eventActions={{
                  hover,
                  setHover,
                  handleEvent: (action, data) =>
                    props.handleEvent(action, data),
                }}
                menuItems={favouriteMenuItems}
                shortMenuItems={shortFavouriteMenuItems}
                anchor={[menuDropdownAnchor, setMenuDropdownAnchor]}
                user={props.user}
              />
            )}
          </>
        );
      },
    },
  ];

  return (
    <ExtendFilesDataGridContainer>
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
        data={props.data}
        handleSelection={props.handleSelection}
      />

      {props?.pagination?.totalItems > 10 && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            width: "90%",
            mt: 5,
          }}
        >
          <ResponsivePagination
            current={props?.pagination?.currentPage}
            total={props?.pagination?.total}
            onPageChange={props?.pagination?.setCurrentPage}
          />
        </Box>
      )}
    </ExtendFilesDataGridContainer>
  );
}

export default ExtendFileDataGrid;
