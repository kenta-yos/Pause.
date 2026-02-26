import { GoogleGenerativeAI } from "@google/generative-ai";
import { PersonCentricInsight, RecommendedBook, TargetData, TargetInsightData, DialogueHistoryEntry } from "@/types/insight";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

async function verifyBooksWithOpenBD(
  books: { title: string; type: string; reason: string; isbn: string }[]
): Promise<RecommendedBook[]> {
  const booksWithIsbn = books.filter((b) => b.isbn && /^\d{13}$/.test(b.isbn));
  if (booksWithIsbn.length === 0) return [];

  const isbns = booksWithIsbn.map((b) => b.isbn).join(",");
  try {
    const res = await fetch(`https://api.openbd.jp/v1/get?isbn=${isbns}`);
    const data = await res.json();

    const verified: RecommendedBook[] = [];
    for (let i = 0; i < data.length; i++) {
      const entry = data[i];
      if (!entry) continue; // book not found in OpenBD

      const book = booksWithIsbn[i];
      const onix = entry.onix || {};
      const summary = entry.summary || {};
      const hanmoto = entry.hanmoto || {};

      // Extract metadata from OpenBD
      const title = summary.title || book.title;
      const publisher = summary.publisher || "";
      const pubDate = hanmoto.dateshuppan || "";
      const year = pubDate ? pubDate.slice(0, 4) : "";

      // Price from ONIX
      const prices = onix.ProductSupply?.SupplyDetail?.Price;
      const priceAmount = Array.isArray(prices) && prices.length > 0
        ? prices[0].PriceAmount
        : "";
      const price = priceAmount ? `${Number(priceAmount).toLocaleString()}円` : "";

      verified.push({
        title,
        type: book.type,
        reason: book.reason,
        isbn: book.isbn,
        publisher,
        year,
        price,
      });
    }
    return verified;
  } catch {
    return [];
  }
}

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

「Pause.」は、事実やエビデンスと異なる可能性のある言説を信じている「大切な人」（家族・友人・パートナー）と、どのように向き合い、対話すべきかを考えるためのアプリです。

このアプリは「人中心」のアプローチを取ります。汎用的な分析ではなく、ユーザーが登録した**特定の人物**に合わせて、その人に響く具体的な対話アドバイスを生成します。

---

## ★最初にやること：言説のスクリーニング

以下の入力された言説を評価し、**科学的コンセンサス、国際的な人権基準、または圧倒的な学術的エビデンスによって支持されている立場かどうか**を判断してください。

例えば以下のような言説は「支持されている立場」に該当します：
- 同性婚や婚姻の平等を支持する主張
- 気候変動への対策を求める主張
- 人種・性別・性的指向による差別に反対する主張
- 移民や難民の人権を守るべきという主張
- ジェンダー平等を推進する主張

**該当する場合**：以下のJSONのみを返し、それ以降の分析は一切行わないでください。

{ "supported": true }

**該当しない場合**：supported フィールドは含めず、以下の通常の分析を行ってください。

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

この**特定の人物**がなぜこの言説を信じているかを、プロフィール情報から具体的に推測する。

必ず含めること：
- この人の**仕事・生活・人間関係・過去の経験**から、この言説とどう接点があるか
- この人が日常で感じているであろう**不安・不満・誇り・願望**と言説のつながり
- この人の**情報環境**（テレビ、YouTube、LINEなど）がどう影響しているか

禁止：
- 心理学の理論名・研究者名・専門用語を出力に含めない（「認知的不協和」「道徳基盤理論」「バックファイア効果」等は使わない）
- 汎用的な解説ではなく、この人の具体的な生活から書くこと

良い例：「定年後に社会との接点が減り、テレビのニュースが主な情報源になっている中で、繰り返し目にする報道が不安を強めているのかもしれません」
悪い例：「確証バイアスという心理的傾向により、自分の信念に合う情報ばかり集めてしまう傾向があります」

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

### 6. recommendedBooks（もっと知りたいときに）

この言説のテーマについて理解を深めるための本・記事・論文を**3〜5つ**推薦する。
ユーザーが大切な人と話す前に読んでおくと、より深い対話ができるようになるもの。

必ず含めること：
- **title**: 書名・記事名（実在するものに限る。Google検索で確認すること）
- **type**: 「本」「新書」「記事」「論文」「レポート」など
- **reason**: なぜこの本を読むと対話に役立つか（1〜2文。この人との対話に結びつけて書く）
- **isbn**: ISBN-13（ハイフンなし13桁。Google検索で正確なISBNを確認すること。確信がない場合は空文字列）
- **publisher**: 出版社名
- **year**: 出版年（西暦）
- **price**: 税込価格（例：「1,870円」。不明な場合は空文字列）

推薦の方針：
- 専門書より**入門書・新書・読みやすいもの**を優先
- 日本語の本があれば日本語を優先（翻訳書でも可）
- 対話の技術に関する本も1冊は含めると良い
- 架空の書名・架空のISBNは絶対に含めないこと
- ISBNは必ずGoogle検索で実在を確認してから含めること

---

### 7. portraitUpdate（ポートレート更新）

今回の分析で新たにわかった、この人についての理解を1〜3文でまとめる。
前回のポートレートに追加する形で書く。
新たな発見がなければ空文字列にする。

---

## テーマ別の参考視点（出力には理論名を出さず、この人の生活に即した言葉で書くこと）

### 移民・外国人
- 「自分の街が変わってほしくない」「安全に暮らしたい」は誰でも持つ感覚
- 知らない人が増えると不安になるのは自然なこと。ニュースで外国人の事件ばかり目に入ると、実態以上に危険に感じる
- 経済的に苦しいとき、目に見える「よそ者」に原因を求めやすい
- **事実参照**：法務省犯罪白書、在留外国人統計、OECD移民研究

### ジェンダー・LGBTQ+
- 「伝統的な家族を守りたい」「急な変化についていけない」は文化的な不安
- 子どもへの影響を心配するのは、本人なりの真剣な愛情の表れでもある
- 自分が育った世界の「当たり前」が揺らぐことへの戸惑い
- **事実参照**：WHO・米国精神医学会の公式見解、同性婚導入国の家族統計

### 歴史認識
- 「自分の国を誇りたい」気持ちと、過去の批判が矛盾するように感じる苦しさ
- 歴史の暗部を認めることが自分自身への攻撃に感じられる
- **事実参照**：河野談話・村山談話、ドイツの戦後処理との比較

### 経済格差・自己責任論
- 「自分は努力してきた」という誇りがあるから、努力で解決できないという話を受け入れにくい
- 自己責任論を信じている人自身が苦しんでいる場合もある
- **事実参照**：OECD社会的流動性データ、所得格差の推移

### メディア不信・陰謀論
- 政治やメディアへの不信感自体は健全な面もある
- 複雑な世界に簡単な答えがほしいのは人間として自然
- 「自分だけが真実を知っている」という感覚が自信や居場所になっている
- **事実参照**：フィンランドのメディアリテラシー教育、SNSアルゴリズムの影響

### 環境・気候変動
- 電気代や仕事への影響など、生活に直結する不安がある
- 遠い未来や遠い国の話に現実感が湧かない
- **事実参照**：IPCCの科学的合意、再生可能エネルギー産業の雇用データ

### 安全保障・軍拡
- 「家族を守りたい」「弱い国は舐められる」は素朴で強い感覚
- 軍事力を強めることが安全につながるという直感は自然
- **事実参照**：歴史上の軍拡競争の帰結、地域安全保障協力の事例

### 差別・ヘイトスピーチ
- 「表現の自由は大事」という価値観は尊重に値する
- 自分の生活が苦しいとき、目に見えるマイノリティに不満が向かいやすい
- **事実参照**：弁護士会・研究者による「在日特権」検証、国際人権法

### 民主主義への懐疑
- 今の政治に怒っているのは正当な感覚
- 複雑な問題を一人の強いリーダーに解決してほしいと思うのは、疲れの表れでもある
- **事実参照**：権威主義体制の長期的帰結、民主主義指標の推移

---

## トーンの原則

- **beliefReason**: この人の生活が見えるように書く。「〜かもしれません」「〜のではないでしょうか」の柔らかい推測トーン。理論名・専門用語は一切使わない。
- **resonantAngles/scripts**: 温かく実践的。この人との実際の会話が想像できる具体性で。
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
  "recommendedBooks": [
    {
      "title": "実在する書名",
      "type": "本 | 新書 | 記事 | 論文 | レポート",
      "reason": "この本を読むとこの人との対話にどう役立つか（1〜2文）",
      "isbn": "9784XXXXXXXXX（13桁、ハイフンなし。確信がなければ空文字列）",
      "publisher": "出版社名",
      "year": "出版年",
      "price": "税込価格（例：1,870円。不明なら空文字列）"
    }
  ],
  "portraitUpdate": "ポートレート更新（新たな発見がなければ空文字列）"
}

IMPORTANT: sourcesにURLを含めないでください。存在すると確信できるソースのみ含める。recommendedBooksも実在する書名のみ（Google検索で確認）。`;
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

  // Screening: claim is supported by evidence
  if (parsed.supported === true) {
    return {
      supported: true,
      beliefReason: "",
      resonantAngles: [],
      scripts: [],
      avoidWords: [],
      sources: [],
      recommendedBooks: [],
      portraitUpdate: "",
    };
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
    recommendedBooks: await verifyBooksWithOpenBD(
      Array.isArray(parsed.recommendedBooks)
        ? parsed.recommendedBooks
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .filter((b: any) => b?.title && b?.isbn)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .map((b: any) => ({
              title: b.title || "",
              type: b.type || "本",
              reason: b.reason || "",
              isbn: b.isbn || "",
            }))
        : []
    ),
    portraitUpdate: parsed.portraitUpdate || "",
  };
}
