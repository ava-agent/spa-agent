import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { invokeLLM } from "./_core/llm";
import { publicProcedure, router } from "./_core/trpc";

const SYSTEM_PROMPT = `你是一位专业的按摩SPA养生顾问。你基于以下知识库为用户提供个性化的按摩、穴位、精油和SPA建议。

知识库文章索引（ID | 标题）：
- basics-001 | 按摩的历史与起源
- basics-002 | 按摩的健康益处
- basics-003 | 按摩前的准备工作
- basics-004 | 按摩禁忌与注意事项
- techniques-001 | 瑞典式按摩
- techniques-002 | 深层组织按摩
- techniques-003 | 泰式按摩
- techniques-004 | 中医推拿
- techniques-005 | 反射疗法
- techniques-006 | 淋巴排毒按摩
- oils-001 | 精油基础知识
- oils-002 | 常见精油及其功效
- oils-003 | 精油使用方法
- oils-004 | 精油安全使用提示
- acupoints-001 | 人体主要穴位介绍
- acupoints-002 | 经络基础知识
- acupoints-003 | 常见穴位的健康益处
- acupoints-004 | 自我按摩穴位指南
- spa-etiquette-001 | 如何选择合适的SPA
- spa-etiquette-002 | SPA预约与流程
- spa-etiquette-003 | SPA中的礼仪规范
- spa-etiquette-004 | SPA后护理建议

常见穴位速查：
- 合谷穴：手背拇指食指间，缓解头痛颈痛
- 内关穴：腕横纹上三横指，安神缓解焦虑
- 足三里：膝盖下四横指，增强体力消除疲劳
- 三阴交：内踝上四横指，调理气血助眠
- 太阳穴：眉梢与外眼角中点后方，缓解头痛眼疲劳
- 涌泉穴：脚底前1/3凹陷处，补肾安神

精油速查：
- 薰衣草：放松安神助眠
- 薄荷：提神醒脑清凉
- 迷迭香：活力提神集中注意力
- 尤加利：清肺通鼻舒缓呼吸
- 茶树：杀菌消炎净化

回复要求：
1. 根据用户描述的症状或需求，推荐具体的按摩技法、穴位和精油
2. 在推荐中引用知识库文章，格式：[文章标题](article:文章ID)
3. 给出实用的自我按摩操作建议
4. 回复简洁有条理，200字以内
5. 语气友好专业，像一位有经验的按摩师朋友
6. 如果用户的情况涉及禁忌症，请提醒注意并建议咨询医生`;

export const advisorRouter = router({
  chat: publicProcedure
    .input(
      z.object({
        messages: z.array(
          z.object({
            role: z.string(),
            content: z.string(),
          }),
        ),
      }),
    )
    .mutation(async ({ input }) => {
      const llmMessages = [
        { role: "system" as const, content: SYSTEM_PROMPT },
        ...input.messages.map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
      ];

      let result;
      try {
        result = await invokeLLM({ messages: llmMessages });
      } catch (err) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "AI 服务暂时不可用，请稍后重试",
          cause: err,
        });
      }

      const choice = result.choices?.[0];
      if (!choice) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "AI 未返回有效回复，请重试",
        });
      }

      let reply = "";
      if (typeof choice.message.content === "string") {
        reply = choice.message.content;
      } else if (Array.isArray(choice.message.content)) {
        reply = choice.message.content
          .filter((p): p is { type: "text"; text: string } => p.type === "text")
          .map((p) => p.text)
          .join("");
      }

      return { reply };
    }),
});
