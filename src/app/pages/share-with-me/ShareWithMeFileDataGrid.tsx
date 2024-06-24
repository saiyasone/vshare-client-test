import { DataGrid } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import "./styles/fileDataGrid.style.css";

export default function ShareWithMeFileDataGrid({ dataGrid, ...props }) {
  const [data, setData] = useState([]);
  const { setHover, open, hanleOpenFile } = props;

  useEffect(() => {
    if (props?.data?.length > 0) {
      setData(() =>
        props.data.map((data, index) => ({
          noId: index,
          ...data,
        })),
      );
    }
  }, [props.data, dataGrid]);

  const handlePopperOpen = (event) => {
    const id = event.currentTarget.dataset.id;
    const row = props.data.find((r) => {
      return r.id === id;
    });

    setHover(row);
  };

  const handlePopperClose = () => {
    if (open == null) {
      return;
    }
    setHover("");
  };

  function getRowClassName(params) {
    const { _id } = params?.row || {};

    if (
      props?.dataSelector?.selectionFileAndFolderData?.find(
        (el) => el?.id === _id,
      ) &&
      true
    ) {
      return "custom-row-class";
    }

    return "";
  }

  return (
    <DataGrid
      autoHeight
      {...{
        ...dataGrid,
        rows: data,
        getRowId: (row) => row?._id,
        sx: {
          "& .MuiDataGrid-columnSeparator": { display: "none" },
          "& .MuiDataGrid-virtualScroller::-webkit-scrollbar": {
            display: "none",
          },
        },
      }}
      key={(row) => row._id}
      checked={true}
      disableColumnFilter
      disableSelectionOnClick={true}
      disableColumnMenu
      getRowClassName={getRowClassName}
      rowsPerPageOptions={[]}
      componentsProps={{
        row: {
          onMouseEnter: handlePopperOpen,
          onMouseLeave: handlePopperClose,
        },
      }}
      style={{ border: "none", borderBottom: "1px solid #e0e0e0" }}
      onCellDoubleClick={hanleOpenFile}
      // checkboxSelection={true}
      // selectionModel={dataSelector?.selectionFileAndFolderData?.map(
      //   (item) => item.id,
      // )}
      // onSelectionModelChange={handleSelection}
    />
  );
}
