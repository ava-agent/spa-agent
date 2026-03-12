import { ScrollView, Text, View, Pressable } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import knowledgeData from "@/data/knowledge.json";
import { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function KnowledgeScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [isFavorited, setIsFavorited] = useState(false);

  const item = knowledgeData.knowledge.find((k) => k.id === id);
  const category = knowledgeData.categories.find((c) => c.id === item?.category);

  const checkFavorite = useCallback(async () => {
    try {
      const favorites = await AsyncStorage.getItem("favorites");
      if (favorites) {
        const favList = JSON.parse(favorites);
        setIsFavorited(favList.includes(id));
      }
    } catch (error) {
      console.error("Error checking favorite:", error);
    }
  }, [id]);

  useEffect(() => {
    checkFavorite();
  }, [checkFavorite]);

  const toggleFavorite = async () => {
    try {
      const favorites = await AsyncStorage.getItem("favorites");
      let favList = favorites ? JSON.parse(favorites) : [];

      if (isFavorited) {
        favList = favList.filter((fav: string) => fav !== id);
      } else {
        if (!favList.includes(id)) {
          favList.push(id);
        }
      }

      await AsyncStorage.setItem("favorites", JSON.stringify(favList));
      setIsFavorited(!isFavorited);
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  if (!item) {
    return (
      <ScreenContainer className="items-center justify-center">
        <Text className="text-foreground">文章未找到</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="px-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="sm:max-w-2xl sm:self-center sm:w-full">
        {/* Header */}
        <View className="flex-row items-center gap-3 pt-4 pb-6">
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
          >
            <Text className="text-2xl text-foreground">←</Text>
          </Pressable>
          <View className="flex-1">
            <Text className="text-sm text-muted">{category?.name}</Text>
          </View>
          <Pressable
            onPress={toggleFavorite}
            style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
          >
            <Text className="text-2xl">{isFavorited ? "❤️" : "🤍"}</Text>
          </Pressable>
        </View>

        {/* Title */}
        <Text className="text-3xl font-bold text-foreground mb-4">
          {item.title}
        </Text>

        {/* Meta Info */}
        <View className="flex-row items-center gap-4 mb-6 pb-6 border-b border-border">
          <Text className="text-sm text-muted">
            📅 {new Date(item.publishedAt).toLocaleDateString("zh-CN")}
          </Text>
          <Text className="text-sm text-muted">⏱️ {item.readingTime} 分钟</Text>
        </View>

        {/* Tags */}
        <View className="flex-row flex-wrap gap-2 mb-6">
          {item.tags.map((tag, idx) => (
            <View
              key={idx}
              className="bg-primary/20 px-3 py-1 rounded-full"
            >
              <Text className="text-xs text-foreground font-medium">{tag}</Text>
            </View>
          ))}
        </View>

        {/* Content */}
        <View className="mb-8">
          {item.content.split("\n\n").map((paragraph, idx) => {
            const colonIndex = paragraph.indexOf("：");
            const isSubHeading = colonIndex > 0 && colonIndex <= 10 && paragraph.length > colonIndex + 1;

            if (isSubHeading) {
              const heading = paragraph.substring(0, colonIndex + 1);
              const body = paragraph.substring(colonIndex + 1).trim();
              return (
                <View key={idx} className="mb-4">
                  <Text className="text-base font-semibold text-foreground mb-1">
                    {heading}
                  </Text>
                  <Text className="text-base text-foreground leading-relaxed">
                    {body}
                  </Text>
                </View>
              );
            }

            return (
              <Text
                key={idx}
                className="text-base text-foreground leading-relaxed mb-4"
              >
                {paragraph}
              </Text>
            );
          })}
        </View>

        {/* Related Items */}
        <View className="mt-8 pt-6 border-t border-border">
          <Text className="text-lg font-semibold text-foreground mb-4">
            相关推荐
          </Text>
          <View className="gap-3">
            {knowledgeData.knowledge
              .filter((k) => k.category === item.category && k.id !== item.id)
              .slice(0, 3)
              .map((relatedItem) => (
                <Pressable
                  key={relatedItem.id}
                  onPress={() => {
                    router.push({
                      pathname: "/knowledge/[id]",
                      params: { id: relatedItem.id },
                    });
                  }}
                  style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                >
                  <View className="bg-surface rounded-lg p-3 border border-border">
                    <Text className="text-sm font-semibold text-foreground">
                      {relatedItem.title}
                    </Text>
                    <Text className="text-xs text-muted mt-1">
                      {relatedItem.readingTime} 分钟阅读
                    </Text>
                  </View>
                </Pressable>
              ))}
          </View>
        </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
