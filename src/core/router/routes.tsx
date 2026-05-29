import Home from "@/pages/home";
import MusicDetail from "@/pages/musicDetail";
import SheetDetail from "@/pages/sheetDetail";
import Setting from "@/pages/setting";
import LocalMusic from "@/pages/localMusic";
import MusicListEditor from "@/pages/musicListEditor";
import FileSelector from "@/pages/fileSelector";
import History from "@/pages/history";
import SetCustomTheme from "@/pages/setCustomTheme";
import Permissions from "@/pages/permissions";
import { ROUTE_PATH } from "@/core/router/index.ts";

type ValueOf<T> = T[keyof T];
export type RoutePaths = ValueOf<typeof ROUTE_PATH>;

type IRoutes = {
  path: RoutePaths;
  component: (...args: any[]) => JSX.Element;
};


export const routes: Array<IRoutes> = [
    {
        path: ROUTE_PATH.HOME,
        component: Home,
    },
    {
        path: ROUTE_PATH.MUSIC_DETAIL,
        component: MusicDetail,
    },
    {
        path: ROUTE_PATH.LOCAL_SHEET_DETAIL,
        component: SheetDetail,
    },
    {
        path: ROUTE_PATH.SETTING,
        component: Setting,
    },
    {
        path: ROUTE_PATH.LOCAL,
        component: LocalMusic,
    },
    {
        path: ROUTE_PATH.MUSIC_LIST_EDITOR,
        component: MusicListEditor,
    },
    {
        path: ROUTE_PATH.FILE_SELECTOR,
        component: FileSelector,
    },
    {
        path: ROUTE_PATH.HISTORY,
        component: History,
    },
    {
        path: ROUTE_PATH.SET_CUSTOM_THEME,
        component: SetCustomTheme,
    },
    {
        path: ROUTE_PATH.PERMISSIONS,
        component: Permissions,
    },
];
