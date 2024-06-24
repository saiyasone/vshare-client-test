import { Theme } from "@mui/material";
import {
  PaletteOptions as MuiPaletteOptions,
  Palette as MuiPallete,
} from "@mui/material/styles/createPalette";

declare module "@mui/material/styles/createPalette" {
  interface Palette extends MuiPallete {
    primaryTheme?: {
      main: string;
      brown: (alpha?: any) => string;
      green: string;
    };
  }

  interface PaletteOptions extends MuiPaletteOptions {
    primaryTheme?: {
      main: string;
      brown: (alpha?: any) => string;
      green: string;
    };
  }
}

declare module "@mui/material/styles/createTheme" {
  interface Theme {
    baseShadow: {
      primary: string;
      secondary: string;
    };
  }
  interface ThemeOptions {
    baseShadow: {
      primary: string;
      secondary: string;
    };
  }
}

declare module "@mui/material/styles" {
  interface CustomTheme extends Theme {}
  interface CustomThemeOptions {
    [key: string]: any;
  }
  export function createTheme(options?: CustomThemeOptions): CustomTheme;
}

declare module "@mui/material/CircularProgress" {
  export interface CircularProgressPropsColorOverrides {
    primaryTheme: true;
  }
}

declare module "@mui/material/Button" {
  export interface ButtonPropsColorOverrides {
    primaryTheme: true;
    greyTheme: true;
    secondaryTheme: true;
  }
}
