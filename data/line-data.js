/* 路線・称号・バッジ定義。 */
const TITLE_TABLE = [
  { min: 1, max: 10, title: "みならい運転士" },
  { min: 11, max: 20, title: "かけだし運転士" },
  { min: 21, max: 30, title: "ローマ字運転士" },
  { min: 31, max: 40, title: "快速タイパー" },
  { min: 41, max: 50, title: "急行タイパー" },
  { min: 51, max: 60, title: "特急タイパー" },
  { min: 61, max: 70, title: "定刻名人" },
  { min: 71, max: 80, title: "路線マスター" },
  { min: 81, max: 90, title: "ローマ字車掌" },
  { min: 91, max: 99, title: "銀河鉄道タイパー" },
  { min: 100, max: 100, title: "でんせつの運転士" }
];

const LINE_DATA = [
  {
    id: "kanauchi", name: "かなうち本線", unlockLevel: 1, source: "kana", stationCount: 12, timeLimit: 8,
    difficulty: "★☆☆☆☆", role: "かな1文字の基本練習", description: "かな1文字をローマ字で入力する基本路線。shi / si などの別表記も学べます。",
    startAnnouncement: "kanauchi", clearBadge: "かなうち本線制覇", icon: "🚃"
  },
  {
    id: "kotobahira", name: "ことばひら線", unlockLevel: 5, source: "short", stationCount: 12, timeLimit: 10,
    difficulty: "★★☆☆☆", role: "短い単語", description: "短い単語を入力し、かなの連続入力に慣れる路線。",
    startAnnouncement: "kotobahira", clearBadge: "ことばひら線制覇", icon: "🚋"
  },
  {
    id: "mojikoRetro", name: "文字港レトロ線", unlockLevel: 15, source: "long", stationCount: 12, timeLimit: 14,
    difficulty: "★★★☆☆", role: "長い単語・正確さ重視", description: "長い単語に慣れる中級路線。制限時間は長めで、正確さを重視します。",
    startAnnouncement: "mojikoRetro", clearBadge: "文字港到着", icon: "🚞"
  },
  {
    id: "ichibunsen", name: "一文線", unlockLevel: 30, source: "sentence", stationCount: 10, timeLimit: 18,
    difficulty: "★★★☆☆", role: "短い文章", description: "短い文章をスペースなしで入力する路線。文章入力の第一歩です。",
    startAnnouncement: "ichibunsen", clearBadge: "一文線到着", icon: "🚈"
  },
  {
    id: "announcement", name: "車内アナウンス線", unlockLevel: 45, source: "listening", stationCount: 8, timeLimit: 20,
    difficulty: "★★★★☆", role: "聞き取り", description: "画面には最初から答えを出さず、保存済み音声ファイルを聞いて入力する路線。",
    startAnnouncement: "announcement", clearBadge: "聞き取り運転士", icon: "📢"
  },
  {
    id: "shinkansen", name: "うちかいどう新幹線", unlockLevel: 60, source: "shinkansen", stationCount: 12, timeLimit: 7,
    difficulty: "★★★★★", role: "高速・長文", description: "制限時間が短く、運行ポイント倍率が高い上級者向け路線。",
    startAnnouncement: "shinkansen", clearBadge: "うちかいどう到着", icon: "🚄", scoreBonus: 1.5
  },
  {
    id: "review", name: "やりなおし回送線", unlockLevel: 1, source: "review", stationCount: 10, timeLimit: 12,
    difficulty: "復習", role: "苦手復習", description: "ミスが多い問題を優先して出す復習路線。一定回数正解すると苦手駅から外れます。",
    startAnnouncement: "review", clearBadge: "苦手駅克服", icon: "🔁"
  },
  {
    id: "legend", name: "レジェンド線", unlockLevel: 100, source: "legend", stationCount: 30, timeLimit: 9,
    difficulty: "伝説", role: "最終総合", description: "かな、単語、文章、聞き取り、高速入力、表記違いを総合する最終路線。",
    startAnnouncement: "legend", clearBadge: "でんせつの運転士", icon: "🌌", scoreBonus: 2
  }
];

const BADGE_DEFINITIONS = [
  { name: "初乗車", description: "初めてプレイ" },
  { name: "定刻デビュー", description: "初めてノーミスクリア" },
  { name: "5駅連続定刻", description: "5コンボ達成" },
  { name: "10駅連続定刻", description: "10コンボ達成" },
  { name: "かなうち本線制覇", description: "かなうち本線クリア" },
  { name: "ことばひら線制覇", description: "ことばひら線クリア" },
  { name: "文字港到着", description: "文字港レトロ線クリア" },
  { name: "一文線到着", description: "一文線クリア" },
  { name: "聞き取り運転士", description: "車内アナウンス線クリア" },
  { name: "うちかいどう到着", description: "うちかいどう新幹線クリア" },
  { name: "遅延ゼロ運転士", description: "遅延0分でクリア" },
  { name: "表記ちがい案内人", description: "shi / si 系を20問正解" },
  { name: "苦手駅克服", description: "苦手問題を一定数克服" },
  { name: "レジェンド到着", description: "Lv.100到達" },
  { name: "でんせつの運転士", description: "レジェンド線クリア" }
];
