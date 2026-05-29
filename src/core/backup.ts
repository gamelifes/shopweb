/** 备份与恢复 - 仅歌单 */
import MusicSheet from "@/core/musicSheet";
import { ResumeMode } from "@/constants/commonConst.ts";

interface IBackJson {
    musicSheets: IMusic.IMusicSheetItem[];
}

function backup() {
    const musicSheets = MusicSheet.backupSheets();

    return JSON.stringify({
        musicSheets: musicSheets,
    });
}

async function resume(
    raw: string | Object,
    resumeMode: ResumeMode = ResumeMode.Append,
) {
    let obj: IBackJson;
    if (typeof raw === "string") {
        obj = JSON.parse(raw);
    } else {
        obj = raw as IBackJson;
    }

    const { musicSheets } = obj ?? {};
    /** 恢复歌单 */
    return MusicSheet.resumeSheets(musicSheets, resumeMode);
}

const Backup = {
    backup,
    resume,
};
export default Backup;
