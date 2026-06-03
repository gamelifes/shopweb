import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import rpx from "@/utils/rpx";
import AlbumCover from "./albumCover";
import Lyric from "./lyric";
import useOrientation from "@/hooks/useOrientation";
import Config from "@/core/appConfig";
import globalStyle from "@/constants/globalStyle";
import { useCurrentLyricItem, useLyricState } from "@/core/lyricManager";
import { useCurrentMusic } from "@/core/trackPlayer";

function LyricsPreview() {
    const currentLrcItem = useCurrentLyricItem();
    const { lyrics } = useLyricState();
    const musicItem = useCurrentMusic();

    if (!lyrics || lyrics.length === 0 || !musicItem) return null;

    const currentIndex = currentLrcItem?.index ?? -1;

    // Show 3 lines: one past, current, one next
    const previewLines: Array<{ lrc: string; isActive: boolean; isPast: boolean }> = [];
    for (let i = -1; i <= 1; i++) {
        const idx = currentIndex + i;
        if (idx >= 0 && idx < lyrics.length) {
            previewLines.push({
                lrc: lyrics[idx].lrc,
                isActive: i === 0,
                isPast: i < 0,
            });
        }
    }

    if (previewLines.length === 0) return null;

    return (
        <View style={styles.lyricsPreview}>
            {previewLines.map((line, index) => (
                <Text
                    key={index}
                    style={[
                        styles.lyricLine,
                        line.isActive && styles.lyricLineActive,
                        line.isPast && styles.lyricLinePast,
                    ]}
                    numberOfLines={1}>
                    {line.lrc}
                </Text>
            ))}
        </View>
    );
}

export default function Content() {
    const [tab, selectTab] = useState<"album" | "lyric">(
        Config.getConfig("basic.musicDetailDefault") || "album",
    );
    const orientation = useOrientation();
    const showAlbumCover = tab === "album" || orientation === "horizontal";

    const onTurnPageClick = () => {
        if (orientation === "horizontal") {
            return;
        }
        if (tab === "album") {
            selectTab("lyric");
        } else {
            selectTab("album");
        }
    };

    if (showAlbumCover) {
        return (
            <View style={styles.wrapper}>
                <View style={styles.centerArea}>
                    <AlbumCover onTurnPageClick={onTurnPageClick} />
                    <LyricsPreview />
                </View>
            </View>
        );
    }

    return (
        <View style={globalStyle.fwflex1}>
            <Lyric onTurnPageClick={onTurnPageClick} />
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    centerArea: {
        alignItems: "center",
        justifyContent: "center",
    },
    lyricsPreview: {
        marginTop: rpx(24),
        alignItems: "center",
        paddingHorizontal: rpx(40),
    },
    lyricLine: {
        fontSize: rpx(14),
        color: "rgba(255,255,255,0.35)",
        lineHeight: rpx(22),
        marginVertical: rpx(2),
        textAlign: "center",
    },
    lyricLineActive: {
        color: "white",
        fontWeight: "600",
        fontSize: rpx(15),
    },
    lyricLinePast: {
        color: "rgba(255,255,255,0.2)",
    },
});
