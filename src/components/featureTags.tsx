import React from "react";
import { StyleSheet, View } from "react-native";
import { useAtom } from "jotai";
import { soundEffectAtom, qualityAtom, aiModeAtom } from "@/store/featureTagsAtom";
import Tag from "@/components/base/tag";
import useColors from "@/hooks/useColors";

export default function FeatureTags() {
  const colors = useColors();
  const [soundEffect, setSoundEffect] = useAtom(soundEffectAtom);
  const [quality, setQuality] = useAtom(qualityAtom);
  const [aiMode, setAiMode] = useAtom(aiModeAtom);

  return (
    <View style={styles.container}>
      <Tag
        tagName={soundEffect ? "音效 on" : "音效 off"}
        containerStyle={[
          styles.tag,
          soundEffect ? styles.activeTag : styles.inactiveTag,
        ]}
        style={styles.tagText}
        onPress={() => setSoundEffect(!soundEffect)}
      />
      <Tag
        tagName={quality === "标准" ? "高质量" : "标准"}
        containerStyle={[
          styles.tag,
          quality === "高质量" ? styles.activeTag : styles.inactiveTag,
        ]}
        style={styles.tagText}
        onPress={() =>
          setQuality(quality === "标准" ? "高质量" : "标准")
        }
      />
      <Tag
        tagName={aiMode ? "AI模式 on" : "AI模式 off"}
        containerStyle={[
          styles.tag,
          aiMode ? styles.activeTag : styles.inactiveTag,
        ]}
        style={styles.tagText}
        onPress={() => setAiMode(!aiMode)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
  },
  tag: {
    borderRadius: 6,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  activeTag: {
    backgroundColor: "#EFF6FF", // light blue tint
    borderColor: "#006EFF",
  },
  inactiveTag: {
    backgroundColor: "transparent",
    borderColor: "#D1D5DB",
  },
  tagText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#6B7280",
  },
});