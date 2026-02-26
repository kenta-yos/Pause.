import { GoogleGenerativeAI } from "@google/generative-ai";
import { PersonCentricInsight, TargetData, TargetInsightData, DialogueHistoryEntry } from "@/types/insight";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseJsonResponse(text: string): any {
  try {
    return JSON.parse(text);
  } catch {
    const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlockMatch) return JSON.parse(codeBlockMatch[1].trim());
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
    throw new Error("No JSON found in response");
  }
}

function buildPersonCentricPrompt(
  claim: string,
  target: TargetData,
  portrait: TargetInsightData | null,
  recentHistory: DialogueHistoryEntry[]
): string {
  const profileBlock = [
    `ニックネーム: ${target.nickname}`,
    target.relationship ? `関係性: ${target.relationship}` : null,
    target.ageGroup ? `年代: ${target.ageGroup}` : null,
    target.lifeContext ? `生活の背景: ${target.lifeContext}` : null,
    target.values ? `大切にしていること: ${target.values}` : null,
    target.infoSources ? `主な情報源: ${target.infoSources}` : null,
    target.dialoguePattern ? `対話パターン: ${target.dialoguePattern}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const portraitBlock = portrait
    ? `\n## Pause.がこの人について理解していること（ポートレート）\n${portrait.summary}\n`
    : "";

  const historyBlock =
    recentHistory.length > 0
      ? `\n## 直近の対話履歴\n${recentHistory
          .map(
            (h, i) =>
              `${i + 1}. 「${h.claim}」→ 信じる理由: ${h.output.beliefReason?.slice(0, 100)}…`
          )
          .join("\n")}\n`
      : "";

  return `# Pause. 人中心分析プロンプト

## アプリのコンセプト

「Pause.」は、右翼的・保守的な言説を信じている「大切な人」（家族・友人・パートナー）と、どのように向き合い、対話すべきかを考えるためのアプリです。

このアプリは「人中心」のアプローチを取ります。汎用的な分析ではなく、ユーザーが登録した**特定の人物**に合わせて、その人に響く具体的な対話アドバイスを生成します。

---

## 対話相手のプロフィール

${profileBlock}
${portraitBlock}
${historyBlock}

---

## 今回の入力

**言説：**
"${claim}"

---

## あなたの仕事

上記のプロフィール・ポートレート・対話履歴を踏まえて、この**特定の人物**に対して、今回の言説についてどう対話すべきかを分析してください。

---

## 出力の構成

### 1. beliefReason（この人がこの言説を信じる理由）

この**特定の人物**がなぜこの言説を信じているかを、プロフィール情報を踏まえて分析する。

必ず含めること：
- この人の**生活背景・価値観・情報源**と言説の接点
- 心理学・社会学の知見を活用（道徳心理学の研究による保守とリベラルの価値優先順位の違い、「ディープストーリー」の感覚、認知的不協和、直感と熟考の二重プロセス、バックファイア効果など）。概念を使う際は必ず平易に説明すること。名前の羅列は禁止。
- この人が抱えている感情・不安・ニーズの具体的な推測

文字数目安：400〜600字。**必ず複数の段落に分けて書く（段落間は改行\\nで区切る）。**

---

### 2. resonantAngles（この人に響く切り口）

この人の価値観・経験・関心に基づいて、**この人に特に響きやすい**対話の切り口を3〜5つ提案する。

各切り口は1〜2文で、なぜこの人に響くかの理由も添える。

---

### 3. scripts（今夜使える台詞）

この人との実際の会話で使える具体的な台詞パターンを**3つ以上**提案する。

各パターンに：
- **situation**: どんな場面で使うか（例：「食卓でこの話題が出たとき」「LINEで記事が送られてきたとき」）
- **script**: 実際の台詞（「」で括る。自然な日本語の会話文。この人の性格・関係性を考慮した言い回し）
- **note**: 補足・注意点（1文）

---

### 4. avoidWords（避けるべき言葉・態度）

この人との対話で**絶対に避けるべき**言葉・態度・話し方を3〜5つ。
この人の性格や対話パターンを考慮して、地雷を具体的に示す。

---

### 5. sources（参照知見）

分析に使った学術知見・統計・研究を列挙する。
URLは含めない。存在すると確信できるもののみ。

---

### 6. portraitUpdate（ポートレート更新）

今回の分析で新たにわかった、この人についての理解を1〜3文でまとめる。
前回のポートレートに追加する形で書く。
新たな発見がなければ空文字列にする。

---

## テーマ別の重要論点

### 移民・外国人
**理解**：「自分の街が変わってほしくない」「安全に暮らしたい」は普遍的感覚。外集団均一性バイアスは進化的な内集団保護メカニズムに由来する面もある。メディアの報道バイアスが確証バイアスを強化する。経済的な不安が「原因」を探す認知的ニーズを生み出し可視化されやすい「外国人」に向かう構造。
**事実**：法務省の犯罪白書・在留外国人統計。外国人の検挙率と在留外国人比率の関係。OECDの移民が税収・社会保障に与える影響の研究。

### ジェンダー・LGBTQ+
**理解**：「伝統的家族を守りたい」「急速な変化への戸惑い」は文化的アイデンティティとの葛藤。道徳心理学でいう「純粋性・神聖さ」への感受性。子どもへの影響を心配するのは「ケア」の道徳基盤からくる真剣な懸念。
**事実**：WHO・米国精神医学会の公式見解。オランダ等で伝統的家族が崩壊したエビデンスはない。LGBTQの精神的健康と社会的受容度の相関。

### 歴史認識
**理解**：「自国を誇りたい」「国家アイデンティティと過去の批判が矛盾するように感じる」実存的葛藤。歴史否定論は知識の欠如よりも心理的な防衛として機能。
**事実**：日本政府自身の河野談話・村山談話・菅内閣談話。ドイツの戦後処理比較。

### 経済格差・自己責任論
**理解**：「努力した自分が報われてほしい」正当な欲求。自己責任論は自尊心とも結びつく。
**事実**：OECD社会的流動性研究。ピケティ「21世紀の資本」。グラッドウェル「アウトライアーズ」。

### メディア不信・陰謀論
**理解**：「批判的に読む」と「すべてが嘘」は全く別物。陰謀論は複雑な世界を単純化したい認知的欲求に応える。
**事実**：フィンランドのメディアリテラシー教育。アルゴリズムによるエコーチェンバー。

### 環境・気候変動
**理解**：エネルギーコスト・雇用への現実的な不安。心理的距離の問題。
**事実**：IPCCの科学的コンセンサス。ナオミ・オレスケス「疑惑の商人」。再生可能エネルギー産業の雇用増。

### 安全保障・軍拡・愛国主義
**理解**：「家族を守りたい」普遍的感覚。安全保障のジレンマの認知は直感的に難しい。
**事実**：第一次世界大戦前の軍拡競争。EU統合・ASEANの成功事例。

### 差別・ヘイトスピーチ
**理解**：「表現の自由」の価値観。相対的剥奪感が不満の矛先をマイノリティに向ける。
**事実**：「在日特権」の法的事実に基づかない内容。国連・国際人権法。

### 民主主義への懐疑・権威主義
**理解**：「強いリーダー」への期待は認知的単純化の欲求。フロム「自由からの逃走」。
**事実**：権威主義の長期的な腐敗・人権侵害。フリーダム・ハウスの記録。

---

## トーンの原則

- **beliefReason**: 知的で誠実。冷静だが冷たくない。断定より「〜という傾向があります」。専門用語は必ず平易に説明。
- **resonantAngles/scripts**: 温かく実践的。具体的な言葉で。この人の性格に合った口調で。
- **avoidWords**: 明確で簡潔。「これだけは言わないで」という警告トーン。

---

## 出力形式

Return ONLY valid JSON. No markdown code blocks. No text outside the JSON object.

{
  "beliefReason": "この人がこの言説を信じる理由（400〜600字、複数段落）",
  "resonantAngles": [
    "この人に響く切り口1（理由込み）",
    "この人に響く切り口2",
    "この人に響く切り口3"
  ],
  "scripts": [
    {
      "situation": "場面の説明",
      "script": "「実際の台詞」",
      "note": "補足・注意点"
    }
  ],
  "avoidWords": [
    "避けるべき言葉・態度1",
    "避けるべき言葉・態度2"
  ],
  "sources": [
    {
      "label": "内容の一言説明",
      "institution": "機関名",
      "sourceType": "統計 | 学術研究 | 政府文書 | 報告書",
      "year": "発表年（確信がある場合のみ）"
    }
  ],
  "portraitUpdate": "ポートレート更新（新たな発見がなければ空文字列）"
}

IMPORTANT: sourcesにURLを含めないでください。存在すると確信できるソースのみ含める。`;
}

export async function analyzePersonCentric(
  claim: string,
  target: TargetData,
  portrait: TargetInsightData | null,
  recentHistory: DialogueHistoryEntry[]
): Promise<PersonCentricInsight> {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      temperature: 0.35,
      topP: 0.9,
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tools: [{ googleSearch: {} } as any],
  });

  const prompt = buildPersonCentricPrompt(claim, target, portrait, recentHistory);
  const result = await model.generateContent(prompt);
  const text = result.response.text();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let parsed: any;
  try {
    parsed = parseJsonResponse(text);
  } catch {
    throw new Error("Failed to parse Gemini response as JSON");
  }

  return {
    beliefReason: parsed.beliefReason || "",
    resonantAngles: Array.isArray(parsed.resonantAngles) ? parsed.resonantAngles : [],
    scripts: Array.isArray(parsed.scripts)
      ? parsed.scripts.map((s: { situation?: string; script?: string; note?: string }) => ({
          situation: s.situation || "",
          script: s.script || "",
          note: s.note || "",
        }))
      : [],
    avoidWords: Array.isArray(parsed.avoidWords) ? parsed.avoidWords : [],
    sources: (parsed.sources || []).filter(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (s: any) => s?.label && s?.institution
    ),
    portraitUpdate: parsed.portraitUpdate || "",
  };
}
