import { ScrollView, Text, View, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { ChallengeCard } from "@/components/challenge-card";
import knowledgeData from "@/data/knowledge.json";

export default function HomeScreen() {
  const router = useRouter();

  const handleCategoryPress = (categoryId: string) => {
    router.push({
      pathname: "/category/[id]",
      params: { id: categoryId },
    });
  };

  return (
    <ScreenContainer className="">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="flex-1">
        {/* Header */}
        <View className="px-6 pt-6 pb-4">
          <Text className="text-3xl font-bold text-foreground">按摩 SPA 知识大全</Text>
          <Text className="text-sm text-muted mt-2">探索按摩、精油、穴位与养生知识</Text>
        </View>

        {/* Daily Challenge Card */}
        <View className="px-6 pb-4">
          <ChallengeCard />
        </View>

        {/* Tools Row */}
        <View className="px-6 pb-6">
          <Text className="text-lg font-semibold text-foreground mb-3">实用工具</Text>
          <View className="flex-row gap-3">
            <Pressable
              onPress={() => router.push("/tools/symptom-match")}
              className="flex-1"
              style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
            >
              <View
                className="rounded-2xl p-4 border border-border items-center"
                style={{ backgroundColor: "#D4A57420" }}
              >
                <Text className="text-3xl mb-2">🩺</Text>
                <Text className="text-sm font-semibold text-foreground">症状速配</Text>
                <Text className="text-xs text-muted mt-1">3 步匹配方案</Text>
              </View>
            </Pressable>
            <Pressable
              onPress={() => router.push("/tools/acupoint-timer")}
              className="flex-1"
              style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
            >
              <View
                className="rounded-2xl p-4 border border-border items-center"
                style={{ backgroundColor: "#6BA58720" }}
              >
                <Text className="text-3xl mb-2">⏱️</Text>
                <Text className="text-sm font-semibold text-foreground">穴位计时器</Text>
                <Text className="text-xs text-muted mt-1">跟随节奏按摩</Text>
              </View>
            </Pressable>
          </View>
        </View>

        {/* Knowledge Categories */}
        <View className="px-6 pb-2">
          <Text className="text-lg font-semibold text-foreground mb-3">知识分类</Text>
        </View>
        <View className="px-6 pb-8">
          <View className="gap-4 sm:flex-row sm:flex-wrap">
            {knowledgeData.categories.map((category) => (
              <Pressable
                key={category.id}
                onPress={() => handleCategoryPress(category.id)}
                className="sm:w-[48%]"
                style={({ pressed }) => [{
                  opacity: pressed ? 0.7 : 1,
                }]}
              >
                <View
                  className="rounded-2xl p-5 border border-border"
                  style={{ backgroundColor: category.color + "20" }}
                >
                  <View className="flex-row items-start justify-between">
                    <View className="flex-1 pr-4">
                      <Text className="text-lg font-semibold text-foreground">
                        {category.name}
                      </Text>
                      <Text className="text-sm text-muted mt-2 leading-relaxed">
                        {category.description}
                      </Text>
                    </View>
                    <View
                      className="w-12 h-12 rounded-full items-center justify-center"
                      style={{ backgroundColor: category.color }}
                    >
                      <Text className="text-2xl">→</Text>
                    </View>
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
