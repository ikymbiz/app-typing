/* かな・ローマ字データ。script.js へ直接埋め込まない。 */
const ROMAJI_TABLE = {
  "あ": ["a"], "い": ["i"], "う": ["u"], "え": ["e"], "お": ["o"],
  "か": ["ka"], "き": ["ki"], "く": ["ku"], "け": ["ke"], "こ": ["ko"],
  "さ": ["sa"], "し": ["shi", "si"], "す": ["su"], "せ": ["se"], "そ": ["so"],
  "た": ["ta"], "ち": ["chi", "ti"], "つ": ["tsu", "tu"], "て": ["te"], "と": ["to"],
  "な": ["na"], "に": ["ni"], "ぬ": ["nu"], "ね": ["ne"], "の": ["no"],
  "は": ["ha"], "ひ": ["hi"], "ふ": ["fu", "hu"], "へ": ["he"], "ほ": ["ho"],
  "ま": ["ma"], "み": ["mi"], "む": ["mu"], "め": ["me"], "も": ["mo"],
  "や": ["ya"], "ゆ": ["yu"], "よ": ["yo"],
  "ら": ["ra"], "り": ["ri"], "る": ["ru"], "れ": ["re"], "ろ": ["ro"],
  "わ": ["wa"], "を": ["wo", "o"], "ん": ["n", "nn"],
  "が": ["ga"], "ぎ": ["gi"], "ぐ": ["gu"], "げ": ["ge"], "ご": ["go"],
  "ざ": ["za"], "じ": ["ji", "zi"], "ず": ["zu"], "ぜ": ["ze"], "ぞ": ["zo"],
  "だ": ["da"], "ぢ": ["di", "ji"], "づ": ["du", "zu"], "で": ["de"], "ど": ["do"],
  "ば": ["ba"], "び": ["bi"], "ぶ": ["bu"], "べ": ["be"], "ぼ": ["bo"],
  "ぱ": ["pa"], "ぴ": ["pi"], "ぷ": ["pu"], "ぺ": ["pe"], "ぽ": ["po"],
  "ぁ": ["xa", "la"], "ぃ": ["xi", "li"], "ぅ": ["xu", "lu"], "ぇ": ["xe", "le"], "ぉ": ["xo", "lo"],
  "ゃ": ["xya", "lya"], "ゅ": ["xyu", "lyu"], "ょ": ["xyo", "lyo"], "っ": ["xtu", "ltu"],
  "ー": ["-"],

  "きゃ": ["kya"], "きゅ": ["kyu"], "きょ": ["kyo"],
  "しゃ": ["sha", "sya"], "しゅ": ["shu", "syu"], "しょ": ["sho", "syo"],
  "ちゃ": ["cha", "tya", "cya"], "ちゅ": ["chu", "tyu", "cyu"], "ちょ": ["cho", "tyo", "cyo"],
  "にゃ": ["nya"], "にゅ": ["nyu"], "にょ": ["nyo"],
  "ひゃ": ["hya"], "ひゅ": ["hyu"], "ひょ": ["hyo"],
  "みゃ": ["mya"], "みゅ": ["myu"], "みょ": ["myo"],
  "りゃ": ["rya"], "りゅ": ["ryu"], "りょ": ["ryo"],
  "ぎゃ": ["gya"], "ぎゅ": ["gyu"], "ぎょ": ["gyo"],
  "じゃ": ["ja", "zya", "jya"], "じゅ": ["ju", "zyu", "jyu"], "じょ": ["jo", "zyo", "jyo"],
  "びゃ": ["bya"], "びゅ": ["byu"], "びょ": ["byo"],
  "ぴゃ": ["pya"], "ぴゅ": ["pyu"], "ぴょ": ["pyo"],
  "ふぁ": ["fa", "fwa", "huxa"], "ふぃ": ["fi", "fwi", "huxi"], "ふぇ": ["fe", "fwe", "huxe"], "ふぉ": ["fo", "fwo", "huxo"],
  "てぃ": ["thi", "texi", "teli"], "でぃ": ["dhi", "dexi", "deli"],
  "うぃ": ["wi", "uxi", "uli"], "うぇ": ["we", "uxe", "ule"]
};

const KANA_LESSONS = [
  { kana: "あ", note: "母音" }, { kana: "い", note: "母音" }, { kana: "う", note: "母音" }, { kana: "え", note: "母音" }, { kana: "お", note: "母音" },
  { kana: "か" }, { kana: "き" }, { kana: "く" }, { kana: "け" }, { kana: "こ" },
  { kana: "さ" }, { kana: "し", note: "shi / si どちらでもOK" }, { kana: "す" }, { kana: "せ" }, { kana: "そ" },
  { kana: "た" }, { kana: "ち", note: "chi / ti どちらでもOK" }, { kana: "つ", note: "tsu / tu どちらでもOK" }, { kana: "て" }, { kana: "と" },
  { kana: "な" }, { kana: "に" }, { kana: "ぬ" }, { kana: "ね" }, { kana: "の" },
  { kana: "は" }, { kana: "ひ" }, { kana: "ふ", note: "fu / hu どちらでもOK" }, { kana: "へ" }, { kana: "ほ" },
  { kana: "ま" }, { kana: "み" }, { kana: "む" }, { kana: "め" }, { kana: "も" },
  { kana: "や" }, { kana: "ゆ" }, { kana: "よ" },
  { kana: "ら" }, { kana: "り" }, { kana: "る" }, { kana: "れ" }, { kana: "ろ" },
  { kana: "わ" }, { kana: "を" }, { kana: "ん" },
  { kana: "が" }, { kana: "ぎ" }, { kana: "ぐ" }, { kana: "げ" }, { kana: "ご" },
  { kana: "ざ" }, { kana: "じ", note: "ji / zi どちらでもOK" }, { kana: "ず" }, { kana: "ぜ" }, { kana: "ぞ" },
  { kana: "だ" }, { kana: "で" }, { kana: "ど" },
  { kana: "ば" }, { kana: "び" }, { kana: "ぶ" }, { kana: "べ" }, { kana: "ぼ" },
  { kana: "ぱ" }, { kana: "ぴ" }, { kana: "ぷ" }, { kana: "ぺ" }, { kana: "ぽ" },
  { kana: "しゃ", note: "sha / sya どちらでもOK" }, { kana: "しゅ" }, { kana: "しょ" },
  { kana: "ちゃ", note: "cha / tya どちらでもOK" }, { kana: "ちゅ" }, { kana: "ちょ" },
  { kana: "じゃ", note: "ja / zya / jya どれもOK" }, { kana: "じゅ" }, { kana: "じょ" }
];

const ROMAJI_GUIDE_EXTRA = [
  { kana: "し", primary: "shi", alternatives: ["si"], description: "「し」は shi と書くことが多いよ。パソコン入力では si でも入力できるよ。", examples: ["すし", "でんしゃ"] },
  { kana: "ち", primary: "chi", alternatives: ["ti"], description: "「ち」は chi と書くことが多いよ。ti でも入力できるよ。", examples: ["ちず", "とっきゅう"] },
  { kana: "つ", primary: "tsu", alternatives: ["tu"], description: "「つ」は tsu がよく使われるよ。tu でも入力できるよ。", examples: ["つき", "つくえ"] },
  { kana: "ふ", primary: "fu", alternatives: ["hu"], description: "「ふ」は fu がよく使われるよ。hu でも入力できるよ。", examples: ["ふね", "ふじさん"] },
  { kana: "じ", primary: "ji", alternatives: ["zi"], description: "「じ」は ji がよく使われるよ。zi でも入力できるよ。", examples: ["じどうしゃ"] },
  { kana: "しゃ", primary: "sha", alternatives: ["sya"], description: "「しゃ」は sha がよく使われるよ。sya でも入力できるよ。", examples: ["でんしゃ"] },
  { kana: "ちゃ", primary: "cha", alternatives: ["tya", "cya"], description: "「ちゃ」は cha がよく使われるよ。tya でも入力できるよ。", examples: ["ちゃいろ"] },
  { kana: "じゃ", primary: "ja", alternatives: ["zya", "jya"], description: "「じゃ」は ja がよく使われるよ。zya / jya でも入力できるよ。", examples: ["じゃんけん"] }
];
