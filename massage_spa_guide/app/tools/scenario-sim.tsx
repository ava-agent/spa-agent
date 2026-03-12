import { useState } from "react";
import { ScrollView, Text, View, Pressable, ActivityIndicator } from "react-native";
import { Stack, useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import scenarioData from "@/data/scenarios.json";
import { trpc } from "@/lib/trpc";

interface ScenarioOption {
  text: string;
  score: number;
  next: string;
  tag: string;
}

interface ScenarioNode {
  text: string;
  options?: ScenarioOption[];
  ending?: { grade: string; summary: string; articleIds: string[] };
}

interface Scenario {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  icon: string;
  intro: string;
  startNode: string;
  maxScore: number;
  nodes: Record<string, ScenarioNode>;
}

const scenarios = scenarioData.scenarios as unknown as Scenario[];

type Phase = "list" | "intro" | "playing" | "ending";

interface ChoiceRecord {
  nodeText: string;
  optionText: string;
  tag: string;
  score: number;
}

const difficultyColors: Record<string, string> = {
  beginner: "#6BA587",
  intermediate: "#D4A574",
  advanced: "#E85D4C",
};

const difficultyLabels: Record<string, string> = {
  beginner: "新手",
  intermediate: "中级",
  advanced: "高级",
};

const gradeColors: Record<string, string> = {
  S: "#FFD700",
  A: "#6BA587",
  B: "#4A90A4",
  C: "#E85D4C",
};

export default function ScenarioSimScreen() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("list");
  const [currentScenario, setCurrentScenario] = useState<Scenario | null>(null);
  const [currentNodeId, setCurrentNodeId] = useState("");
  const [totalScore, setTotalScore] = useState(0);
  const [choices, setChoices] = useState<ChoiceRecord[]>([]);
  const [aiReview, setAiReview] = useState("");
  const [isLoadingReview, setIsLoadingReview] = useState(false);

  const scenarioReview = trpc.advisor.scenarioReview.useMutation();

  const currentNode = currentScenario?.nodes[currentNodeId];

  const startScenario = (scenario: Scenario) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setCurrentScenario(scenario);
    setPhase("intro");
    setTotalScore(0);
    setChoices([]);
    setAiReview("");
  };

  const beginPlaying = () => {
    if (!currentScenario) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCurrentNodeId(currentScenario.startNode);
    setPhase("playing");
  };

  const selectOption = (option: ScenarioOption) => {
    if (!currentScenario || !currentNode) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const newScore = totalScore + option.score;
    setTotalScore(newScore);
    setChoices([
      ...choices,
      {
        nodeText: currentNode.text,
        optionText: option.text,
        tag: option.tag,
        score: option.score,
      },
    ]);

    const nextNode = currentScenario.nodes[option.next];
    setCurrentNodeId(option.next);

    if (nextNode?.ending) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setPhase("ending");
      fetchAiReview(currentScenario, newScore, nextNode.ending.grade, [
        ...choices,
        { nodeText: currentNode.text, optionText: option.text, tag: option.tag, score: option.score },
      ]);
    }
  };

  const fetchAiReview = async (
    scenario: Scenario,
    score: number,
    grade: string,
    allChoices: ChoiceRecord[],
  ) => {
    setIsLoadingReview(true);
    try {
      const result = await scenarioReview.mutateAsync({
        scenarioTitle: scenario.title,
        choices: allChoices,
        totalScore: score,
        maxScore: scenario.maxScore,
        grade,
      });
      setAiReview(result.reply);
    } catch {
      setAiReview("AI 点评加载失败，但不影响你的结果！");
    } finally {
      setIsLoadingReview(false);
    }
  };

  const resetToList = () => {
    setPhase("list");
    setCurrentScenario(null);
    setCurrentNodeId("");
    setTotalScore(0);
    setChoices([]);
    setAiReview("");
  };

  // --- Scenario List ---
  if (phase === "list") {
    return (
      <ScreenContainer className="">
        <Stack.Screen options={{ title: "情景模拟", headerBackTitle: "返回" }} />
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="flex-1">
          <View className="px-6 pt-4 pb-6">
            <View
              className="rounded-3xl p-6"
              style={{ backgroundColor: "#1a1a2e" }}
            >
              <Text className="text-3xl font-bold text-white mb-2">🎭 情景模拟</Text>
              <Text className="text-base text-white/70">
                身临其境体验各种消费场景{"\n"}每个选择都影响最终结局
              </Text>
            </View>
          </View>

          <View className="px-6 pb-8">
            <View className="gap-3">
              {scenarios.map((s) => (
                <Pressable
                  key={s.id}
                  onPress={() => startScenario(s)}
                  style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                >
                  <View className="rounded-2xl p-4 border border-border bg-surface">
                    <View className="flex-row items-start">
                      <View className="w-12 h-12 rounded-xl items-center justify-center mr-4 bg-surface">
                        <Text className="text-2xl">{s.icon}</Text>
                      </View>
                      <View className="flex-1 pr-3">
                        <View className="flex-row items-center mb-1">
                          <Text className="text-base font-semibold text-foreground flex-1">
                            {s.title}
                          </Text>
                          <View
                            className="px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: difficultyColors[s.difficulty] + "20" }}
                          >
                            <Text
                              className="text-xs font-medium"
                              style={{ color: difficultyColors[s.difficulty] }}
                            >
                              {difficultyLabels[s.difficulty]}
                            </Text>
                          </View>
                        </View>
                        <Text className="text-sm text-muted">{s.description}</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={20} color="#999" />
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

  // --- Intro ---
  if (phase === "intro" && currentScenario) {
    return (
      <ScreenContainer className="">
        <Stack.Screen options={{ title: currentScenario.title, headerBackTitle: "返回" }} />
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="flex-1">
          <View className="px-6 pt-6 pb-4">
            <View className="items-center mb-6">
              <Text className="text-6xl mb-4">{currentScenario.icon}</Text>
              <Text className="text-2xl font-bold text-foreground mb-2">
                {currentScenario.title}
              </Text>
              <View
                className="px-3 py-1 rounded-full"
                style={{ backgroundColor: difficultyColors[currentScenario.difficulty] + "20" }}
              >
                <Text
                  className="text-sm font-medium"
                  style={{ color: difficultyColors[currentScenario.difficulty] }}
                >
                  难度：{difficultyLabels[currentScenario.difficulty]}
                </Text>
              </View>
            </View>

            <View
              className="rounded-2xl p-5"
              style={{ backgroundColor: "#1a1a2e" }}
            >
              <Text className="text-base text-white/90 leading-relaxed">
                {currentScenario.intro}
              </Text>
            </View>
          </View>

          <View className="px-6 pb-8">
            <Pressable
              onPress={beginPlaying}
              className="rounded-full py-4 items-center"
              style={{ backgroundColor: "#4A90A4" }}
            >
              <Text className="text-white font-semibold text-lg">开始模拟</Text>
            </Pressable>
            <Pressable onPress={resetToList} className="mt-3 items-center">
              <Text className="text-muted">返回列表</Text>
            </Pressable>
          </View>
        </ScrollView>
      </ScreenContainer>
    );
  }

  // --- Playing ---
  if (phase === "playing" && currentScenario && currentNode) {
    return (
      <ScreenContainer className="">
        <Stack.Screen options={{ title: currentScenario.title, headerBackTitle: "返回" }} />
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="flex-1">
          {/* Progress */}
          <View className="px-6 pt-4">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-sm text-muted">
                第 {choices.length + 1} 步
              </Text>
              <Text className="text-sm font-semibold text-[#4A90A4]">
                得分: {totalScore}
              </Text>
            </View>
          </View>

          {/* Scene */}
          <View className="px-6 py-4">
            <View
              className="rounded-2xl p-5"
              style={{ backgroundColor: "#1a1a2e" }}
            >
              <Text className="text-base text-white/90 leading-relaxed">
                {currentNode.text}
              </Text>
            </View>
          </View>

          {/* Options */}
          {currentNode.options && (
            <View className="px-6 pb-8">
              <Text className="text-sm text-muted mb-3">你的选择：</Text>
              <View className="gap-3">
                {currentNode.options.map((opt, idx) => (
                  <Pressable
                    key={idx}
                    onPress={() => selectOption(opt)}
                    style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                  >
                    <View
                      className="rounded-2xl p-4 flex-row items-center border"
                      style={{
                        backgroundColor: "#F5F1ED",
                        borderColor: "#E0D5CC",
                      }}
                    >
                      <View
                        className="w-8 h-8 rounded-full items-center justify-center mr-3"
                        style={{ backgroundColor: "#4A90A420" }}
                      >
                        <Text className="font-semibold" style={{ color: "#4A90A4" }}>
                          {String.fromCharCode(65 + idx)}
                        </Text>
                      </View>
                      <Text className="flex-1 text-base" style={{ color: "#2C2C2C" }}>
                        {opt.text}
                      </Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            </View>
          )}
        </ScrollView>
      </ScreenContainer>
    );
  }

  // --- Ending ---
  if (phase === "ending" && currentScenario && currentNode?.ending) {
    const ending = currentNode.ending;
    const percentage = Math.round((totalScore / currentScenario.maxScore) * 100);

    return (
      <ScreenContainer className="">
        <Stack.Screen options={{ title: "模拟结果", headerBackTitle: "返回" }} />
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="flex-1">
          {/* Ending narrative */}
          <View className="px-6 pt-6">
            <View
              className="rounded-2xl p-5"
              style={{ backgroundColor: "#1a1a2e" }}
            >
              <Text className="text-base text-white/90 leading-relaxed">
                {currentNode.text}
              </Text>
            </View>
          </View>

          {/* Score Card */}
          <View className="px-6 py-6">
            <View className="items-center">
              <Text
                className="text-7xl font-bold mb-2"
                style={{ color: gradeColors[ending.grade] || "#4A90A4" }}
              >
                {ending.grade}
              </Text>
              <Text className="text-lg text-foreground font-semibold mb-1">
                {ending.summary}
              </Text>
              <Text className="text-muted">
                得分 {totalScore}/{currentScenario.maxScore} ({percentage}%)
              </Text>
            </View>
          </View>

          {/* AI Review */}
          <View className="px-6 pb-4">
            <Text className="text-lg font-semibold text-foreground mb-3">
              AI 点评
            </Text>
            <View
              className="rounded-2xl p-4"
              style={{ backgroundColor: "#4A90A415" }}
            >
              {isLoadingReview ? (
                <View className="flex-row items-center justify-center py-4">
                  <ActivityIndicator size="small" color="#4A90A4" />
                  <Text className="text-muted ml-2">AI 正在分析你的选择...</Text>
                </View>
              ) : (
                <Text className="text-sm text-foreground leading-relaxed">
                  {aiReview}
                </Text>
              )}
            </View>
          </View>

          {/* Related Articles */}
          <View className="px-6 pb-4">
            <Text className="text-sm font-semibold text-foreground mb-2">
              推荐阅读
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {ending.articleIds.map((id) => (
                <Pressable
                  key={id}
                  onPress={() =>
                    router.push({ pathname: "/knowledge/[id]", params: { id } })
                  }
                >
                  <View
                    className="px-3 py-1.5 rounded-full"
                    style={{ backgroundColor: "#4A90A420" }}
                  >
                    <Text className="text-xs text-[#4A90A4]">{id}</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Actions */}
          <View className="px-6 pb-8">
            <Pressable
              onPress={() => startScenario(currentScenario)}
              className="rounded-full py-4 items-center mb-3"
              style={{ backgroundColor: "#4A90A4" }}
            >
              <Text className="text-white font-semibold text-lg">再来一次</Text>
            </Pressable>
            <Pressable onPress={resetToList} className="items-center">
              <Text className="text-[#4A90A4] font-medium">选择其他场景</Text>
            </Pressable>
          </View>
        </ScrollView>
      </ScreenContainer>
    );
  }

  return null;
}
