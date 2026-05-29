import AddToMusicSheet from "./addToMusicSheet";
import AssociateLrc from "./associateLrc";
import ColorPicker from "./colorPicker";
import MusicQuality from "./musicQuality";
import CreateMusicSheet from "./createMusicSheet";
import PlayList from "./playList";
import PlayRate from "./playRate";
import SetFontSize from "./setFontSize";
import SetLyricOffset from "./setLyricOffset";
import SheetTags from "./sheetTags";
import SimpleInput from "./simpleInput";
import SimpleSelect from "./simpleSelect";
import TimingClose from "./timingClose";
import ImageViewer from "./imageViewer";
import MusicItemLyricOptions from "./musicItemLyricOptions";
import EditMusicSheetInfo from "./editMusicSheetInfo";

export default {
    /** 加入歌单 */
    AddToMusicSheet,
    /** 新建歌单 */
    CreateMusicSheet,
    /** 当前播放列表 */
    PlayList: PlayList,
    /** 关联歌词 */
    AssociateLrc,
    /** 简单的输入 */
    SimpleInput,
    /** 定时关闭 */
    TimingClose,
    /** 音质选择 */
    MusicQuality,
    /** 播放速度 */
    PlayRate,
    /** 歌单tag */
    SheetTags,
    /** 简单的选择 */
    SimpleSelect,
    /** 颜色选择器 */
    ColorPicker,
    /** 设置字体 */
    SetFontSize,
    /** 设置歌词偏移 */
    SetLyricOffset,
    /** 图片阅读器 */
    ImageViewer,
    MusicItemLyricOptions,
    EditMusicSheetInfo,
};
