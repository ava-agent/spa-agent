import { useState } from "react";
import { ScrollView, Text, View, Pressable } from "react-native";
import { Stack, useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const quizQuestions: QuizQuestion[] = [
  {
    id: "q1",
    question: "「关元穴」位于肚脐下方多少寸处？",
    options: ["1 寸", "2 寸", "3 寸", "4 寸"],
    correctIndex: 2,
    explanation:
      "关元穴位于肚脐下 3 寸处，是培补元气的要穴，有「千年野山参」之称。",
  },
  {
    id: "q2",
    question: "以下哪个穴位被称为「长寿穴」？",
    options: ["涌泉穴", "足三里", "合谷穴", "内关穴"],
    correctIndex: 1,
    explanation:
      "足三里穴被誉为「长寿穴」，经常按摩可增强体质、提高免疫力。",
  },
  {
    id: "q3",
    question: "运动后按摩的最佳时间窗口是？",
    options: ["立即", "30分钟-2小时", "3-4小时后", "第二天"],
    correctIndex: 1,
    explanation:
      "运动后 30 分钟至 2 小时是最佳恢复窗口期，此时进行按摩效果最好。",
  },
  {
    id: "q4",
    question: "「命门穴」位于人体的哪个部位？",
    options: ["头顶", "手掌", "后腰", "足底"],
    correctIndex: 2,
    explanation:
      "命门穴位于后腰第二腰椎棘突下凹陷处，是肾阳汇聚之地。",
  },
  {
    id: "q5",
    question: "以下哪种精油最适合运动后肌肉放松？",
    options: ["薰衣草", "黑胡椒", "柠檬", "玫瑰"],
    correctIndex: 1,
    explanation:
      "黑胡椒精油有温热、止痛作用，非常适合运动后肌肉酸痛按摩。",
  },
  {
    id: "q6",
    question: "「涌泉穴」位于足底的什么位置？",
    options: ["脚跟", "足弓", "前1/3凹陷处", "大脚趾"],
    correctIndex: 2,
    explanation:
      "涌泉穴位于足底前 1/3 凹陷处，是肾经起始穴，睡前按摩可改善睡眠。",
  },
  {
    id: "q7",
    question: "中医认为「肾为」什么之本？",
    options: ["后天之本", "先天之本", "气血之本", "阴阳之本"],
    correctIndex: 1,
    explanation:
      "中医认为「肾为先天之本」，肾脏健康对男性至关重要。",
  },
  {
    id: "q8",
    question: "提肛运动每次收缩应保持多长时间？",
    options: ["1-2秒", "3-5秒", "10-15秒", "30秒"],
    correctIndex: 1,
    explanation:
      "提肛运动每次收缩保持 3-5 秒，每天做 50-100 次，可增强盆底肌肉。",
  },
];

export default function MensQuizScreen() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);

  const currentQuestion = quizQuestions[currentIndex];
  const isLastQuestion = currentIndex === quizQuestions.length - 1;

  const handleOptionPress = (index: number) => {
    if (answered) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedOption(index);
    setAnswered(true);

    if (index === currentQuestion.correctIndex) {
      setScore(score + 1);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleNext = () => {
    if (isLastQuestion) {
      setShowResult(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
      setAnswered(false);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setShowResult(false);
    setScore(0);
    setAnswered(false);
  };

  const getScoreMessage = () => {
    const percentage = (score / quizQuestions.length) * 100;
    if (percentage === 100) return { emoji: "🏆", text: "满分！按摩大师！" };
    if (percentage >= 80) return { emoji: "🎉", text: "优秀！知识渊博！" };
    if (percentage >= 60) return { emoji: "👍", text: "不错！继续加油！" };
    if (percentage >= 40) return { emoji: "📚", text: "还需学习哦！" };
    return { emoji: "💪", text: "多看文章提升吧！" };
  };

  if (showResult) {
    const result = getScoreMessage();
    return (
      <ScreenContainer className="">
        <Stack.Screen
          options={{
            title: "知识问答",
            headerBackTitle: "返回",
          }}
        />
        <View className="flex-1 items-center justify-center px-6">
          <View className="items-center">
            <Text className="text-7xl mb-6">{result.emoji}</Text>
            <Text className="text-2xl font-bold text-foreground mb-2">
              问答完成！
            </Text>
            <Text className="text-lg text-muted mb-8">{result.text}</Text>

            <View
              className="rounded-3xl p-8 items-center mb-8"
              style={{ backgroundColor: "#4A90A420" }}
            >
              <Text className="text-5xl font-bold text-[#4A90A4] mb-2">
                {score} / {quizQuestions.length}
              </Text>
              <Text className="text-muted">正确答案</Text>
            </View>

            <Pressable
              onPress={handleRestart}
              className="rounded-full px-8 py-4"
              style={{ backgroundColor: "#4A90A4" }}
            >
              <Text className="text-white font-semibold text-lg">
                再来一次
              </Text>
            </Pressable>

            <Pressable
              onPress={() => router.push("/tools/mens-guide" as any)}
              className="mt-4"
            >
              <Text className="text-[#4A90A4] font-medium">
                返回男士指南
              </Text>
            </Pressable>
          </View>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="">
      <Stack.Screen
        options={{
          title: "知识问答",
          headerBackTitle: "返回",
        }}
      />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="flex-1">
        {/* Progress */}
        <View className="px-6 pt-4">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-sm text-muted">
              问题 {currentIndex + 1} / {quizQuestions.length}
            </Text>
            <Text className="text-sm font-semibold text-[#4A90A4]">
              得分: {score}
            </Text>
          </View>
          <View className="h-2 bg-surface rounded-full overflow-hidden">
            <View
              className="h-full bg-[#4A90A4] rounded-full"
              style={{
                width: `${((currentIndex + 1) / quizQuestions.length) * 100}%`,
              }}
            />
          </View>
        </View>

        {/* Question */}
        <View className="px-6 py-8">
          <View
            className="rounded-3xl p-6"
            style={{ backgroundColor: "#1a1a2e" }}
          >
            <Text className="text-xl font-semibold text-white leading-relaxed">
              {currentQuestion.question}
            </Text>
          </View>
        </View>

        {/* Options */}
        <View className="px-6 pb-4">
          <View className="gap-3">
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedOption === index;
              const isCorrect = index === currentQuestion.correctIndex;
              const showCorrect = answered && isCorrect;
              const showWrong = answered && isSelected && !isCorrect;

              let bgColor = "#F5F1ED";
              let borderColor = "#E0D5CC";
              let textColor = "#2C2C2C";

              if (showCorrect) {
                bgColor = "#6BA58730";
                borderColor = "#6BA587";
                textColor = "#6BA587";
              } else if (showWrong) {
                bgColor = "#E85D4C30";
                borderColor = "#E85D4C";
                textColor = "#E85D4C";
              } else if (isSelected) {
                bgColor = "#4A90A430";
                borderColor = "#4A90A4";
              }

              return (
                <Pressable
                  key={index}
                  onPress={() => handleOptionPress(index)}
                  disabled={answered}
                  style={({ pressed }) => [
                    { opacity: pressed && !answered ? 0.7 : 1 },
                  ]}
                >
                  <View
                    className="rounded-2xl p-4 flex-row items-center border"
                    style={{
                      backgroundColor: bgColor,
                      borderColor: borderColor,
                    }}
                  >
                    <View
                      className="w-8 h-8 rounded-full items-center justify-center mr-3"
                      style={{
                        backgroundColor: answered && isCorrect
                          ? "#6BA587"
                          : answered && isSelected && !isCorrect
                          ? "#E85D4C"
                          : "#4A90A420",
                      }}
                    >
                      {answered && isCorrect ? (
                        <Ionicons name="checkmark" size={18} color="white" />
                      ) : answered && isSelected && !isCorrect ? (
                        <Ionicons name="close" size={18} color="white" />
                      ) : (
                        <Text
                          className="font-semibold"
                          style={{ color: "#4A90A4" }}
                        >
                          {String.fromCharCode(65 + index)}
                        </Text>
                      )}
                    </View>
                    <Text
                      className="flex-1 text-base font-medium"
                      style={{ color: textColor }}
                    >
                      {option}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Explanation */}
        {answered && (
          <View className="px-6 pb-4">
            <View
              className="rounded-2xl p-4"
              style={{
                backgroundColor: selectedOption === currentQuestion.correctIndex
                  ? "#6BA58715"
                  : "#E85D4C15",
              }}
            >
              <View className="flex-row items-start">
                <Ionicons
                  name={
                    selectedOption === currentQuestion.correctIndex
                      ? "checkmark-circle"
                      : "information-circle"
                  }
                  size={20}
                  color={
                    selectedOption === currentQuestion.correctIndex
                      ? "#6BA587"
                      : "#E85D4C"
                  }
                />
                <Text className="text-sm text-foreground ml-2 flex-1 leading-relaxed">
                  {currentQuestion.explanation}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Next Button */}
        {answered && (
          <View className="px-6 pb-8">
            <Pressable
              onPress={handleNext}
              className="rounded-full py-4 items-center"
              style={{ backgroundColor: "#4A90A4" }}
            >
              <Text className="text-white font-semibold text-lg">
                {isLastQuestion ? "查看结果" : "下一题"}
              </Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
