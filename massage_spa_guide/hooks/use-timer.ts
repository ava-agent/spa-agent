import * as Haptics from "expo-haptics";
import { useCallback, useEffect, useRef, useState } from "react";
import { Platform } from "react-native";

interface TimerStep {
  acupointName: string;
  location: string;
  benefit: string;
  durationSeconds: number;
  relatedArticle: string;
}

interface UseTimerParams {
  steps: TimerStep[];
  onComplete?: () => void;
  hapticInterval?: number; // ms, default 2000
}

export function useTimer({ steps, onComplete, hapticInterval = 2000 }: UseTimerParams) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(steps[0]?.durationSeconds ?? 0);
  const [isRunning, setIsRunning] = useState(false);
  const [isTransition, setIsTransition] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hapticRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentStep = steps[currentStepIndex] ?? null;
  const totalSteps = steps.length;
  const progress = currentStep
    ? 1 - secondsLeft / currentStep.durationSeconds
    : 1;

  // Countdown timer
  useEffect(() => {
    if (!isRunning || isTransition) return;
    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          // Step completed
          if (currentStepIndex < totalSteps - 1) {
            // Transition to next step
            if (Platform.OS !== "web") {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
            setIsTransition(true);
            setIsRunning(false);
            setTimeout(() => {
              setCurrentStepIndex((i) => i + 1);
              setSecondsLeft(steps[currentStepIndex + 1].durationSeconds);
              setIsTransition(false);
              setIsRunning(true);
            }, 3000);
          } else {
            // All done
            if (Platform.OS !== "web") {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
            setIsRunning(false);
            setIsFinished(true);
            onComplete?.();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, isTransition, currentStepIndex, totalSteps, steps, onComplete]);

  // Haptic pulse
  useEffect(() => {
    if (!isRunning || isTransition || Platform.OS === "web") return;
    hapticRef.current = setInterval(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }, hapticInterval);
    return () => {
      if (hapticRef.current) clearInterval(hapticRef.current);
    };
  }, [isRunning, isTransition, hapticInterval]);

  const start = useCallback(() => {
    setIsRunning(true);
  }, []);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const toggle = useCallback(() => {
    setIsRunning((prev) => !prev);
  }, []);

  const skip = useCallback(() => {
    if (currentStepIndex < totalSteps - 1) {
      setIsRunning(false);
      setCurrentStepIndex((i) => i + 1);
      setSecondsLeft(steps[currentStepIndex + 1].durationSeconds);
    }
  }, [currentStepIndex, totalSteps, steps]);

  const reset = useCallback(() => {
    setIsRunning(false);
    setIsTransition(false);
    setIsFinished(false);
    setCurrentStepIndex(0);
    setSecondsLeft(steps[0]?.durationSeconds ?? 0);
  }, [steps]);

  return {
    currentStep,
    currentStepIndex,
    totalSteps,
    secondsLeft,
    progress,
    isRunning,
    isTransition,
    isFinished,
    start,
    pause,
    toggle,
    skip,
    reset,
  };
}
