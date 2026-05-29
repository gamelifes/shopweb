import { useNavigation, useRoute } from "@react-navigation/native";
import { useCallback } from "react";
import { LogBox } from "react-native";

LogBox.ignoreLogs([
    "Non-serializable values were found in the navigation state",
]);

/** 路由key */
export const ROUTE_PATH = {
    /** 主页 */
    HOME: "home",
    /** 音乐播放页 */
    MUSIC_DETAIL: "music-detail",
    /** 本地歌单页 */
    LOCAL_SHEET_DETAIL: "local-sheet-detail",
    /** 设置页 */
    SETTING: "setting",
    /** 本地音乐 */
    LOCAL: "local",
    /** 批量编辑 */
    MUSIC_LIST_EDITOR: "music-list-editor",
    /** 选择文件夹 */
    FILE_SELECTOR: "file-selector",
    /** 历史记录 */
    HISTORY: "history",
    /** 自定义主题 */
    SET_CUSTOM_THEME: "set-custom-theme",
    /** 权限管理 */
    PERMISSIONS: "permissions",
} as const;

type ValueOf<T> = T[keyof T];
type RoutePaths = ValueOf<typeof ROUTE_PATH>;

type RouterParamsBase = Record<RoutePaths, any>;
/** 路由参数 */
interface RouterParams extends RouterParamsBase {
    home: undefined;
    "music-detail": undefined;
    "local-sheet-detail": {
        id: string;
    };
    setting: {
        type: string;
    };
    local: undefined;
    "music-list-editor": {
        musicSheet?: Partial<IMusic.IMusicSheetItem>;
        musicList: IMusic.IMusicItem[] | null;
    };
    "file-selector": {
        fileType?: "folder" | "file" | "file-and-folder";
        multi?: boolean;
        actionText?: string;
        actionIcon?: string;
        onAction?: (
            selectedFiles: {
                path: string;
                type: "file" | "folder";
            }[],
        ) => Promise<boolean>;
        matchExtension?: (path: string) => boolean;
    };
}

/** 路由参数Hook */
export function useParams<T extends RoutePaths>(): RouterParams[T] {
    const route = useRoute<any>();

    const routeParams = route?.params as RouterParams[T];
    return routeParams;
}

/** 导航 */
export function useNavigate() {
    const navigation = useNavigation<any>();

    const navigate = useCallback(function <T extends RoutePaths>(
        route: T,
        params?: RouterParams[T],
    ) {
        navigation.navigate(route, params);
    },
    []);

    return navigate;
}
