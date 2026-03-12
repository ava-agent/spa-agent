import { ScrollView, Text, View, Pressable } from "react-native";
import { useRouter, Stack } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { Ionicons } from "@expo/vector-icons";
import knowledgeData from "@/data/knowledge.json";

const mensArticles = knowledgeData.knowledge.filter(
  (k) => k.category === "mens-health"
);

const featuredTips = [
  {
    icon: "🗣️",
    title: "黑话术语",
    desc: "一次搞懂行话",
    color: "#E85D4C",
  },
  {
    icon: "🔍",
    title: "荤素辨别",
    desc: "一眼看懂门道",
    color: "#4A90A4",
  },
  {
    icon: "🛡️",
    title: "防坑避雷",
    desc: "少花冤枉钱",
    color: "#6BA587",
  },
  {
    icon: "💰",
    title: "消费参考",
    desc: "各档次价格一览",
    color: "#C85A54",
  },
];

const quickActions = [
  {
    icon: "book",
    title: "行业黑话速查",
    subtitle: "听不懂暗语？一篇全搞定",
    articleId: "mens-001",
    gradient: ["#E85D4C", "#C94A3A"],
  },
  {
    icon: "shield-checkmark",
    title: "防坑指南",
    subtitle: "老司机总结的避雷经验",
    articleId: "mens-005",
    gradient: ["#6BA587", "#4A8B6E"],
  },
  {
    icon: "navigate",
    title: "首次消费攻略",
    subtitle: "从进门到出门完整流程",
    articleId: "mens-004",
    gradient: ["#4A90A4", "#357ABD"],
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
          title: "男士 SPA 指南",
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
                  老司机指南
                </Text>
                <Text className="text-lg text-white/80 mb-1">
                  男士 SPA 消费百科
                </Text>
                <Text className="text-sm text-white/60">
                  黑话解读 / 防坑攻略 / 消费指南
                </Text>
              </View>
              <View className="w-20 h-20 rounded-full bg-white/10 items-center justify-center">
                <Text className="text-4xl">🧭</Text>
              </View>
            </View>

            {/* Stats */}
            <View className="flex-row mt-6 pt-4 border-t border-white/20">
              <View className="flex-1 items-center">
                <Text className="text-2xl font-bold text-white">8</Text>
                <Text className="text-xs text-white/60">实战攻略</Text>
              </View>
              <View className="flex-1 items-center border-l border-r border-white/20">
                <Text className="text-2xl font-bold text-white">50+</Text>
                <Text className="text-xs text-white/60">行业术语</Text>
              </View>
              <View className="flex-1 items-center">
                <Text className="text-2xl font-bold text-white">全国</Text>
                <Text className="text-xs text-white/60">城市覆盖</Text>
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
                  消费知识测试
                </Text>
                <Text className="text-sm text-muted mt-1">
                  8 道题测测你是不是老司机
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </View>
          </Pressable>
        </View>

        {/* Interactive Tools */}
        <View className="px-6 pb-4">
          <Text className="text-lg font-semibold text-foreground mb-3">
            互动体验
          </Text>
          <View className="gap-3">
            <Pressable
              onPress={() => router.push("/tools/scenario-sim" as any)}
              style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
            >
              <View
                className="rounded-2xl p-4 flex-row items-center overflow-hidden"
                style={{
                  backgroundColor: "#D4A57420",
                  borderWidth: 1,
                  borderColor: "#D4A57440",
                }}
              >
                <View className="w-12 h-12 rounded-xl items-center justify-center mr-4 bg-[#D4A574]">
                  <Text className="text-2xl">🎭</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-foreground">
                    情景模拟
                  </Text>
                  <Text className="text-sm text-muted mt-1">
                    6 大场景，每个选择影响结局
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#999" />
              </View>
            </Pressable>
            <Pressable
              onPress={() => router.push("/tools/technician-chat" as any)}
              style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
            >
              <View
                className="rounded-2xl p-4 flex-row items-center overflow-hidden"
                style={{
                  backgroundColor: "#4A90A420",
                  borderWidth: 1,
                  borderColor: "#4A90A440",
                }}
              >
                <View className="w-12 h-12 rounded-xl items-center justify-center mr-4 bg-[#4A90A4]">
                  <Text className="text-2xl">💬</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-foreground">
                    技师对话
                  </Text>
                  <Text className="text-sm text-muted mt-1">
                    AI 扮演技师，练习应对话术
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#999" />
              </View>
            </Pressable>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="px-6 pb-4">
          <Text className="text-lg font-semibold text-foreground mb-3">
            快速入门
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
            核心板块
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
            全部攻略
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
                本指南内容仅供信息参考。请遵守当地法律法规，注意人身安全和健康防护。
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
