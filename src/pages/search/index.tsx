import React, { useEffect, useState, useMemo } from "react";
import {
    StyleSheet,
    View,
    TextInput,
    TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useI18N } from "@/core/i18n";
import { useParams } from "@/core/router";
import useColors from "@/hooks/useColors";
import ThemeText from "@/components/base/themeText";
import MusicList from "@/components/musicList";
import MusicBar from "@/components/musicBar";
import LocalMusicSheet from "@/core/localMusicSheet";
import { debounce } from "lodash";
import { RequestStateCode } from "@/constants/commonConst";

export default function SearchPage() {
    const { t } = useI18N();
    const navigation = useNavigation();
    const { keyword: initialKeyword } = useParams<"search">();

    const colors = useColors();
    const [keyword, setKeyword] = useState(initialKeyword ?? "");
    const [results, setResults] = useState<IMusic.IMusicItem[]>([]);
    const [loading, setLoading] = useState(false);

    // 搜索本地音乐库
    const performSearch = useMemo(
        () =>
            debounce(async (query: string) => {
                if (!query.trim()) {
                    setResults([]);
                    setLoading(false);
                    return;
                }
                setLoading(true);
                try {
                    const all = LocalMusicSheet.getMusicList();
                    const q = query.toLowerCase();
                    const matched = all.filter(
                        m =>
                            m.title?.toLowerCase().includes(q) ||
                            m.artist?.toLowerCase().includes(q) ||
                            m.album?.toLowerCase().includes(q),
                    );
                    setResults(matched);
                } catch (e) {
                    console.warn("Search failed:", e);
                    setResults([]);
                } finally {
                    setLoading(false);
                }
            }, 300),
        [],
    );

    useEffect(() => {
        if (keyword) {
            performSearch(keyword);
        }
    }, [keyword]);

    // 标题栏返回
    useEffect(() => {
        navigation.setOptions({
            header: undefined, // 使用默认 AppBar 或无 header
        });
    }, []);

    return (
        <View style={[styles.container, { backgroundColor: colors.pageBackground }]}>
            {/* Search Input Bar */}
            <View style={[styles.searchBar, { backgroundColor: colors.card, borderBottomColor: colors.divider }]}>
                <ThemeText fontSize="tag" fontColor="textSecondary">
                    🔍
                </ThemeText>
                <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder={t("common.search") || "搜索"}
                    placeholderTextColor={colors.textSecondary}
                    value={keyword}
                    onChangeText={setKeyword}
                    autoFocus
                    returnKeyType="search"
                />
                {keyword ? (
                    <TouchableOpacity onPress={() => setKeyword("")}>
                        <ThemeText fontSize="subTitle" fontColor="textSecondary">
                            ✕
                        </ThemeText>
                    </TouchableOpacity>
                ) : null}
            </View>

            {/* Results */}
            <MusicList
                musicList={results}
                showIndex={false}
                state={loading ? RequestStateCode.LOADING : RequestStateCode.IDLE}
                musicSheet={{
                    id: "search-results",
                    title: keyword ? `${t("common.search")}: ${keyword}` : t("common.search"),
                    platform: "local",
                    musicList: results,
                }}
            />
            <MusicBar />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    searchBar: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        zIndex: 10,
    },
    input: {
        flex: 1,
        fontSize: 16,
        padding: 0,
        margin: 0,
    },
});
