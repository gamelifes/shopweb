import { atom } from "jotai";

/** 音效是否启用 */
export const soundEffectEnabledAtom = atom<boolean>(false);

/** 设备是否支持音效 */
export const soundEffectSupportedAtom = atom<boolean>(false);

/** 初始化标志 */
export const eqInitializedAtom = atom<boolean>(false);

/** 均衡器状态（方案D：不再维护精细滑块数据） */
export interface IEqState {
    currentPreset: number;
    presetNames: string[];
}

export const eqStateAtom = atom<IEqState>({
    currentPreset: -1,
    presetNames: [],
});
