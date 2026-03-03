import { ScrollView, Text, View, Pressable, Image } from "react-native";
import { useRouter, Stack } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { Ionicons } from "@expo/vector-icons";
import knowledgeData from "@/data/knowledge.json";

const mensArticles = knowledgeData.knowledge.filter(
  (k) => k.category === "mens-health"
);

const featuredTips = [
  {
    icon: "🔥",
    title: "补肾壮阳",
    desc: "关元、气海、命门",
    color: "#E85D4C",
  },
  {
    icon: "💪",
    title: "健身恢复",
    desc: "肌肉放松技巧",
    color: "#4A90A4",
  },
  {
    icon: "😌",
    title: "减压放松",
    desc: "职场压力释放",
    color: "#6BA587",
  },
  {
    icon: "💑",
    title: "互动按摩",
    desc: "增进感情秘诀",
    color: "#C85A54",
  },
];

const quickActions = [
  {
    icon: "fitness",
    title: "运动后恢复",
    subtitle: "肌肉酸痛？5分钟快速缓解",
    articleId: "mens-003",
    gradient: ["#4A90A4", "#357ABD"],
  },
  {
    icon: "moon",
    title: "睡前补肾",
    subtitle: "涌泉穴按摩，改善睡眠",
    articleId: "mens-001",
    gradient: ["#6B5B95", "#524A6B"],
  },
  {
    icon: "briefcase",
    title: "办公室减压",
    subtitle: "5分钟快速放松肩颈",
    articleId: "mens-004",
    gradient: ["#E85D4C", "#C94A3A"],
  },
];

export default function MensGuideScreen() {
  const router = useRouter();

  const handleArticlePress = (articleId: string) => {
    router.push({
      pathname: "/knowledge/[id]",
      params: { id: articleId },
    });
  };

  return (
    <ScreenContainer className="">
      <Stack.Screen
        options={{
          title: "男士按摩指南",
          headerBackTitle: "返回",
        }}
      />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="flex-1">
        {/* Hero Section */}
        <View className="px-6 pt-4 pb-6">
          <View
            className="rounded-3xl p-6 overflow-hidden"
            style={{
              backgroundColor: "#1a1a2e",
            }}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-1 pr-4">
                <Text className="text-3xl font-bold text-white mb-2">
                  男士专属
                </Text>
                <Text className="text-lg text-white/80 mb-1">
                  健康养生按摩秘籍
                </Text>
                <Text className="text-sm text-white/60">
                  传统中医智慧 × 现代生活方式
                </Text>
              </View>
              <View className="w-20 h-20 rounded-full bg-white/10 items-center justify-center">
                <Text className="text-4xl">💪</Text>
              </View>
            </View>

            {/* Stats */}
            <View className="flex-row mt-6 pt-4 border-t border-white/20">
              <View className="flex-1 items-center">
                <Text className="text-2xl font-bold text-white">8</Text>
                <Text className="text-xs text-white/60">专业文章</Text>
              </View>
              <View className="flex-1 items-center border-l border-r border-white/20">
                <Text className="text-2xl font-bold text-white">20+</Text>
                <Text className="text-xs text-white/60">核心穴位</Text>
              </View>
              <View className="flex-1 items-center">
                <Text className="text-2xl font-bold text-white">5min</Text>
                <Text className="text-xs text-white/60">快速见效</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Quiz Entry */}
        <View className="px-6 pb-4">
          <Pressable
            onPress={() => router.push("/tools/mens-quiz" as any)}
            style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
          >
            <View
              className="rounded-2xl p-4 flex-row items-center overflow-hidden"
              style={{
                backgroundColor: "#6B5B9520",
                borderWidth: 1,
                borderColor: "#6B5B9540",
              }}
            >
              <View className="w-12 h-12 rounded-xl items-center justify-center mr-4 bg-[#6B5B95]">
                <Text className="text-2xl">🧠</Text>
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-foreground">
                  知识问答挑战
                </Text>
                <Text className="text-sm text-muted mt-1">
                  8 道题测试你的按摩知识
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </View>
          </Pressable>
        </View>

        {/* Quick Actions */}
        <View className="px-6 pb-4">
          <Text className="text-lg font-semibold text-foreground mb-3">
            快速开始
          </Text>
          <View className="gap-3">
            {quickActions.map((action, index) => (
              <Pressable
                key={index}
                onPress={() => handleArticlePress(action.articleId)}
                style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
              >
                <View
                  className="rounded-2xl p-4 flex-row items-center"
                  style={{
                    backgroundColor: action.gradient[0] + "15",
                    borderWidth: 1,
                    borderColor: action.gradient[0] + "40",
                  }}
                >
                  <View
                    className="w-12 h-12 rounded-xl items-center justify-center mr-4"
                    style={{ backgroundColor: action.gradient[0] }}
                  >
                    <Ionicons name={action.icon as any} size={24} color="white" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-foreground">
                      {action.title}
                    </Text>
                    <Text className="text-sm text-muted mt-1">
                      {action.subtitle}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#999" />
                </View>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Featured Tips */}
        <View className="px-6 pb-4">
          <Text className="text-lg font-semibold text-foreground mb-3">
            核心功效
          </Text>
          <View className="flex-row flex-wrap gap-3">
            {featuredTips.map((tip, index) => (
              <View
                key={index}
                className="rounded-2xl p-4 border border-border"
                style={{
                  backgroundColor: tip.color + "10",
                  width: "48%",
                }}
              >
                <Text className="text-3xl mb-2">{tip.icon}</Text>
                <Text className="text-base font-semibold text-foreground">
                  {tip.title}
                </Text>
                <Text className="text-xs text-muted mt-1">{tip.desc}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* All Articles */}
        <View className="px-6 pb-2">
          <Text className="text-lg font-semibold text-foreground mb-3">
            全部文章
          </Text>
        </View>
        <View className="px-6 pb-8">
          <View className="gap-3">
            {mensArticles.map((article) => (
              <Pressable
                key={article.id}
                onPress={() => handleArticlePress(article.id)}
                style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
              >
                <View className="rounded-2xl p-4 border border-border bg-surface">
                  <View className="flex-row items-start">
                    <View className="flex-1 pr-3">
                      <Text className="text-base font-semibold text-foreground">
                        {article.title}
                      </Text>
                      <Text className="text-sm text-muted mt-2 leading-relaxed">
                        {article.description}
                      </Text>
                      <View className="flex-row items-center mt-3 gap-3">
                        <Text className="text-xs text-muted">
                          {article.readingTime} 分钟阅读
                        </Text>
                        <View className="flex-row gap-1">
                          {article.tags.slice(0, 2).map((tag, i) => (
                            <View
                              key={i}
                              className="px-2 py-0.5 rounded-full"
                              style={{ backgroundColor: "#4A90A420" }}
                            >
                              <Text className="text-xs text-[#4A90A4]">
                                {tag}
                              </Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#999" />
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Disclaimer */}
        <View className="px-6 pb-8">
          <View className="rounded-2xl p-4 border border-border bg-surface">
            <View className="flex-row items-start">
              <Ionicons name="information-circle" size={20} color="#999" />
              <Text className="text-xs text-muted ml-2 flex-1 leading-relaxed">
                本指南内容仅供参考，不能替代专业医疗建议。如有健康问题，请咨询专业医生。
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
