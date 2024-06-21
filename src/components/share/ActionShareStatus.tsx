import { Button, useMediaQuery } from "@mui/material";
import MenuDropdown from "components/MenuDropdown";
import MenuDropdownItem from "components/MenuDropdownItem";
import { menuShareStatus } from "constants/menuItem.constant";
import { BiLockOpen, BiWorld } from "react-icons/bi";
import { MdOutlineExpandMore } from "react-icons/md";
export default function ActionShareStatus(props) {
  const isSmallMobile = useMediaQuery("(max-width:350px)");
  const { isglobals, _handleIsGlobal } = props;

  function handleGlobal(data) {
    _handleIsGlobal(data);
  }

  return (
    <div style={{ position: "relative" }}>
      <MenuDropdown
        customButton={{
          element: (
            <Button
              sx={{
                padding: isSmallMobile ? "5px 5px" : "4px 6px",
                fontSize: isSmallMobile ? "0.6rem" : "0.9rem",
              }}
              variant="outlined"
              endIcon={<MdOutlineExpandMore />}
            >
              {isglobals === "private" ? (
                <BiLockOpen size="20" />
              ) : (
                <BiWorld size="20" />
              )}
              &nbsp;
              {isglobals === "private" ? "Private" : "Public"}
            </Button>
          ),
        }}
      >
        {menuShareStatus.map((menuItem, index) => {
          return (
            <MenuDropdownItem
              isglobals={isglobals}
              key={index}
              title={menuItem.title}
              icon={menuItem.icon}
              onClick={() => {
                handleGlobal(menuItem.action);
              }}
            />
          );
        })}
      </MenuDropdown>
    </div>
  );
}
