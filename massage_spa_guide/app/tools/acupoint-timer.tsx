import { ScreenContainer } from "@/components/screen-container";
import routinesData from "@/data/routines.json";
import { useTimer } from "@/hooks/use-timer";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Platform, Pressable, ScrollView, Text, View } from "react-native";

type Phase = "select" | "active" | "finished";

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

export default function AcupointTimerScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ routine?: string }>();
  const [phase, setPhase] = useState<Phase>("select");
  const [selectedRoutineId, setSelectedRoutineId] = useState<string | null>(params.routine ?? null);

  const selectedRoutine = useMemo(
    () => routinesData.routines.find((r) => r.id === selectedRoutineId) ?? null,
    [selectedRoutineId],
  );

  const timer = useTimer({
    steps: selectedRoutine?.steps ?? [],
    onComplete: () => setPhase("finished"),
  });

  function handleSelectRoutine(id: string) {
    haptic();
    setSelectedRoutineId(id);
    setPhase("active");
  }

  function handleStart() {
    haptic();
    timer.start();
  }

  function handleReset() {
    haptic();
    timer.reset();
    setPhase("select");
    setSelectedRoutineId(null);
  }

  // --- Select phase ---
  if (phase === "select") {
    return (
      <ScreenContainer>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="flex-1">
          <View className="px-6 pt-4 pb-2 flex-row items-center">
            <Pressable onPress={() => router.back()} style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}>
              <Text className="text-2xl text-primary mr-3">←</Text>
            </Pressable>
            <Text className="text-2xl font-bold text-foreground">穴位按摩计时器</Text>
          </View>

          <View className="px-6 pt-2 pb-4">
            <Text className="text-sm text-muted">选择按摩套路，跟随节奏震动按压穴位</Text>
          </View>

          <View className="px-6 gap-4 pb-8">
            {routinesData.routines.map((routine) => (
              <Pressable
                key={routine.id}
                onPress={() => handleSelectRoutine(routine.id)}
                style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
              >
                <View
                  className="rounded-2xl p-5 border border-border"
                  style={{ backgroundColor: routine.color + "20" }}
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <View className="flex-row items-center gap-2 mb-1">
                        <Text className="text-2xl">{routine.icon}</Text>
                        <Text className="text-lg font-semibold text-foreground">{routine.name}</Text>
                      </View>
                      <Text className="text-sm text-muted">{routine.description}</Text>
                      <View className="flex-row items-center gap-3 mt-2">
                        <Text className="text-xs text-muted">⏱️ {routine.totalMinutes} 分钟</Text>
                        <Text className="text-xs text-muted">📍 {routine.steps.length} 个穴位</Text>
                      </View>
                    </View>
                    <View
                      className="w-10 h-10 rounded-full items-center justify-center"
                      style={{ backgroundColor: routine.color }}
                    >
                      <Text className="text-lg text-white">▶</Text>
                    </View>
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </ScreenContainer>
    );
  }

  // --- Active phase ---
  if (phase === "active" && selectedRoutine && timer.currentStep) {
    const ringSize = 220;

    return (
      <ScreenContainer>
        <View className="flex-1">
          {/* Header */}
          <View className="px-6 pt-4 pb-2 flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Text className="text-xl">{selectedRoutine.icon}</Text>
              <Text className="text-lg font-semibold text-foreground ml-2">{selectedRoutine.name}</Text>
            </View>
            <Text className="text-sm text-muted">
              {timer.currentStepIndex + 1} / {timer.totalSteps}
            </Text>
          </View>

          {/* Step progress */}
          <View className="px-6 pb-2 flex-row gap-2">
            {Array.from({ length: timer.totalSteps }).map((_, i) => (
              <View
                key={i}
                className="h-1 flex-1 rounded-full"
                style={{
                  backgroundColor:
                    i < timer.currentStepIndex
                      ? selectedRoutine.color
                      : i === timer.currentStepIndex
                        ? selectedRoutine.color + "80"
                        : "#E0D5CC",
                }}
              />
            ))}
          </View>

          {/* Transition overlay */}
          {timer.isTransition ? (
            <View className="flex-1 items-center justify-center px-6">
              <Text className="text-lg text-muted mb-2">下一个穴位</Text>
              <Text className="text-3xl font-bold text-foreground">
                {selectedRoutine.steps[timer.currentStepIndex + 1]?.acupointName}
              </Text>
              <Text className="text-base text-muted mt-2">
                {selectedRoutine.steps[timer.currentStepIndex + 1]?.location}
              </Text>
            </View>
          ) : (
            <>
              {/* Timer circle */}
              <View className="items-center justify-center py-8">
                <View
                  style={{ width: ringSize, height: ringSize }}
                  className="items-center justify-center"
                >
                  {/* Background ring */}
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
                  {/* Progress ring (simplified, using border trick) */}
                  <View
                    style={{
                      width: ringSize,
                      height: ringSize,
                      borderRadius: ringSize / 2,
                      borderWidth: 8,
                      borderColor: selectedRoutine.color,
                      position: "absolute",
                      opacity: timer.progress,
                    }}
                  />
                  {/* Center text */}
                  <Text className="text-5xl font-bold text-foreground">{formatTime(timer.secondsLeft)}</Text>
                  <Text className="text-sm text-muted mt-1">
                    {timer.isRunning ? "按压中..." : "准备开始"}
                  </Text>
                </View>
              </View>

              {/* Acupoint info */}
              <View className="px-6 items-center">
                <Text className="text-2xl font-bold text-foreground">{timer.currentStep.acupointName}</Text>
                <Text className="text-base text-muted mt-2 text-center">{timer.currentStep.location}</Text>
                <Text className="text-sm text-primary mt-1">{timer.currentStep.benefit}</Text>
              </View>

              {/* Controls */}
              <View className="flex-row gap-4 px-6 mt-8 justify-center">
                {!timer.isRunning ? (
                  <Pressable
                    onPress={handleStart}
                    style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                  >
                    <View
                      className="rounded-full px-12 py-4 items-center"
                      style={{ backgroundColor: selectedRoutine.color }}
                    >
                      <Text className="text-lg font-semibold text-white">开始</Text>
                    </View>
                  </Pressable>
                ) : (
                  <>
                    <Pressable
                      onPress={() => { haptic(); timer.pause(); }}
                      style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                    >
                      <View className="bg-surface rounded-full px-8 py-4 items-center border border-border">
                        <Text className="text-lg font-semibold text-foreground">暂停</Text>
                      </View>
                    </Pressable>
                    {timer.currentStepIndex < timer.totalSteps - 1 && (
                      <Pressable
                        onPress={() => { haptic(); timer.skip(); }}
                        style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                      >
                        <View className="bg-surface rounded-full px-8 py-4 items-center border border-border">
                          <Text className="text-lg font-semibold text-foreground">跳过</Text>
                        </View>
                      </Pressable>
                    )}
                  </>
                )}
              </View>
            </>
          )}
        </View>
      </ScreenContainer>
    );
  }

  // --- Finished phase ---
  const totalSeconds = selectedRoutine?.steps.reduce((sum, s) => sum + s.durationSeconds, 0) ?? 0;

  return (
    <ScreenContainer>
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-6xl mb-4">🎉</Text>
        <Text className="text-2xl font-bold text-foreground mb-2">按摩完成！</Text>
        <Text className="text-base text-muted mb-6">身体放松一下，保持好状态</Text>

        <View className="bg-surface rounded-2xl p-6 w-full border border-border mb-6">
          <View className="flex-row justify-between mb-3">
            <Text className="text-sm text-muted">总用时</Text>
            <Text className="text-sm font-semibold text-foreground">{formatTime(totalSeconds)}</Text>
          </View>
          <View className="flex-row justify-between mb-3">
            <Text className="text-sm text-muted">完成穴位</Text>
            <Text className="text-sm font-semibold text-foreground">{selectedRoutine?.steps.length} 个</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-sm text-muted">套路</Text>
            <Text className="text-sm font-semibold text-foreground">{selectedRoutine?.name}</Text>
          </View>
        </View>

        <View className="flex-row gap-3 w-full">
          <Pressable onPress={handleReset} className="flex-1" style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}>
            <View className="bg-primary rounded-xl p-4 items-center">
              <Text className="text-base font-semibold text-white">再来一次</Text>
            </View>
          </Pressable>
          <Pressable onPress={() => router.back()} className="flex-1" style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}>
            <View className="bg-surface rounded-xl p-4 items-center border border-border">
              <Text className="text-base font-semibold text-foreground">返回</Text>
            </View>
          </Pressable>
        </View>
      </View>
    </ScreenContainer>
  );
}
