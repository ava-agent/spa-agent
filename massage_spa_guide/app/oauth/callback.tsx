import { ThemedView } from "@/components/themed-view";
import * as Api from "@/lib/_core/api";
import * as Auth from "@/lib/_core/auth";
import * as Linking from "expo-linking";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const DEBUG_OAUTH = __DEV__;

function log(...args: unknown[]) {
  if (DEBUG_OAUTH) console.log("[OAuth]", ...args);
}
function logError(...args: unknown[]) {
  if (DEBUG_OAUTH) console.error("[OAuth]", ...args);
}

export default function OAuthCallback() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    code?: string;
    state?: string;
    error?: string;
    sessionToken?: string;
    user?: string;
  }>();
  const [status, setStatus] = useState<"processing" | "success" | "error">("processing");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      log("Callback handler triggered");
      log("Params received:", {
        code: params.code,
        state: params.state,
        error: params.error,
        sessionToken: params.sessionToken ? "present" : "missing",
        user: params.user ? "present" : "missing",
      });
      try {
        // Check for sessionToken in params first (web OAuth callback from server redirect)
        if (params.sessionToken) {
          log("Session token found in params (web callback)");
          await Auth.setSessionToken(params.sessionToken);

          // Decode and store user info if available
          if (params.user) {
            try {
              // Use atob for base64 decoding (works in both web and React Native)
              const userJson =
                typeof atob !== "undefined"
                  ? atob(params.user)
                  : Buffer.from(params.user, "base64").toString("utf-8");
              const userData = JSON.parse(userJson);
              const userInfo: Auth.User = {
                id: userData.id,
                openId: userData.openId,
                name: userData.name,
                email: userData.email,
                loginMethod: userData.loginMethod,
                lastSignedIn: new Date(userData.lastSignedIn || Date.now()),
              };
              await Auth.setUserInfo(userInfo);
              log("User info stored:", userInfo);
            } catch (err) {
              logError("Failed to parse user data:", err);
            }
          }

          setStatus("success");
          log("Web authentication successful, redirecting to home...");
          setTimeout(() => {
            router.replace("/(tabs)");
          }, 1000);
          return;
        }

        // Get URL from params or Linking
        let url: string | null = null;

        // Try to get from local search params first (works with expo-router)
        if (params.code || params.state || params.error) {
          log("Found params in route params");
          // Extract from params
          const urlParams = new URLSearchParams();
          if (params.code) urlParams.set("code", params.code);
          if (params.state) urlParams.set("state", params.state);
          if (params.error) urlParams.set("error", params.error);
          url = `?${urlParams.toString()}`;
          log("Constructed URL from params:", url);
        } else {
          log("No params found, checking Linking.getInitialURL()...");
          // Fallback: try to get from Linking
          const initialUrl = await Linking.getInitialURL();
          log("Linking.getInitialURL():", initialUrl);
          if (initialUrl) {
            url = initialUrl;
          }
        }

        // Check for error
        const error =
          params.error || (url ? new URL(url, "http://dummy").searchParams.get("error") : null);
        if (error) {
          logError("Error parameter found:", error);
          setStatus("error");
          setErrorMessage(error || "OAuth error occurred");
          return;
        }

        // Check for code and state
        let code: string | null = null;
        let state: string | null = null;
        let sessionToken: string | null = null;

        // Try to get from params first
        if (params.code && params.state) {
          log("Using code and state from route params");
          code = params.code;
          state = params.state;
        } else if (url) {
          log("Parsing code and state from URL:", url);
          // Parse from URL
          try {
            const urlObj = new URL(url);
            code = urlObj.searchParams.get("code");
            state = urlObj.searchParams.get("state");
            sessionToken = urlObj.searchParams.get("sessionToken");
            log("Extracted from URL:", {
              code: code?.substring(0, 20) + "...",
              state: state?.substring(0, 20) + "...",
              sessionToken: sessionToken ? "present" : "missing",
            });
          } catch (e) {
            log("Failed to parse as full URL, trying regex:", e);
            // Try parsing as relative URL with query params
            const match = url.match(/[?&](code|state|sessionToken)=([^&]+)/g);
            if (match) {
              match.forEach((param) => {
                const [key, value] = param.substring(1).split("=");
                if (key === "code") code = decodeURIComponent(value);
                if (key === "state") state = decodeURIComponent(value);
                if (key === "sessionToken") sessionToken = decodeURIComponent(value);
              });
              log("Extracted from regex:", {
                code: code?.substring(0, 20) + "...",
                state: state?.substring(0, 20) + "...",
                sessionToken: sessionToken ? "present" : "missing",
              });
            }
          }
        }

        log("Final extracted values:", {
          hasCode: !!code,
          hasState: !!state,
          hasSessionToken: !!sessionToken,
        });

        // If we have sessionToken directly from URL, use it
        if (sessionToken) {
          log("Session token found in URL, storing...");
          await Auth.setSessionToken(sessionToken);
          log("Session token stored successfully");
          // User info is already in the OAuth callback response
          // No need to fetch from API
          setStatus("success");
          log("Redirecting to home...");
          setTimeout(() => {
            router.replace("/(tabs)");
          }, 1000);
          return;
        }

        // Otherwise, exchange code for session token
        if (!code || !state) {
          logError("Missing code or state parameter", {
            hasCode: !!code,
            hasState: !!state,
          });
          setStatus("error");
          setErrorMessage("Missing code or state parameter");
          return;
        }

        // Exchange code for session token
        log("Exchanging code for session token...", {
          code: code.substring(0, 20) + "...",
          state: state.substring(0, 20) + "...",
        });
        const result = await Api.exchangeOAuthCode(code, state);
        log("Exchange result:", {
          hasSessionToken: !!result.sessionToken,
          hasUser: !!result.user,
        });

        if (result.sessionToken) {
          log("Session token received, storing...");
          // Store session token
          await Auth.setSessionToken(result.sessionToken);
          log("Session token stored successfully");

          // Store user info if available
          if (result.user) {
            log("User data received:", result.user);
            const userInfo: Auth.User = {
              id: result.user.id,
              openId: result.user.openId,
              name: result.user.name,
              email: result.user.email,
              loginMethod: result.user.loginMethod,
              lastSignedIn: new Date(result.user.lastSignedIn || Date.now()),
            };
            await Auth.setUserInfo(userInfo);
            log("User info stored:", userInfo);
          } else {
            log("No user data in result");
          }

          setStatus("success");
          log("Authentication successful, redirecting to home...");

          // Redirect to home after a short delay
          setTimeout(() => {
            log("Executing redirect...");
            router.replace("/(tabs)");
          }, 1000);
        } else {
          logError("No session token in result:", result);
          setStatus("error");
          setErrorMessage("No session token received");
        }
      } catch (error) {
        logError("Callback error:", error);
        setStatus("error");
        setErrorMessage(
          error instanceof Error ? error.message : "Failed to complete authentication",
        );
      }
    };

    handleCallback();
  }, [params.code, params.state, params.error, params.sessionToken, params.user, router]);

  return (
    <SafeAreaView className="flex-1" edges={["top", "bottom", "left", "right"]}>
      <ThemedView className="flex-1 items-center justify-center gap-4 p-5">
        {status === "processing" && (
          <>
            <ActivityIndicator size="large" />
            <Text className="mt-4 text-base leading-6 text-center text-foreground">
              Completing authentication...
            </Text>
          </>
        )}
        {status === "success" && (
          <>
            <Text className="text-base leading-6 text-center text-foreground">
              Authentication successful!
            </Text>
            <Text className="text-base leading-6 text-center text-foreground">
              Redirecting...
            </Text>
          </>
        )}
        {status === "error" && (
          <>
            <Text className="mb-2 text-xl font-bold leading-7 text-error">
              Authentication failed
            </Text>
            <Text className="text-base leading-6 text-center text-foreground">
              {errorMessage}
            </Text>
          </>
        )}
      </ThemedView>
    </SafeAreaView>
  );
}
