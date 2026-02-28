import { ScreenContainer } from "@/components/screen-container";
import { StreakCalendar } from "@/components/streak-calendar";
import { useDailyChallenge } from "@/hooks/use-daily-challenge";
import challengesData from "@/data/challenges.json";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";

export default function ChallengeStatsScreen() {
  const router = useRouter();
  const { streak, totalCompleted, completedDates, getWeekDates } = useDailyChallenge();

  // Group completions by category
  const categoryStats: Record<string, number> = {};
  for (const date of completedDates) {
    const daysSinceEpoch = Math.floor(new Date(date).getTime() / 86400000);
    const index = daysSinceEpoch % challengesData.challenges.length;
    const challenge = challengesData.challenges[index];
    categoryStats[challenge.category] = (categoryStats[challenge.category] || 0) + 1;
  }

  const categoryNames: Record<string, string> = {
    acupoints: "穴位按摩",
    oils: "精油芳疗",
    techniques: "按摩技法",
    "spa-etiquette": "SPA 礼仪",
    basics: "基础知识",
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="flex-1">
        <View className="px-6 pt-4 pb-2 flex-row items-center">
          <Pressable onPress={() => router.back()} style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}>
            <Text className="text-2xl text-primary mr-3">←</Text>
          </Pressable>
          <Text className="text-2xl font-bold text-foreground">挑战统计</Text>
        </View>

        {/* Week calendar */}
        <View className="px-6 pt-4 pb-4">
          <StreakCalendar weekDates={getWeekDates()} streak={streak} totalCompleted={totalCompleted} />
        </View>

        {/* Category breakdown */}
        <View className="px-6 pb-4">
          <Text className="text-lg font-semibold text-foreground mb-3">分类统计</Text>
          <View className="gap-3">
            {Object.entries(categoryStats).map(([cat, count]) => (
              <View key={cat} className="bg-surface rounded-xl p-4 border border-border flex-row items-center justify-between">
                <Text className="text-base text-foreground">{categoryNames[cat] ?? cat}</Text>
                <Text className="text-base font-semibold text-primary">{count} 次</Text>
              </View>
            ))}
            {Object.keys(categoryStats).length === 0 && (
              <View className="items-center py-8">
                <Text className="text-base text-muted">还没有完成记录</Text>
                <Text className="text-sm text-muted mt-1">完成今日挑战开始积累吧</Text>
              </View>
            )}
          </View>
        </View>

        {/* Recent completions */}
        <View className="px-6 pb-8">
          <Text className="text-lg font-semibold text-foreground mb-3">最近完成</Text>
          <View className="gap-2">
            {[...completedDates]
              .sort()
              .reverse()
              .slice(0, 10)
              .map((date) => {
                const daysSinceEpoch = Math.floor(new Date(date).getTime() / 86400000);
                const index = daysSinceEpoch % challengesData.challenges.length;
                const challenge = challengesData.challenges[index];
                return (
                  <View key={date} className="bg-surface rounded-xl p-3 border border-border flex-row items-center gap-3">
                    <Text className="text-2xl">{challenge.icon}</Text>
                    <View className="flex-1">
                      <Text className="text-sm font-medium text-foreground">{challenge.title}</Text>
                      <Text className="text-xs text-muted">{date}</Text>
                    </View>
                    <Text className="text-sm text-green-600">✓</Text>
                  </View>
                );
              })}
            {completedDates.length === 0 && (
              <View className="items-center py-8">
                <Text className="text-base text-muted">暂无记录</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
