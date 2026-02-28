import { Text, View } from "react-native";

interface WeekDay {
  key: string;
  day: string;
  completed: boolean;
}

interface StreakCalendarProps {
  weekDates: WeekDay[];
  streak: number;
  totalCompleted: number;
}

export function StreakCalendar({ weekDates, streak, totalCompleted }: StreakCalendarProps) {
  const todayKey = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  })();

  return (
    <View className="bg-surface rounded-2xl p-5 border border-border">
      {/* Stats row */}
      <View className="flex-row justify-around mb-4">
        <View className="items-center">
          <Text className="text-2xl font-bold text-foreground">{streak}</Text>
          <Text className="text-xs text-muted mt-1">连续天数</Text>
        </View>
        <View className="items-center">
          <Text className="text-2xl font-bold text-foreground">{totalCompleted}</Text>
          <Text className="text-xs text-muted mt-1">总完成数</Text>
        </View>
      </View>

      {/* Week view */}
      <View className="flex-row justify-between">
        {weekDates.map((d) => {
          const isToday = d.key === todayKey;
          return (
            <View key={d.key} className="items-center gap-1">
              <Text className={`text-xs ${isToday ? "font-bold text-primary" : "text-muted"}`}>
                {d.day}
              </Text>
              <View
                className="w-8 h-8 rounded-full items-center justify-center"
                style={{
                  backgroundColor: d.completed ? "#6BA587" : isToday ? "#D4A57430" : "#E0D5CC30",
                  borderWidth: isToday ? 2 : 0,
                  borderColor: isToday ? "#8B7355" : "transparent",
                }}
              >
                {d.completed ? (
                  <Text className="text-sm text-white">✓</Text>
                ) : (
                  <Text className="text-sm text-muted">·</Text>
                )}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}
