const readEnv = (name: string, fallback = "") => {
  const value = process.env[name]?.trim();
  return value && value.length > 0 ? value : fallback;
};

export const ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  arkApiKey: readEnv("ARK_API_KEY"),
  arkBaseUrl: readEnv("ARK_BASE_URL", "https://ark.cn-beijing.volces.com/api/coding/v3"),
  arkChatModel: readEnv("ARK_CHAT_MODEL", "doubao-seed-2-0-code-preview-260215"),
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
};
