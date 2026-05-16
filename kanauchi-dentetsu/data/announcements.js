/* アナウンス文管理ファイル。script.js には文章を直接書かない。 */
const ANNOUNCEMENTS = {
  start: {
    default: "かなうち電鉄をご利用いただきありがとうございます。まもなく発車します。",
    kanauchi: "まもなく、かなうち本線が発車します。",
    kotobahira: "まもなく、ことばひら線が発車します。",
    mojikoRetro: "まもなく、文字港レトロ線が発車します。ゆっくり正確に運転しましょう。",
    ichibunsen: "まもなく、一文線が発車します。文章を最後まで落ち着いて入力しましょう。",
    announcement: "まもなく、車内アナウンス線が発車します。音声をよく聞いて入力してください。",
    shinkansen: "まもなく、うちかいどう新幹線が発車します。高速運転にご注意ください。",
    review: "まもなく、やりなおし回送線が発車します。苦手駅を克服しましょう。",
    legend: "まもなく、レジェンド線が発車します。でんせつの運転士を目指しましょう。"
  },
  nextStation: {
    default: "次は、{station}駅。{station}駅です。"
  },
  correct: {
    default: "定刻到着です。",
    combo3: "3駅連続定刻です。いい運転です。",
    combo5: "5駅連続定刻です。この調子で運転しましょう。",
    combo10: "10駅連続定刻です。すばらしい運転です。",
    combo20: "20駅連続定刻です。まさに名人運転です。"
  },
  miss: {
    default: "遅延が発生しています。もう一度入力してください。"
  },
  timeout: {
    default: "通過してしまいました。次の駅で取り戻しましょう。"
  },
  clear: {
    default: "終点に到着しました。本日のご乗車、ありがとうございました。",
    s: "完全定刻運行です。すばらしい運転でした。"
  },
  fail: {
    default: "遅延が大きくなったため、運転を見合わせます。もう一度挑戦しましょう。"
  },
  levelUp: {
    default: "運転士レベルが上がりました。おめでとうございます。現在の称号は、{title}です。"
  },
  badge: {
    default: "新しいバッジ、{badge}を獲得しました。"
  },
  listening: {
    replay: "もう一度、車内アナウンスを再生します。",
    hint: "ヒントを表示しました。",
    reveal: "答えを表示しました。次は定刻到着を目指しましょう。"
  }
};

const ANNOUNCEMENT_AUDIO = {
  "start.default": "sounds/announcement-start.mp3",
  "start.kanauchi": "sounds/announcement-start.mp3",
  "start.kotobahira": "sounds/announcement-start.mp3",
  "start.mojikoRetro": "sounds/announcement-start.mp3",
  "start.ichibunsen": "sounds/announcement-start.mp3",
  "start.announcement": "sounds/announcement-start.mp3",
  "start.shinkansen": "sounds/announcement-start.mp3",
  "start.review": "sounds/announcement-start.mp3",
  "start.legend": "sounds/announcement-start.mp3",
  "nextStation.default": "sounds/announcement-next-station.mp3",
  "correct.default": "sounds/announcement-correct.mp3",
  "correct.combo3": "sounds/announcement-correct.mp3",
  "correct.combo5": "sounds/announcement-correct.mp3",
  "correct.combo10": "sounds/announcement-correct.mp3",
  "correct.combo20": "sounds/announcement-correct.mp3",
  "miss.default": "sounds/announcement-delay.mp3",
  "timeout.default": "sounds/announcement-delay.mp3",
  "clear.default": "sounds/announcement-clear.mp3",
  "clear.s": "sounds/announcement-clear.mp3",
  "fail.default": "sounds/announcement-delay.mp3",
  "levelUp.default": "sounds/level-up.mp3",
  "badge.default": "sounds/badge-get.mp3"
};

const SOUND_FILES = {
  trainLoop: "sounds/train-loop.mp3",
  departureBell: "sounds/departure-bell.mp3",
  correct: "sounds/correct.mp3",
  miss: "sounds/miss.mp3",
  levelUp: "sounds/level-up.mp3",
  badgeGet: "sounds/badge-get.mp3"
};
