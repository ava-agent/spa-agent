# Men's SPA Interactive Features Design

## Overview

Add two AI-powered interactive tools to the men's SPA guide section:
1. **Scenario Simulator** — branching story with pre-set choices + AI-generated endings
2. **Technician Chat** — AI role-playing as different technician personas for conversation practice

## Feature 1: Scenario Simulator

**Route**: `app/tools/scenario-sim.tsx`
**Data**: `data/scenarios.json`

### UX Flow

```
Scenario List → Scenario Intro → Decision Node (repeat) → Ending + AI Review
```

- User picks from 6 pre-set scenarios
- Each scenario has 3-5 branching decision nodes with 3 options each
- Options are pre-authored with scores and tags
- At the ending node, call GLM to generate personalized review based on the user's choice path
- Final screen: grade (S/A/B/C), total score, AI commentary, related article links

### Scenarios (6 total)

| ID | Title | Difficulty | Decision Points |
|---|---|---|---|
| scene-001 | 第一次进店 | beginner | 4 |
| scene-002 | 技师疯狂推销 | intermediate | 3 |
| scene-003 | 朋友带路局 | beginner | 3 |
| scene-004 | 出差找店 | intermediate | 4 |
| scene-005 | 遭遇仙人跳 | advanced | 3 |
| scene-006 | 高端会所初体验 | intermediate | 3 |

### Data Structure

```typescript
interface Scenario {
  id: string;
  title: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  icon: string;
  intro: string;
  nodes: Record<string, ScenarioNode>;
  startNode: string;
  maxScore: number;
}

interface ScenarioNode {
  text: string;
  options?: ScenarioOption[];  // undefined = ending node
  ending?: {
    grade: string;
    summary: string;
    articleIds: string[];
  };
}

interface ScenarioOption {
  text: string;
  score: number;       // 0-10
  next: string;        // next node ID
  tag: "safe" | "risky" | "smart";
}
```

### AI Review (ending only)

tRPC call to `advisor.scenarioReview`:
- Input: scenario ID, user choices (node + option pairs), total score
- System prompt instructs GLM to review the choices, give advice, reference knowledge articles
- Output: review text with article links

## Feature 2: Technician Chat

**Route**: `app/tools/technician-chat.tsx`
**Backend**: New `roleplay` mutation in `advisor-router.ts`

### UX Flow

```
Character Select → Chat Interface → (optional) Review Mode
```

### Characters (4 personas)

| ID | Name | Style | Training Goal |
|---|---|---|---|
| char-pushyseller | 小美 — 推销达人 | Aggressive upselling, testing boundaries | Refuse upsells, control spending |
| char-slangmaster | 老王 — 油腻老手 | Heavy slang, subtle hints | Understand industry jargon |
| char-newbie | 小雪 — 新人技师 | Shy, nervous, occasional mistakes | Judge service quality, communicate |
| char-professional | 张姐 — 资深正规派 | Professional, direct, no tricks | Benchmark for normal interactions |

### Character Data

Defined as constants in the component file. Each character has:
- `id`, `name`, `avatar` (emoji), `subtitle`, `description`
- `color` (theme color for chat UI)
- `systemPrompt` (full role-play instructions for GLM)

### System Prompt Pattern

Each prompt includes:
1. Character persona definition (personality, speaking style, behavior patterns)
2. Scene context (you are in a SPA, the customer just walked in)
3. Behavioral rules (stay in character, proactively advance the scenario)
4. Language rules (use Chinese, match the character's education level and tone)

### Review Mode

After chatting, user can tap "查看复盘" button:
- Sends the full conversation to a separate `advisor.roleplayReview` mutation
- System prompt switches to advisor mode: analyze the conversation, rate user's responses, give tips
- Displayed as a summary card below the chat

### tRPC Routes (in advisor-router.ts)

```typescript
roleplay: publicProcedure
  .input(z.object({
    characterId: z.string(),
    messages: z.array(z.object({ role: z.string(), content: z.string() })),
  }))
  .mutation(...)

roleplayReview: publicProcedure
  .input(z.object({
    characterId: z.string(),
    messages: z.array(z.object({ role: z.string(), content: z.string() })),
  }))
  .mutation(...)

scenarioReview: publicProcedure
  .input(z.object({
    scenarioId: z.string(),
    choices: z.array(z.object({ nodeId: z.string(), optionIndex: z.number() })),
    totalScore: z.number(),
  }))
  .mutation(...)
```

## Feature 3: Entry Integration

**File**: `app/tools/mens-guide.tsx`

Add "互动体验" section below the existing "消费知识测试" quiz entry:
- Scenario Simulator card with icon, title, subtitle
- Technician Chat card with icon, title, subtitle

Same card styling pattern as the existing quiz entry.

## Files to Create/Modify

### New Files
- `data/scenarios.json` — 6 scenarios with branching nodes
- `app/tools/scenario-sim.tsx` — Scenario simulator screen
- `app/tools/technician-chat.tsx` — AI technician chat screen

### Modified Files
- `server/advisor-router.ts` — Add roleplay, roleplayReview, scenarioReview mutations
- `app/tools/mens-guide.tsx` — Add interactive tools entry section

## Non-Goals
- No persistent progress tracking for scenarios (stateless, replay anytime)
- No chat history persistence for technician chat (session-only)
- No user accounts or leaderboards
