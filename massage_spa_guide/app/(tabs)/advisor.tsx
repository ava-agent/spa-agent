import { ChatBubble } from "@/components/chat-bubble";
import { QuickChips } from "@/components/quick-chips";
import { ScreenContainer } from "@/components/screen-container";
import { useChat } from "@/hooks/use-chat";
import { trpc } from "@/lib/trpc";
import * as Haptics from "expo-haptics";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

const QUICK_TAGS = [
  { label: "久坐腰痛怎么办", value: "我经常久坐办公，腰痛很严重，有什么按摩方法推荐？" },
  { label: "运动后肌肉酸痛", value: "运动后肌肉酸痛，推荐什么按摩恢复方法？" },
  { label: "失眠助眠穴位", value: "晚上经常失眠，有什么穴位可以帮助入睡？" },
  { label: "选精油入门", value: "精油按摩入门，推荐适合新手的精油和用法？" },
  { label: "肩颈僵硬缓解", value: "肩颈特别僵硬，推荐有效的按摩技法？" },
  { label: "提神醒脑方法", value: "下午犯困，有什么快速提神的穴位或精油推荐？" },
];

function haptic() {
  if (Platform.OS !== "web") {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }
}

export default function AdvisorScreen() {
  const [inputText, setInputText] = useState("");
  const scrollRef = useRef<ScrollView>(null);
  const { messages, isLoading, error, sendMessage, clearHistory } = useChat();

  const advisorMutation = trpc.advisor.chat.useMutation();

  async function handleSend(text?: string) {
    const msg = (text ?? inputText).trim();
    if (!msg || isLoading) return;
    haptic();
    setInputText("");

    await sendMessage(msg, async (input) => {
      const result = await advisorMutation.mutateAsync(input);
      return result;
    });

    // Scroll to bottom after a short delay
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }

  function handleChipSelect(value: string) {
    haptic();
    handleSend(value);
  }

  return (
    <ScreenContainer>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        {/* Header */}
        <View className="px-6 pt-4 pb-3 flex-row items-center justify-between border-b border-border">
          <View>
            <Text className="text-2xl font-bold text-foreground">AI 养生顾问</Text>
            <Text className="text-xs text-muted mt-1">基于专业知识库的智能推荐</Text>
          </View>
          {messages.length > 0 && (
            <Pressable
              onPress={() => { haptic(); clearHistory(); }}
              style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
            >
              <Text className="text-sm text-muted">清空</Text>
            </Pressable>
          )}
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollRef}
          className="flex-1 px-4 pt-4"
          contentContainerStyle={{ flexGrow: 1 }}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
        >
          {messages.length === 0 ? (
            <View className="flex-1 items-center justify-center pb-8">
              <Text className="text-5xl mb-4">🧘</Text>
              <Text className="text-lg font-semibold text-foreground mb-2">你好，我是养生顾问</Text>
              <Text className="text-sm text-muted text-center px-8 mb-6">
                告诉我你的身体状况或需求，我会为你推荐合适的按摩方案、穴位和精油。
              </Text>
              <QuickChips chips={QUICK_TAGS} onSelect={handleChipSelect} />
            </View>
          ) : (
            <>
              {messages.map((msg) => (
                <ChatBubble key={msg.id} role={msg.role} content={msg.content} />
              ))}
              {isLoading && (
                <View className="flex-row items-center gap-2 mb-3 px-2">
                  <ActivityIndicator size="small" color="#8B7355" />
                  <Text className="text-sm text-muted">正在思考...</Text>
                </View>
              )}
              {error && (
                <View className="bg-red-50 rounded-xl p-3 mb-3">
                  <Text className="text-sm text-red-600">{error}</Text>
                </View>
              )}
            </>
          )}
        </ScrollView>

        {/* Quick chips when there are messages */}
        {messages.length > 0 && !isLoading && (
          <View className="py-2">
            <QuickChips chips={QUICK_TAGS.slice(0, 3)} onSelect={handleChipSelect} />
          </View>
        )}

        {/* Input bar */}
        <View className="px-4 py-3 border-t border-border flex-row items-end gap-2">
          <TextInput
            className="flex-1 bg-surface border border-border rounded-2xl px-4 py-3 text-sm text-foreground"
            placeholder="描述你的症状或需求..."
            placeholderTextColor="#A0937E"
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
            onSubmitEditing={() => handleSend()}
            returnKeyType="send"
          />
          <Pressable
            onPress={() => handleSend()}
            style={({ pressed }) => [{ opacity: pressed || isLoading ? 0.5 : 1 }]}
            disabled={isLoading}
          >
            <View className="bg-primary rounded-full w-11 h-11 items-center justify-center">
              <Text className="text-white text-lg">↑</Text>
            </View>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
