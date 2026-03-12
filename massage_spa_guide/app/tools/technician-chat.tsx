import { useCallback, useRef, useState } from "react";
import {
  ScrollView,
  Text,
  View,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Stack } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { trpc } from "@/lib/trpc";

interface Character {
  id: string;
  name: string;
  avatar: string;
  subtitle: string;
  description: string;
  color: string;
  openingLine: string;
}

const quickReplies = [
  "加钟",
  "不用了谢谢",
  "多少钱？",
  "轻一点",
  "有什么推荐？",
  "办卡有优惠吗",
];

const characters: Character[] = [
  {
    id: "char-pushyseller",
    name: "小美",
    avatar: "💁‍♀️",
    subtitle: "推销达人",
    description: "热情外向，话术满级，不断试探你要不要升级加项目",
    color: "#E85D4C",
    openingLine: "哎呀老板来啦！快请进快请进～今天要做什么项目呀？我们最近新到了一款玫瑰精油，超级好用的！",
  },
  {
    id: "char-slangmaster",
    name: "老王",
    avatar: "🧔",
    subtitle: "油腻老手",
    description: "黑话连篇，暗示不断，像个老江湖在带你入门",
    color: "#8B7355",
    openingLine: "老板来了啊，坐坐坐。看你面生，第一次来这边玩？哥给你说说我们这的门道...",
  },
  {
    id: "char-newbie",
    name: "小雪",
    avatar: "👧",
    subtitle: "新人技师",
    description: "刚入行不久，话少害羞，偶尔会犯点小错",
    color: "#6B5B95",
    openingLine: "你、你好...我是小雪，今天由我为你服务。那个...你想做哪个项目呀？",
  },
  {
    id: "char-professional",
    name: "张姐",
    avatar: "👩‍⚕️",
    subtitle: "资深正规派",
    description: "十五年经验，专业直接，不搞任何套路",
    color: "#4A90A4",
    openingLine: "你好，我是张姐。先帮你看看身体状况吧——肩颈紧不紧？平时久坐多还是站得多？",
  },
];

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

type Phase = "select" | "chatting" | "review";

export default function TechnicianChatScreen() {
  const [phase, setPhase] = useState<Phase>("select");
  const [selectedChar, setSelectedChar] = useState<Character | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [reviewText, setReviewText] = useState("");
  const [isLoadingReview, setIsLoadingReview] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const roleplay = trpc.advisor.roleplay.useMutation();
  const roleplayReview = trpc.advisor.roleplayReview.useMutation();

  const selectCharacter = (char: Character) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedChar(char);
    setMessages([
      {
        id: "msg-opening",
        role: "assistant",
        content: char.openingLine,
      },
    ]);
    setPhase("chatting");
    setReviewText("");
  };

  const sendMessage = useCallback(async () => {
    if (!inputText.trim() || !selectedChar || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: inputText.trim(),
    };

    const updated = [...messages, userMsg];
    setMessages(updated);
    setInputText("");
    setIsLoading(true);

    try {
      const historyForApi = updated.slice(-10).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const result = await roleplay.mutateAsync({
        characterId: selectedChar.id,
        messages: historyForApi,
      });

      setMessages([
        ...updated,
        {
          id: `msg-${Date.now() + 1}`,
          role: "assistant",
          content: result.reply,
        },
      ]);
    } catch {
      setMessages([
        ...updated,
        {
          id: `msg-${Date.now() + 1}`,
          role: "assistant",
          content: "（信号不好，没听清你说什么...再说一次？）",
        },
      ]);
    } finally {
      setIsLoading(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [inputText, selectedChar, isLoading, messages, roleplay]);

  const requestReview = async () => {
    if (!selectedChar || messages.length < 3) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setPhase("review");
    setIsLoadingReview(true);

    try {
      const result = await roleplayReview.mutateAsync({
        characterId: selectedChar.id,
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
      });
      setReviewText(result.reply);
    } catch {
      setReviewText("AI 复盘加载失败，请稍后重试。");
    } finally {
      setIsLoadingReview(false);
    }
  };

  const resetToSelect = () => {
    setPhase("select");
    setSelectedChar(null);
    setMessages([]);
    setInputText("");
    setReviewText("");
  };

  // --- Character Select ---
  if (phase === "select") {
    return (
      <ScreenContainer className="">
        <Stack.Screen options={{ title: "技师对话", headerBackTitle: "返回" }} />
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="flex-1">
          <View className="px-6 pt-4 pb-6">
            <View
              className="rounded-3xl p-6"
              style={{ backgroundColor: "#1a1a2e" }}
            >
              <Text className="text-3xl font-bold text-white mb-2">💬 技师对话</Text>
              <Text className="text-base text-white/70">
                选一个技师角色，练习应对各种话术{"\n"}对话结束后 AI 会帮你复盘
              </Text>
            </View>
          </View>

          <View className="px-6 pb-8">
            <View className="gap-4">
              {characters.map((char) => (
                <Pressable
                  key={char.id}
                  onPress={() => selectCharacter(char)}
                  style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                >
                  <View
                    className="rounded-2xl p-5 border"
                    style={{
                      backgroundColor: char.color + "10",
                      borderColor: char.color + "30",
                    }}
                  >
                    <View className="flex-row items-center mb-3">
                      <Text className="text-3xl mr-3">{char.avatar}</Text>
                      <View className="flex-1">
                        <Text className="text-lg font-bold text-foreground">
                          {char.name}
                        </Text>
                        <Text
                          className="text-sm font-medium"
                          style={{ color: char.color }}
                        >
                          {char.subtitle}
                        </Text>
                      </View>
                      <Ionicons name="chatbubbles" size={24} color={char.color} />
                    </View>
                    <Text className="text-sm text-muted leading-relaxed">
                      {char.description}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>
        </ScrollView>
      </ScreenContainer>
    );
  }

  // --- Chatting ---
  if (phase === "chatting" && selectedChar) {
    return (
      <ScreenContainer className="">
        <Stack.Screen
          options={{
            title: `${selectedChar.avatar} ${selectedChar.name}`,
            headerBackTitle: "返回",
          }}
        />
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={100}
        >
          {/* Chat Header */}
          <View
            className="px-4 py-2 flex-row items-center justify-between"
            style={{ backgroundColor: selectedChar.color + "10" }}
          >
            <Text className="text-xs text-muted">
              和{selectedChar.name}（{selectedChar.subtitle}）对话中
            </Text>
            <Pressable
              onPress={requestReview}
              disabled={messages.length < 3}
              style={{ opacity: messages.length < 3 ? 0.4 : 1 }}
            >
              <View className="flex-row items-center">
                <Ionicons name="analytics" size={16} color={selectedChar.color} />
                <Text
                  className="text-xs font-medium ml-1"
                  style={{ color: selectedChar.color }}
                >
                  查看复盘
                </Text>
              </View>
            </Pressable>
          </View>

          {/* Messages */}
          <ScrollView
            ref={scrollRef}
            className="flex-1 px-4"
            contentContainerStyle={{ paddingVertical: 16 }}
            onContentSizeChange={() =>
              scrollRef.current?.scrollToEnd({ animated: true })
            }
          >
            {messages.map((msg) => (
              <View
                key={msg.id}
                className={`mb-3 flex-row ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <View className="w-8 h-8 rounded-full items-center justify-center mr-2 mt-1"
                    style={{ backgroundColor: selectedChar.color + "20" }}
                  >
                    <Text className="text-sm">{selectedChar.avatar}</Text>
                  </View>
                )}
                <View
                  className="rounded-2xl px-4 py-3"
                  style={{
                    maxWidth: "75%",
                    backgroundColor:
                      msg.role === "user" ? "#4A90A4" : selectedChar.color + "15",
                  }}
                >
                  <Text
                    className="text-sm leading-relaxed"
                    style={{
                      color: msg.role === "user" ? "white" : "#2C2C2C",
                    }}
                  >
                    {msg.content}
                  </Text>
                </View>
              </View>
            ))}
            {isLoading && (
              <View className="mb-3 flex-row justify-start">
                <View className="w-8 h-8 rounded-full items-center justify-center mr-2 mt-1"
                  style={{ backgroundColor: selectedChar.color + "20" }}
                >
                  <Text className="text-sm">{selectedChar.avatar}</Text>
                </View>
                <View
                  className="rounded-2xl px-4 py-3"
                  style={{ backgroundColor: selectedChar.color + "15" }}
                >
                  <ActivityIndicator size="small" color={selectedChar.color} />
                </View>
              </View>
            )}
          </ScrollView>

          {/* Quick Replies */}
          {!isLoading && (
            <View className="px-4 py-2">
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row gap-2">
                  {quickReplies.map((text) => (
                    <Pressable
                      key={text}
                      onPress={() => {
                        setInputText(text);
                      }}
                    >
                      <View
                        className="rounded-full px-4 py-2 border"
                        style={{
                          borderColor: selectedChar.color + "40",
                          backgroundColor: selectedChar.color + "08",
                        }}
                      >
                        <Text
                          className="text-sm"
                          style={{ color: selectedChar.color }}
                        >
                          {text}
                        </Text>
                      </View>
                    </Pressable>
                  ))}
                </View>
              </ScrollView>
            </View>
          )}

          {/* Input */}
          <View className="px-4 py-3 border-t border-border bg-background">
            <View
              style={{
                flexDirection: "row",
                alignItems: "flex-end",
                gap: 8,
              }}
            >
              <View
                style={{
                  flex: 1,
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: "#E0D5CC",
                  backgroundColor: "#FAF7F4",
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                }}
              >
                <TextInput
                  className="text-sm text-foreground"
                  style={{ minHeight: 36, outlineStyle: "none" } as any}
                  placeholder="你的回应..."
                  placeholderTextColor="#999"
                  value={inputText}
                  onChangeText={setInputText}
                  multiline
                  maxLength={500}
                  onSubmitEditing={sendMessage}
                  editable={!isLoading}
                />
              </View>
              <Pressable
                onPress={sendMessage}
                disabled={!inputText.trim() || isLoading}
              >
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor:
                      inputText.trim() && !isLoading ? "#4A90A4" : "#E0D5CC",
                  }}
                >
                  <Ionicons
                    name="send"
                    size={18}
                    color={inputText.trim() && !isLoading ? "white" : "#999"}
                  />
                </View>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </ScreenContainer>
    );
  }

  // --- Review ---
  if (phase === "review" && selectedChar) {
    return (
      <ScreenContainer className="">
        <Stack.Screen options={{ title: "对话复盘", headerBackTitle: "返回" }} />
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="flex-1">
          <View className="px-6 pt-6 pb-4">
            <View className="items-center mb-6">
              <Text className="text-5xl mb-3">{selectedChar.avatar}</Text>
              <Text className="text-xl font-bold text-foreground">
                与{selectedChar.name}的对话复盘
              </Text>
              <Text className="text-sm text-muted mt-1">
                共 {messages.filter((m) => m.role === "user").length} 轮对话
              </Text>
            </View>
          </View>

          {/* AI Review */}
          <View className="px-6 pb-4">
            <Text className="text-lg font-semibold text-foreground mb-3">
              AI 点评
            </Text>
            <View
              className="rounded-2xl p-5"
              style={{ backgroundColor: selectedChar.color + "10" }}
            >
              {isLoadingReview ? (
                <View className="flex-row items-center justify-center py-6">
                  <ActivityIndicator size="small" color={selectedChar.color} />
                  <Text className="text-muted ml-2">AI 正在复盘分析...</Text>
                </View>
              ) : (
                <Text className="text-sm text-foreground leading-relaxed">
                  {reviewText}
                </Text>
              )}
            </View>
          </View>

          {/* Conversation Summary */}
          <View className="px-6 pb-4">
            <Text className="text-lg font-semibold text-foreground mb-3">
              对话回顾
            </Text>
            <View className="gap-2">
              {messages.map((msg) => (
                <View
                  key={msg.id}
                  className="rounded-xl p-3"
                  style={{
                    backgroundColor:
                      msg.role === "user" ? "#4A90A410" : selectedChar.color + "08",
                  }}
                >
                  <Text className="text-xs text-muted mb-1">
                    {msg.role === "user" ? "你" : selectedChar.name}
                  </Text>
                  <Text className="text-sm text-foreground">{msg.content}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Actions */}
          <View className="px-6 pb-8">
            <Pressable
              onPress={() => {
                setPhase("chatting");
              }}
              className="rounded-full py-4 items-center mb-3"
              style={{ backgroundColor: selectedChar.color }}
            >
              <Text className="text-white font-semibold text-lg">继续对话</Text>
            </Pressable>
            <Pressable onPress={resetToSelect} className="items-center">
              <Text className="text-[#4A90A4] font-medium">换一个角色</Text>
            </Pressable>
          </View>
        </ScrollView>
      </ScreenContainer>
    );
  }

  return null;
}
