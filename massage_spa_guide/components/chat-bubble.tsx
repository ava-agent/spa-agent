import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

interface ChatBubbleProps {
  role: "user" | "assistant";
  content: string;
}

/** Parse article links like [文章标题](article:文章ID) */
function parseContent(content: string, router: ReturnType<typeof useRouter>) {
  const parts = content.split(/(\[.*?\]\(article:.*?\))/g);
  return parts.map((part, i) => {
    const match = part.match(/\[(.*?)\]\(article:(.*?)\)/);
    if (match) {
      return (
        <Pressable
          key={i}
          onPress={() => router.push({ pathname: "/knowledge/[id]", params: { id: match[2] } })}
        >
          <Text className="text-primary underline">{match[1]}</Text>
        </Pressable>
      );
    }
    return (
      <Text key={i} className={`text-sm leading-relaxed ${part ? "" : "hidden"}`}>
        {part}
      </Text>
    );
  });
}

export function ChatBubble({ role, content }: ChatBubbleProps) {
  const router = useRouter();
  const isUser = role === "user";

  return (
    <View className={`flex-row ${isUser ? "justify-end" : "justify-start"} mb-3`}>
      <View
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          isUser
            ? "bg-primary rounded-br-sm"
            : "bg-surface border border-border rounded-bl-sm"
        }`}
      >
        {isUser ? (
          <Text className="text-sm text-white leading-relaxed">{content}</Text>
        ) : (
          <View className="flex-row flex-wrap">{parseContent(content, router)}</View>
        )}
      </View>
    </View>
  );
}
