import { Text, View, Pressable, FlatList } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import knowledgeData from "@/data/knowledge.json";

export default function CategoryScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const category = knowledgeData.categories.find((cat) => cat.id === id);
  const items = knowledgeData.knowledge.filter((item) => item.category === id);

  if (!category) {
    return (
      <ScreenContainer className="items-center justify-center">
        <Text className="text-foreground">分类未找到</Text>
      </ScreenContainer>
    );
  }

  const handleItemPress = (itemId: string) => {
    router.push({
      pathname: "/knowledge/[id]",
      params: { id: itemId },
    });
  };

  const renderItem = ({ item }: { item: (typeof knowledgeData.knowledge)[0] }) => (
    <Pressable
      onPress={() => handleItemPress(item.id)}
      style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
    >
      <View className="bg-surface rounded-xl p-4 mb-3 border border-border">
        <Text className="text-base font-semibold text-foreground">{item.title}</Text>
        <Text className="text-sm text-muted mt-2 leading-relaxed">
          {item.description}
        </Text>
        <View className="flex-row items-center justify-between mt-3">
          <Text className="text-xs text-muted">
            阅读时间: {item.readingTime} 分钟
          </Text>
          <View className="flex-row gap-2">
            {item.tags.slice(0, 2).map((tag, idx) => (
              <View
                key={idx}
                className="bg-primary/20 px-2 py-1 rounded-full"
              >
                <Text className="text-xs text-foreground">{tag}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </Pressable>
  );

  return (
    <ScreenContainer className="px-6">
      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 24 }}
        ListHeaderComponent={
          <>
            {/* Header */}
            <View className="flex-row items-center gap-3 pt-4 pb-6">
              <Pressable
                onPress={() => router.back()}
                style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
              >
                <Text className="text-2xl text-foreground">←</Text>
              </Pressable>
              <View className="flex-1">
                <Text className="text-2xl font-bold text-foreground">
                  {category.name}
                </Text>
                <Text className="text-sm text-muted mt-1">
                  {items.length} 篇文章
                </Text>
              </View>
            </View>

            {/* Category Description */}
            <View className="mb-6 p-4 rounded-xl border border-border bg-surface">
              <Text className="text-sm text-foreground leading-relaxed">
                {category.description}
              </Text>
            </View>
          </>
        }
      />
    </ScreenContainer>
  );
}
