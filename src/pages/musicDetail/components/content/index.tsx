import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import AlbumCover from "./albumCover";
import Lyric from "./lyric";
import useOrientation from "@/hooks/useOrientation";
import Config from "@/core/appConfig";
import globalStyle from "@/constants/globalStyle";

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
});
