import { ScrollView, Text, View, Pressable, FlatList } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import knowledgeData from "@/data/knowledge.json";
import { useState, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function FavoritesScreen() {
  const router = useRouter();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [])
  );

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const favs = await AsyncStorage.getItem("favorites");
      if (favs) {
        setFavorites(JSON.parse(favs));
      } else {
        setFavorites([]);
      }
    } catch (error) {
      console.error("Error loading favorites:", error);
    } finally {
      setLoading(false);
    }
  };

  const favoriteItems = knowledgeData.knowledge.filter((item) =>
    favorites.includes(item.id)
  );

  const handleItemPress = (itemId: string) => {
    router.push({
      pathname: "/knowledge/[id]",
      params: { id: itemId },
    });
  };

  const handleRemoveFavorite = async (itemId: string) => {
    try {
      const updated = favorites.filter((fav) => fav !== itemId);
      await AsyncStorage.setItem("favorites", JSON.stringify(updated));
      setFavorites(updated);
    } catch (error) {
      console.error("Error removing favorite:", error);
    }
  };

  const renderItem = ({ item }: { item: (typeof knowledgeData.knowledge)[0] }) => {
    const category = knowledgeData.categories.find((c) => c.id === item.category);

    return (
      <Pressable
        onPress={() => handleItemPress(item.id)}
        style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
      >
        <View className="bg-surface rounded-xl p-4 mb-3 border border-border">
          <View className="flex-row items-start justify-between mb-2">
            <View className="flex-1">
              <Text className="text-base font-semibold text-foreground">
                {item.title}
              </Text>
              <Text className="text-xs text-muted mt-1">{category?.name}</Text>
            </View>
            <Pressable
              onPress={() => handleRemoveFavorite(item.id)}
              style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
            >
              <Text className="text-lg">✕</Text>
            </Pressable>
          </View>
          <Text className="text-sm text-muted leading-relaxed">
            {item.description}
          </Text>
          <Text className="text-xs text-muted mt-3">
            ⏱️ {item.readingTime} 分钟阅读
          </Text>
        </View>
      </Pressable>
    );
  };

  if (loading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <Text className="text-foreground">加载中...</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="px-6">
      {/* Header */}
      <View className="pt-6 pb-4">
        <Text className="text-3xl font-bold text-foreground">收藏</Text>
        <Text className="text-sm text-muted mt-1">
          您已收藏 {favoriteItems.length} 篇文章
        </Text>
      </View>

      {/* Favorites List */}
      {favoriteItems.length > 0 ? (
        <FlatList
          data={favoriteItems}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 24 }}
        />
      ) : (
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View className="flex-1 items-center justify-center py-12">
            <Text className="text-4xl mb-4">📚</Text>
            <Text className="text-foreground font-semibold">还没有收藏</Text>
            <Text className="text-sm text-muted mt-2 text-center">
              点击文章上的心形按钮来收藏您喜欢的内容
            </Text>
          </View>
        </ScrollView>
      )}
    </ScreenContainer>
  );
}
