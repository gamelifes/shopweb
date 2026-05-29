import BackupSetting from "./backupSetting";
import BasicSetting from "./basicSetting";
import ThemeSetting from "./themeSetting";

const settingTypes: Record<
    string,
    {
        title: string;
        component: (...args: any) => JSX.Element;
        showNav?: boolean;
        i18nKey: string;
    }
> = {
    basic: {
        title: "基本设置",
        i18nKey: "sidebar.basicSettings",
        component: BasicSetting,
    },
    theme: {
        title: "主题设置",
        i18nKey: "sidebar.themeSettings",
        component: ThemeSetting,
    },
    backup: {
        title: "备份与恢复",
        i18nKey: "sidebar.backupAndResume",
        component: BackupSetting,
    },
};

export default settingTypes;
