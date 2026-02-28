import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { useDailyChallenge } from "@/hooks/use-daily-challenge";

export function ChallengeCard() {
  const router = useRouter();
  const { todayChallenge, isCompletedToday, streak } = useDailyChallenge();

  return (
    <Pressable
      onPress={() => router.push("/tools/daily-challenge")}
      style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
    >
      <View
        className="rounded-2xl p-5 border border-border"
        style={{ backgroundColor: isCompletedToday ? "#6BA58720" : "#D4A57420" }}
      >
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-row items-center gap-2">
            <Text className="text-2xl">{todayChallenge.icon}</Text>
            <Text className="text-sm font-medium text-muted">今日挑战</Text>
          </View>
          {streak > 0 && (
            <View className="flex-row items-center gap-1 bg-surface rounded-full px-3 py-1">
              <Text className="text-sm">🔥</Text>
              <Text className="text-sm font-semibold text-foreground">{streak} 天</Text>
            </View>
          )}
        </View>

        <Text className="text-lg font-semibold text-foreground">{todayChallenge.title}</Text>
        <Text className="text-sm text-muted mt-1">{todayChallenge.description}</Text>

        <View className="flex-row items-center justify-between mt-3">
          <Text className="text-xs text-muted">
            ⏱️ {Math.ceil(todayChallenge.durationSeconds / 60)} 分钟
          </Text>
          {isCompletedToday ? (
            <View className="bg-green-600 rounded-full px-3 py-1">
              <Text className="text-xs font-semibold text-white">✓ 已完成</Text>
            </View>
          ) : (
            <View className="bg-primary rounded-full px-3 py-1">
              <Text className="text-xs font-semibold text-white">开始挑战 →</Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}
