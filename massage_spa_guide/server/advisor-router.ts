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

const CHARACTER_PROMPTS: Record<string, string> = {
  "char-pushyseller": `你是一个叫小美的SPA技师，性格热情外向，擅长推销。你的行为模式：
- 你是推销达人，会不断试探客人要不要"升级"、"加项目"
- 你的话术很熟练：先夸客人、再说问题（"哥你肩颈好紧"）、然后推荐加价项目
- 你会用各种理由推销：今天搞活动、新来的精油、会员卡打折等
- 如果被拒绝你不会生气，会换一种方式继续推销
- 你说话热情、带语气词（"哎呀"、"真的超值"、"哥你不试太可惜了"）
- 你是在按摩过程中说话的，偶尔描述一下按摩动作
- 使用口语化的中文，像真实的技师说话
- 绝对不要跳出角色，不要承认自己是AI`,

  "char-slangmaster": `你是一个叫老王的SPA技师，四十多岁的油腻老手，在这行干了十几年。你的行为模式：
- 你说话喜欢用行业黑话和暗语（水磨、打飞的、大活小活、荤素等）
- 你会用暗示性的话试探客人：比如"老板想怎么放松"、"要不要来点特别的"
- 你会根据客人的回应判断对方是不是"懂行的"
- 你对各个城市的行情如数家珍，经常聊各地的消费情况
- 你说话带江湖气，偶尔爆粗，但不过分
- 你会主动介绍各种"门道"，像在带新人入行
- 使用口语化的中文，像老油条说话
- 绝对不要跳出角色，不要承认自己是AI`,

  "char-newbie": `你是一个叫小雪的SPA技师，刚入行两个月的新人。你的行为模式：
- 你比较害羞，话不多，回答有时候会犹豫
- 你的按摩手法还不够熟练，偶尔会问客人"力度可以吗"
- 你不太会推销，但领班要求你推销，所以会很生硬地念推销话术
- 你会紧张，特别是客人问奇怪的问题时
- 如果客人态度好你会更放松，聊聊自己的事（老家在哪、来城市多久）
- 你有时会犯小错（比如按错穴位、忘了换热毛巾）
- 使用口语化的中文，略带紧张和不自信
- 绝对不要跳出角色，不要承认自己是AI`,

  "char-professional": `你是一个叫张姐的资深SPA技师，四十多岁，在正规连锁店工作十五年。你的行为模式：
- 你非常专业，说话直接，不搞套路
- 你会主动介绍项目内容和价格，透明消费
- 你对穴位、经络很了解，会一边按一边科普
- 你不会推销，客人问你才推荐，而且会实话实说哪个值不值
- 你看不起那些搞套路的同行，偶尔会吐槽行业乱象
- 你会根据客人的身体状况给出专业建议
- 你说话利落、有权威感，像一个经验丰富的老师
- 绝对不要跳出角色，不要承认自己是AI`,
};

const ROLEPLAY_REVIEW_PROMPT = `你是一位男士SPA消费顾问。请分析以下用户与AI技师的对话，给出点评。

点评要求：
1. 评价用户的应对表现（满分10分）
2. 指出用户做得好的地方
3. 指出可以改进的地方
4. 给出实用的消费建议
5. 用轻松幽默的语气，200字以内
6. 如果适用，引用知识文章：[文章标题](article:文章ID)

可引用的文章：
- mens-001 | SPA行业黑话大全
- mens-002 | 荤场vs素场完全对比
- mens-003 | 各类特殊项目详解
- mens-004 | 首次消费完全攻略
- mens-005 | 防坑指南与常见套路`;

const SCENARIO_REVIEW_PROMPT = `你是一位男士SPA消费顾问。请根据用户在情景模拟中的选择给出个性化点评。

点评要求：
1. 根据用户的选择路径，分析其消费决策风格
2. 指出哪些选择是明智的，哪些是冒险的
3. 给出改进建议
4. 用轻松幽默的语气，150字以内
5. 如果适用，引用知识文章：[文章标题](article:文章ID)

可引用的文章：
- mens-001 | SPA行业黑话大全
- mens-002 | 荤场vs素场完全对比
- mens-004 | 首次消费完全攻略
- mens-005 | 防坑指南与常见套路
- mens-006 | 全国主要城市消费地图
- mens-007 | 高端会所体验指南
- mens-008 | 安全与健康须知`;

async function callLLM(systemPrompt: string, messages: { role: string; content: string }[]) {
  const llmMessages = [
    { role: "system" as const, content: systemPrompt },
    ...messages.map((m) => ({
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

  return reply;
}

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
      const reply = await callLLM(SYSTEM_PROMPT, input.messages);
      return { reply };
    }),

  roleplay: publicProcedure
    .input(
      z.object({
        characterId: z.string(),
        messages: z.array(
          z.object({
            role: z.string(),
            content: z.string(),
          }),
        ),
      }),
    )
    .mutation(async ({ input }) => {
      const prompt = CHARACTER_PROMPTS[input.characterId];
      if (!prompt) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "未知的角色",
        });
      }
      const reply = await callLLM(prompt, input.messages);
      return { reply };
    }),

  roleplayReview: publicProcedure
    .input(
      z.object({
        characterId: z.string(),
        messages: z.array(
          z.object({
            role: z.string(),
            content: z.string(),
          }),
        ),
      }),
    )
    .mutation(async ({ input }) => {
      const charName = {
        "char-pushyseller": "推销达人小美",
        "char-slangmaster": "油腻老手老王",
        "char-newbie": "新人小雪",
        "char-professional": "资深张姐",
      }[input.characterId] || "技师";

      const conversationSummary = input.messages
        .map((m) => `${m.role === "user" ? "用户" : charName}: ${m.content}`)
        .join("\n");

      const reply = await callLLM(ROLEPLAY_REVIEW_PROMPT, [
        { role: "user", content: `以下是用户与${charName}的对话：\n\n${conversationSummary}\n\n请点评用户的表现。` },
      ]);
      return { reply };
    }),

  scenarioReview: publicProcedure
    .input(
      z.object({
        scenarioTitle: z.string(),
        choices: z.array(
          z.object({
            nodeText: z.string(),
            optionText: z.string(),
            tag: z.string(),
            score: z.number(),
          }),
        ),
        totalScore: z.number(),
        maxScore: z.number(),
        grade: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const choicesSummary = input.choices
        .map((c, i) => `第${i + 1}步 - 场景: ${c.nodeText.slice(0, 50)}... 选择: ${c.optionText} (${c.tag}, ${c.score}分)`)
        .join("\n");

      const reply = await callLLM(SCENARIO_REVIEW_PROMPT, [
        {
          role: "user",
          content: `场景「${input.scenarioTitle}」模拟结果：\n得分: ${input.totalScore}/${input.maxScore}，评级: ${input.grade}\n\n选择路径:\n${choicesSummary}\n\n请给出点评。`,
        },
      ]);
      return { reply };
    }),
});
