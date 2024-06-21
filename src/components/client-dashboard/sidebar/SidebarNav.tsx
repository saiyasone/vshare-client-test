import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { List } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import ReactPerfectScrollbar from "react-perfect-scrollbar";

import SidebarNavSection from "./SidebarNavSection";

import "styles/perfect-scrollbar.css";

const baseScrollbar = () => css`
  flex-grow: 1;
  color: #000000;
`;

const Scrollbar = styled.div`
  ${baseScrollbar}
`;

const PerfectScrollbar = styled(ReactPerfectScrollbar)`
  ${baseScrollbar}
`;

const Items = styled.div`
  padding-top: ${(props: any) => props.theme.spacing(2.5)};
  padding-bottom: ${(props: any) => props.theme.spacing(2.5)};
`;

const SidebarNav = ({ items }) => {
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.up("md"));
  const ScrollbarComponent = matches ? PerfectScrollbar : Scrollbar;

  return (
    <ScrollbarComponent>
      <List disablePadding>
        <Items>
          {items &&
            items.map((item, index) => (
              <SidebarNavSection
                component="div"
                key={index}
                pages={item.pages}
                title={item.title}
              />
            ))}
        </Items>
      </List>
    </ScrollbarComponent>
  );
};

export default SidebarNav;
