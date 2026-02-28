import { ScreenContainer } from "@/components/screen-container";
import { StreakCalendar } from "@/components/streak-calendar";
import { useDailyChallenge } from "@/hooks/use-daily-challenge";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Platform, Pressable, ScrollView, Text, View } from "react-native";

type Phase = "intro" | "active" | "finished";

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function haptic() {
  if (Platform.OS !== "web") {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }
}

export default function DailyChallengeScreen() {
  const router = useRouter();
  const {
    todayChallenge,
    isCompletedToday,
    streak,
    totalCompleted,
    completeToday,
    getWeekDates,
  } = useDailyChallenge();

  const [phase, setPhase] = useState<Phase>(isCompletedToday ? "finished" : "intro");
  const [secondsLeft, setSecondsLeft] = useState(todayChallenge.durationSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const progress = 1 - secondsLeft / todayChallenge.durationSeconds;

  useEffect(() => {
    if (!isRunning) return;
    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          setIsRunning(false);
          handleComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  async function handleComplete() {
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    await completeToday();
    setPhase("finished");
  }

  function handleStart() {
    haptic();
    setPhase("active");
    setIsRunning(true);
  }

  // --- Intro phase ---
  if (phase === "intro") {
    return (
      <ScreenContainer>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="flex-1">
          <View className="px-6 pt-4 pb-2 flex-row items-center">
            <Pressable onPress={() => router.back()} style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}>
              <Text className="text-2xl text-primary mr-3">←</Text>
            </Pressable>
            <Text className="text-2xl font-bold text-foreground">今日挑战</Text>
          </View>

          {/* Week calendar */}
          <View className="px-6 pt-4 pb-4">
            <StreakCalendar weekDates={getWeekDates()} streak={streak} totalCompleted={totalCompleted} />
          </View>

          {/* Challenge card */}
          <View className="px-6 pb-4">
            <View className="bg-surface rounded-2xl p-6 border border-border">
              <Text className="text-4xl text-center mb-4">{todayChallenge.icon}</Text>
              <Text className="text-2xl font-bold text-foreground text-center">
                {todayChallenge.title}
              </Text>
              <Text className="text-base text-muted text-center mt-2">
                {todayChallenge.description}
              </Text>

              <View className="mt-4 bg-background rounded-xl p-4">
                <Text className="text-sm font-medium text-foreground mb-2">操作指南</Text>
                <Text className="text-sm text-muted leading-relaxed">
                  {todayChallenge.instructions}
                </Text>
              </View>

              <View className="flex-row items-center justify-center gap-4 mt-4">
                <Text className="text-sm text-muted">
                  ⏱️ {Math.ceil(todayChallenge.durationSeconds / 60)} 分钟
                </Text>
                <Text className="text-sm text-muted">📂 {todayChallenge.category}</Text>
              </View>
            </View>
          </View>

          {/* Start button */}
          <View className="px-6 pb-8">
            <Pressable onPress={handleStart} style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}>
              <View className="bg-primary rounded-xl p-4 items-center">
                <Text className="text-lg font-semibold text-white">开始挑战</Text>
              </View>
            </Pressable>
          </View>
        </ScrollView>
      </ScreenContainer>
    );
  }

  // --- Active phase ---
  if (phase === "active") {
    const ringSize = 200;

    return (
      <ScreenContainer>
        <View className="flex-1">
          <View className="px-6 pt-4 pb-2 flex-row items-center">
            <Pressable
              onPress={() => {
                haptic();
                setIsRunning(false);
                setPhase("intro");
                setSecondsLeft(todayChallenge.durationSeconds);
              }}
              style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
            >
              <Text className="text-2xl text-primary mr-3">←</Text>
            </Pressable>
            <Text className="text-lg font-semibold text-foreground">{todayChallenge.title}</Text>
          </View>

          <View className="flex-1 items-center justify-center px-6">
            {/* Timer circle */}
            <View style={{ width: ringSize, height: ringSize }} className="items-center justify-center mb-8">
              <View
                style={{
                  width: ringSize,
                  height: ringSize,
                  borderRadius: ringSize / 2,
                  borderWidth: 8,
                  borderColor: "#E0D5CC",
                  position: "absolute",
                }}
              />
              <View
                style={{
                  width: ringSize,
                  height: ringSize,
                  borderRadius: ringSize / 2,
                  borderWidth: 8,
                  borderColor: "#6BA587",
                  position: "absolute",
                  opacity: progress,
                }}
              />
              <Text className="text-4xl font-bold text-foreground">{formatTime(secondsLeft)}</Text>
              <Text className="text-sm text-muted mt-1">
                {isRunning ? "进行中..." : "已暂停"}
              </Text>
            </View>

            {/* Instructions */}
            <Text className="text-base text-muted text-center px-4 mb-8">
              {todayChallenge.instructions}
            </Text>

            {/* Controls */}
            <View className="flex-row gap-4">
              <Pressable
                onPress={() => { haptic(); setIsRunning((r) => !r); }}
                style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
              >
                <View className="bg-surface rounded-full px-8 py-4 items-center border border-border">
                  <Text className="text-lg font-semibold text-foreground">
                    {isRunning ? "暂停" : "继续"}
                  </Text>
                </View>
              </Pressable>
              <Pressable
                onPress={() => { haptic(); handleComplete(); }}
                style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
              >
                <View className="bg-primary rounded-full px-8 py-4 items-center">
                  <Text className="text-lg font-semibold text-white">完成</Text>
                </View>
              </Pressable>
            </View>
          </View>
        </View>
      </ScreenContainer>
    );
  }

  // --- Finished phase ---
  return (
    <ScreenContainer>
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-6xl mb-4">🎉</Text>
        <Text className="text-2xl font-bold text-foreground mb-2">挑战完成！</Text>
        <Text className="text-base text-muted mb-6">坚持就是胜利，明天继续加油</Text>

        {/* Stats */}
        <View className="w-full mb-6">
          <StreakCalendar weekDates={getWeekDates()} streak={streak} totalCompleted={totalCompleted} />
        </View>

        <View className="flex-row gap-3 w-full">
          <Pressable
            onPress={() => {
              if (todayChallenge.relatedArticle) {
                router.push({ pathname: "/knowledge/[id]", params: { id: todayChallenge.relatedArticle } });
              }
            }}
            className="flex-1"
            style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
          >
            <View className="bg-primary rounded-xl p-4 items-center">
              <Text className="text-base font-semibold text-white">📖 学习更多</Text>
            </View>
          </Pressable>
          <Pressable onPress={() => router.back()} className="flex-1" style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}>
            <View className="bg-surface rounded-xl p-4 items-center border border-border">
              <Text className="text-base font-semibold text-foreground">返回首页</Text>
            </View>
          </Pressable>
        </View>
      </View>
    </ScreenContainer>
  );
}
