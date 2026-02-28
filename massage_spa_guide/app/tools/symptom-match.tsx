import { ScreenContainer } from "@/components/screen-container";
import symptomData from "@/data/symptom-matrix.json";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Platform, Pressable, ScrollView, Text, View } from "react-native";

type Step = "zone" | "type" | "cause" | "result";

interface Recommendation {
  technique: { id: string; name: string; reason: string };
  acupoints: { id: string; name: string; reason: string }[];
  oil: { id: string; name: string; reason: string };
  timerRoutine: string;
}

function haptic() {
  if (Platform.OS !== "web") {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }
}

export default function SymptomMatchScreen() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("zone");
  const [zone, setZone] = useState<string | null>(null);
  const [type, setType] = useState<string | null>(null);
  const [cause, setCause] = useState<string | null>(null);

  const recommendation = useMemo<Recommendation | null>(() => {
    if (!zone || !type || !cause) return null;
    for (const rule of symptomData.rules) {
      if (rule.zones.includes(zone) && rule.types.includes(type) && rule.causes.includes(cause)) {
        return rule.recommendation as Recommendation;
      }
    }
    // Fallback: match zone + type only
    for (const rule of symptomData.rules) {
      if (rule.zones.includes(zone) && rule.types.includes(type)) {
        return rule.recommendation as Recommendation;
      }
    }
    // Fallback: match zone only
    for (const rule of symptomData.rules) {
      if (rule.zones.includes(zone)) {
        return rule.recommendation as Recommendation;
      }
    }
    return null;
  }, [zone, type, cause]);

  const stepTitle: Record<Step, string> = {
    zone: "哪里不舒服？",
    type: "什么类型的不适？",
    cause: "什么原因导致的？",
    result: "为你匹配的方案",
  };

  const stepSubtitle: Record<Step, string> = {
    zone: "选择身体部位",
    type: "选择症状类型",
    cause: "选择可能原因",
    result: "点击查看详情",
  };

  const stepNumber = step === "zone" ? 1 : step === "type" ? 2 : step === "cause" ? 3 : 4;

  function handleSelect(value: string) {
    haptic();
    if (step === "zone") {
      setZone(value);
      setStep("type");
    } else if (step === "type") {
      setType(value);
      setStep("cause");
    } else if (step === "cause") {
      setCause(value);
      setStep("result");
    }
  }

  function handleBack() {
    haptic();
    if (step === "type") {
      setStep("zone");
      setType(null);
    } else if (step === "cause") {
      setStep("type");
      setCause(null);
    } else if (step === "result") {
      setStep("cause");
      setCause(null);
    } else {
      router.back();
    }
  }

  function handleReset() {
    haptic();
    setZone(null);
    setType(null);
    setCause(null);
    setStep("zone");
  }

  function renderOptions(items: { id: string; name: string; icon: string }[], selected: string | null) {
    return (
      <View className="flex-row flex-wrap gap-3 px-6">
        {items.map((item) => (
          <Pressable
            key={item.id}
            onPress={() => handleSelect(item.id)}
            style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
          >
            <View
              className="rounded-2xl border border-border p-4 items-center min-w-[100px]"
              style={selected === item.id ? { backgroundColor: "#8B735530" } : { backgroundColor: "transparent" }}
            >
              <Text className="text-3xl mb-2">{item.icon}</Text>
              <Text className="text-base font-medium text-foreground">{item.name}</Text>
            </View>
          </Pressable>
        ))}
      </View>
    );
  }

  function renderResult() {
    if (!recommendation) {
      return (
        <View className="px-6 items-center py-12">
          <Text className="text-lg text-muted">暂未找到匹配方案</Text>
        </View>
      );
    }

    return (
      <View className="px-6 gap-4">
        {/* Technique */}
        <Pressable
          onPress={() => router.push({ pathname: "/knowledge/[id]", params: { id: recommendation.technique.id } })}
          style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
        >
          <View className="bg-surface rounded-2xl p-4 border border-border">
            <View className="flex-row items-center mb-2">
              <Text className="text-lg mr-2">🤲</Text>
              <Text className="text-sm font-medium text-muted">推荐技法</Text>
            </View>
            <Text className="text-lg font-semibold text-foreground">{recommendation.technique.name}</Text>
            <Text className="text-sm text-muted mt-1">{recommendation.technique.reason}</Text>
          </View>
        </Pressable>

        {/* Acupoints */}
        {recommendation.acupoints.map((ap) => (
          <Pressable
            key={ap.id}
            onPress={() => router.push({ pathname: "/knowledge/[id]", params: { id: ap.id } })}
            style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
          >
            <View className="rounded-2xl p-4 border border-border" style={{ backgroundColor: "#6BA58720" }}>
              <View className="flex-row items-center mb-2">
                <Text className="text-lg mr-2">📍</Text>
                <Text className="text-sm font-medium text-muted">推荐穴位</Text>
              </View>
              <Text className="text-lg font-semibold text-foreground">{ap.name}</Text>
              <Text className="text-sm text-muted mt-1">{ap.reason}</Text>
            </View>
          </Pressable>
        ))}

        {/* Oil */}
        <Pressable
          onPress={() => router.push({ pathname: "/knowledge/[id]", params: { id: recommendation.oil.id } })}
          style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
        >
          <View className="rounded-2xl p-4 border border-border" style={{ backgroundColor: "#E8D5C420" }}>
            <View className="flex-row items-center mb-2">
              <Text className="text-lg mr-2">🌿</Text>
              <Text className="text-sm font-medium text-muted">推荐精油</Text>
            </View>
            <Text className="text-lg font-semibold text-foreground">{recommendation.oil.name}</Text>
            <Text className="text-sm text-muted mt-1">{recommendation.oil.reason}</Text>
          </View>
        </Pressable>

        {/* Action buttons */}
        <View className="flex-row gap-3 mt-2">
          <Pressable
            onPress={() => router.push({ pathname: "/tools/acupoint-timer", params: { routine: recommendation.timerRoutine } })}
            className="flex-1"
            style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
          >
            <View className="bg-primary rounded-xl p-4 items-center">
              <Text className="text-base font-semibold text-white">⏱️ 开始计时</Text>
            </View>
          </Pressable>
          <Pressable
            onPress={handleReset}
            className="flex-1"
            style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
          >
            <View className="bg-surface rounded-xl p-4 items-center border border-border">
              <Text className="text-base font-semibold text-foreground">🔄 重新匹配</Text>
            </View>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="flex-1">
        {/* Header */}
        <View className="px-6 pt-4 pb-2 flex-row items-center">
          <Pressable onPress={handleBack} style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}>
            <Text className="text-2xl text-primary mr-3">←</Text>
          </Pressable>
          <View className="flex-1">
            <Text className="text-2xl font-bold text-foreground">症状速配</Text>
          </View>
          {step !== "zone" && step !== "result" && (
            <Text className="text-sm text-muted">{stepNumber} / 3</Text>
          )}
        </View>

        {/* Step indicator */}
        {step !== "result" && (
          <View className="px-6 pb-2 flex-row gap-2">
            {[1, 2, 3].map((n) => (
              <View
                key={n}
                className="h-1 flex-1 rounded-full"
                style={{ backgroundColor: n <= stepNumber ? "#8B7355" : "#E0D5CC" }}
              />
            ))}
          </View>
        )}

        {/* Step title */}
        <View className="px-6 pt-4 pb-6">
          <Text className="text-xl font-semibold text-foreground">{stepTitle[step]}</Text>
          <Text className="text-sm text-muted mt-1">{stepSubtitle[step]}</Text>
        </View>

        {/* Content */}
        {step === "zone" && renderOptions(symptomData.zones, zone)}
        {step === "type" && renderOptions(symptomData.types, type)}
        {step === "cause" && renderOptions(symptomData.causes, cause)}
        {step === "result" && renderResult()}
      </ScrollView>
    </ScreenContainer>
  );
}
