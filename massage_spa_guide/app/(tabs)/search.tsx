import { ScrollView, Text, View, Pressable, TextInput, FlatList } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import knowledgeData from "@/data/knowledge.json";
import { useState, useMemo } from "react";

export default function SearchScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase();
    return knowledgeData.knowledge.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.content.toLowerCase().includes(query) ||
        item.tags.some((tag) => tag.toLowerCase().includes(query))
    );
  }, [searchQuery]);

  const handleItemPress = (itemId: string) => {
    router.push({
      pathname: "/knowledge/[id]",
      params: { id: itemId },
    });
  };

  const renderResultItem = ({ item }: { item: (typeof knowledgeData.knowledge)[0] }) => {
    const category = knowledgeData.categories.find((c) => c.id === item.category);

    return (
      <Pressable
        onPress={() => handleItemPress(item.id)}
        style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
      >
        <View className="bg-surface rounded-xl p-4 mb-3 border border-border">
          <View className="flex-row items-start justify-between mb-2">
            <Text className="text-base font-semibold text-foreground flex-1">
              {item.title}
            </Text>
            <Text className="text-xs text-muted ml-2">{category?.name}</Text>
          </View>
          <Text className="text-sm text-muted leading-relaxed">
            {item.description}
          </Text>
          <View className="flex-row items-center gap-2 mt-3">
            <Text className="text-xs text-muted">⏱️ {item.readingTime} 分钟</Text>
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <ScreenContainer className="px-6">
      {/* Header */}
      <View className="pt-6 pb-4">
        <Text className="text-3xl font-bold text-foreground">搜索</Text>
        <Text className="text-sm text-muted mt-1">查找您感兴趣的内容</Text>
      </View>

      {/* Search Input */}
      <View className="mb-6">
        <View className="flex-row items-center bg-surface rounded-xl px-4 py-3 border border-border">
          <Text className="text-lg text-muted mr-2">🔍</Text>
          <TextInput
            placeholder="搜索文章、穴位、精油..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="flex-1 text-foreground"
          />
        </View>
      </View>

      {/* Results */}
      {searchQuery.trim() ? (
        <View className="flex-1">
          {searchResults.length > 0 ? (
            <FlatList
              data={searchResults}
              renderItem={renderResultItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingBottom: 24 }}
              ListHeaderComponent={
                <Text className="text-sm text-muted mb-4">
                  找到 {searchResults.length} 个结果
                </Text>
              }
            />
          ) : (
            <View className="flex-1 items-center justify-center py-12">
              <Text className="text-2xl mb-4">😕</Text>
              <Text className="text-foreground font-semibold">未找到结果</Text>
              <Text className="text-sm text-muted mt-2 text-center">
                尝试使用其他关键词搜索
              </Text>
            </View>
          )}
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View className="items-center justify-center py-12">
            <Text className="text-4xl mb-4">🔎</Text>
            <Text className="text-foreground font-semibold">开始搜索</Text>
            <Text className="text-sm text-muted mt-2 text-center">
              输入关键词来查找相关的知识内容
            </Text>
          </View>

          {/* Popular Searches */}
          <View className="mt-8">
            <Text className="text-lg font-semibold text-foreground mb-4">
              热门搜索
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {["薰衣草", "足三里", "泰式按摩", "穴位", "精油"].map(
                (tag, idx) => (
                  <Pressable
                    key={idx}
                    onPress={() => setSearchQuery(tag)}
                    style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
                  >
                    <View className="bg-surface px-4 py-2 rounded-full border border-border">
                      <Text className="text-sm text-foreground">{tag}</Text>
                    </View>
                  </Pressable>
                )
              )}
            </View>
          </View>
        </ScrollView>
      )}
    </ScreenContainer>
  );
}
