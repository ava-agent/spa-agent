import { Pressable, ScrollView, Text, View } from "react-native";

interface QuickChipsProps {
  chips: { label: string; value: string }[];
  onSelect: (value: string) => void;
}

export function QuickChips({ chips, onSelect }: QuickChipsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 24, gap: 8 }}
    >
      {chips.map((chip) => (
        <Pressable
          key={chip.value}
          onPress={() => onSelect(chip.value)}
          style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
        >
          <View className="bg-surface border border-border rounded-full px-4 py-2">
            <Text className="text-sm text-foreground">{chip.label}</Text>
          </View>
        </Pressable>
      ))}
    </ScrollView>
  );
}
