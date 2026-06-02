import { atom } from "jotai";

export const soundEffectAtom = atom(false); // false: off, true: on
export const qualityAtom = atom<"标准" | "高质量">("标准");
export const aiModeAtom = atom(false); // false: off, true: on