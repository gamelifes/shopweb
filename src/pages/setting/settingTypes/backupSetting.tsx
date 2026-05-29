import ListItem, { ListItemHeader } from "@/components/base/listItem";
import Backup from "@/core/backup";
import Config from "@/core/appConfig";
import { ROUTE_PATH, useNavigate } from "@/core/router";
import Toast from "@/utils/toast";
import React from "react";
import { ScrollView, StyleSheet } from "react-native";

import { showDialog } from "@/components/dialogs/useDialog";

import { ResumeMode } from "@/constants/commonConst";
import { useAppConfig } from "@/core/appConfig";
import { useI18N } from "@/core/i18n";
import delay from "@/utils/delay";
import { writeInChunks } from "@/utils/fileUtils.ts";
import { errorLog } from "@/utils/log.ts";
import { getDocumentAsync } from "expo-document-picker";
import { readAsStringAsync } from "expo-file-system";

export default function BackupSetting() {
    const { t } = useI18N();
    const navigate = useNavigate();

    const resumeMode = useAppConfig("backup.resumeMode");


    const onBackupToLocal = async () => {
        navigate(ROUTE_PATH.FILE_SELECTOR, {
            fileType: "folder",
            multi: false,
            actionText: t("backupAndResume.beginBackup"),
            async onAction(selectedFiles) {
                const raw = Backup.backup();
                const folder = selectedFiles[0]?.path;
                return new Promise(resolve => {
                    showDialog("LoadingDialog", {
                        title: t("backupAndResume.backupDialogTitle"),
                        loadingText: t("backupAndResume.backuping"),
                        promise: writeInChunks(
                            `${folder}${folder?.endsWith("/") ? "" : "/"
                            }backup.json`,
                            raw,
                        ),
                        onResolve(_, hideDialog) {
                            Toast.success(t("toast.backupSuccess"));
                            hideDialog();
                            resolve(true);
                        },
                        onCancel(hideDialog) {
                            hideDialog();
                            resolve(false);
                        },
                        onReject(reason, hideDialog) {
                            hideDialog();
                            resolve(false);
                            console.log(reason);
                            Toast.warn(t("toast.backupFail", { reason: reason?.message ?? reason }));
                        },
                    });
                });
            },
        });
    };

    async function onResumeFromLocal() {
        try {
            const pickResult = await getDocumentAsync({
                copyToCacheDirectory: true,
                type: "application/json",
            });
            if (pickResult.canceled) {
                return;
            }
            const result = await readAsStringAsync(pickResult.assets[0].uri);
            return new Promise(resolve => {
                showDialog("LoadingDialog", {
                    title: t("backupAndResume.resumeFromLocalFile"),
                    loadingText: t("backupAndResume.resuming"),
                    async task() {
                        await delay(300, false);
                        return Backup.resume(result, resumeMode);
                    },
                    onResolve(_, hideDialog) {
                        Toast.success(t("toast.resumeSuccess"));
                        hideDialog();
                        resolve(true);
                    },
                    onCancel(hideDialog) {
                        hideDialog();
                        resolve(false);
                    },
                    onReject(reason, hideDialog) {
                        hideDialog();
                        resolve(false);
                        console.log(reason);
                        Toast.warn(t("toast.resumeFail", { reason: reason?.message ?? reason }));
                    },
                });
            });
        } catch (e: any) {
            errorLog("恢复失败", e);
            Toast.warn(t("toast.resumeFail", { reason: e?.message ?? e }));
        }
    }



    return (
        <ScrollView style={style.wrapper}>
            <ListItemHeader>{t("sidebar.backupAndResume")}</ListItemHeader>

            <ListItem
                withHorizontalPadding
                onPress={() => {
                    showDialog("RadioDialog", {
                        title: t("backupAndResume.setResumeMode"),
                        content: [
                            {
                                label: t(("backupAndResume.resumeMode." + ResumeMode.Append) as any),
                                value: ResumeMode.Append,
                            },
                            {
                                label: t(("backupAndResume.resumeMode." + ResumeMode.OverwriteDefault) as any),
                                value: ResumeMode.OverwriteDefault,
                            },
                            {
                                label: t(("backupAndResume.resumeMode." + ResumeMode.Overwrite) as any),
                                value: ResumeMode.Overwrite,
                            },
                        ],
                        onOk(value) {
                            Config.setConfig(
                                "backup.resumeMode",
                                value as any,
                            );
                        },
                    });
                }}>
                <ListItem.Content title={t("backupAndResume.resumeMode")} />
                <ListItem.ListItemText>
                    {
                        t(("backupAndResume.resumeMode." + ((resumeMode as ResumeMode) ||
                            ResumeMode.Append)) as any)
                    }
                </ListItem.ListItemText>
            </ListItem>
            <ListItemHeader>{t("backupAndResume.localBackup")}</ListItemHeader>
            <ListItem withHorizontalPadding onPress={onBackupToLocal}>
                <ListItem.Content title={t("backupAndResume.backupToLocal")} />
            </ListItem>
            <ListItem withHorizontalPadding onPress={onResumeFromLocal}>
                <ListItem.Content title={t("backupAndResume.resumeFromLocalFile")} />
            </ListItem>
        </ScrollView>
    );
}

const style = StyleSheet.create({
    wrapper: {
        width: "100%",
        flex: 1,
    },
});
