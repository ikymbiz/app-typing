(() => {
  "use strict";

  const STORAGE_KEY = "kanauchi-dentetsu-save-v1";
  const MAX_LEVEL = 100;
  const app = document.getElementById("app");
  const topStatus = document.getElementById("topStatus");
  const homeButton = document.getElementById("homeButton");

  const defaultSaveData = {
    level: 1,
    exp: 0,
    maxLevel: MAX_LEVEL,
    title: "みならい運転士",
    totalScore: 0,
    bestScore: 0,
    playCount: 0,
    totalCorrect: 0,
    totalMiss: 0,
    notationCorrectCount: 0,
    maxComboEver: 0,
    unlockedLines: ["かなうち本線", "やりなおし回送線"],
    clearedLines: [],
    lineStars: {},
    lineBest: {},
    badges: [],
    weakItems: {},
    correctCount: {},
    soundSettings: {
      soundEnabled: true,
      announcementEnabled: true,
      effectEnabled: true,
      trainSoundEnabled: true,
      masterVolume: 0.8,
      announcementVolume: 0.9,
      effectVolume: 0.7,
      trainVolume: 0.25
    },
    lastPlayDate: "",
    streakDays: 0
  };

  let saveData = loadSaveData();
  let currentSession = null;
  let timerId = null;
  let trainLoopAudio = null;

  homeButton.addEventListener("click", () => {
    stopTimer();
    stopTrainLoop();
    renderHome();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && currentSession) {
      stopTimer();
      stopTrainLoop();
      renderLineDetail(currentSession.line.id);
    }
  });

  function loadSaveData() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return structuredClone(defaultSaveData);
      const parsed = JSON.parse(raw);
      return mergeDeep(structuredClone(defaultSaveData), parsed);
    } catch (error) {
      console.warn("save load failed", error);
      return structuredClone(defaultSaveData);
    }
  }

  function save() {
    saveData.title = getTitle(saveData.level);
    saveData.unlockedLines = LINE_DATA.filter(line => saveData.level >= line.unlockLevel).map(line => line.name);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saveData));
    updateTopStatus();
  }

  function mergeDeep(base, override) {
    for (const [key, value] of Object.entries(override || {})) {
      if (value && typeof value === "object" && !Array.isArray(value) && base[key] && typeof base[key] === "object") {
        base[key] = mergeDeep(base[key], value);
      } else {
        base[key] = value;
      }
    }
    return base;
  }

  function getTitle(level) {
    const row = TITLE_TABLE.find(item => level >= item.min && level <= item.max);
    return row ? row.title : TITLE_TABLE[0].title;
  }

  function nextExp(level = saveData.level) {
    return 100 + level * 35;
  }

  function updateTopStatus() {
    const percent = Math.min(100, Math.round((saveData.exp / nextExp()) * 100));
    topStatus.textContent = `Lv.${saveData.level} ${getTitle(saveData.level)} / EXP ${saveData.exp} / ${nextExp()} (${percent}%)`;
  }

  function renderHome() {
    currentSession = null;
    save();
    const expPercent = Math.min(100, (saveData.exp / nextExp()) * 100);
    const unlocked = LINE_DATA.filter(line => saveData.level >= line.unlockLevel).length;
    app.innerHTML = `
      <section class="hero">
        <div class="hero-grid">
          <div>
            <h1>かなうち電鉄</h1>
            <p>ひらがな・単語・文章をローマ字で入力して、電車を定刻運行させよう。Lv.100の「でんせつの運転士」を目指すタイピング学習ゲームです。</p>
            <div class="btn-row">
              <button class="btn" data-action="lines">路線をえらぶ</button>
              <button class="btn secondary" data-action="guide">ローマ字案内</button>
              <button class="btn secondary" data-action="settings">音設定</button>
            </div>
          </div>
          <div class="train-card" aria-hidden="true">
            <div class="train-front">
              <div class="train-window-row"><span class="train-window"></span><span class="train-window"></span><span class="train-window"></span></div>
              <div class="train-display">定刻運行</div>
            </div>
          </div>
        </div>
      </section>

      <section class="grid two" style="margin-top:16px">
        <article class="card">
          <div class="section-title" style="margin-top:0"><h2>運転士ステータス</h2><span class="pill gold">${saveData.title}</span></div>
          <table class="stat-table">
            <tr><th>運転士レベル</th><td>Lv.${saveData.level}</td></tr>
            <tr><th>EXP</th><td>${saveData.exp} / ${nextExp()}</td></tr>
            <tr><th>総運行ポイント</th><td>${saveData.totalScore.toLocaleString()}</td></tr>
            <tr><th>最高運行ポイント</th><td>${saveData.bestScore.toLocaleString()}</td></tr>
            <tr><th>開放路線</th><td>${unlocked} / ${LINE_DATA.length}</td></tr>
            <tr><th>最大連続定刻</th><td>${saveData.maxComboEver}駅</td></tr>
          </table>
          <div class="progress" aria-label="EXP"><span style="--value:${expPercent}%"></span></div>
        </article>
        <article class="card">
          <div class="section-title" style="margin-top:0"><h2>バッジ</h2><span class="pill">${saveData.badges.length} / ${BADGE_DEFINITIONS.length}</span></div>
          <div class="badge-grid">
            ${BADGE_DEFINITIONS.map(badge => `<span class="badge ${saveData.badges.includes(badge.name) ? "" : "locked-badge"}" title="${escapeHtml(badge.description)}">${escapeHtml(badge.name)}</span>`).join("")}
          </div>
        </article>
      </section>

      <div class="section-title"><h2>路線をえらぶ</h2><span class="small">発車すると運行が始まります</span></div>
      <section class="grid three">${LINE_DATA.map(renderLineCard).join("")}</section>
    `;

    app.querySelector('[data-action="lines"]').addEventListener("click", () => {
      app.querySelector(".section-title")?.scrollIntoView({ behavior: "smooth" });
    });
    app.querySelector('[data-action="guide"]').addEventListener("click", renderGuide);
    app.querySelector('[data-action="settings"]').addEventListener("click", renderSettings);
    app.querySelectorAll("[data-line-id]").forEach(button => {
      button.addEventListener("click", () => renderLineDetail(button.dataset.lineId));
    });
  }

  function renderLineCard(line) {
    const locked = saveData.level < line.unlockLevel;
    const best = saveData.lineBest[line.id];
    const stars = saveData.lineStars[line.id] || 0;
    return `
      <article class="card line-card ${locked ? "locked" : ""}">
        <div class="line-head">
          <div>
            <div class="line-icon">${line.icon}</div>
            <h3>${escapeHtml(line.name)}</h3>
          </div>
          <span class="pill ${locked ? "red" : "green"}">${locked ? `🔒 Lv.${line.unlockLevel}` : "開放中"}</span>
        </div>
        <div class="pill-row">
          <span class="pill">${escapeHtml(line.difficulty)}</span>
          <span class="pill">${escapeHtml(line.role)}</span>
          <span class="pill gold">★ ${stars}</span>
        </div>
        <p class="meta">${escapeHtml(line.description)}</p>
        <p class="small">最高評価：${best ? `${best.grade} / ${best.score.toLocaleString()}pt` : "未運行"}</p>
        <button class="btn ${locked ? "secondary" : ""}" data-line-id="${line.id}" ${locked ? "disabled" : ""}>${locked ? "まだ発車できません" : "路線を見る"}</button>
      </article>
    `;
  }

  function renderLineDetail(lineId) {
    stopTimer();
    stopTrainLoop();
    const line = getLine(lineId);
    if (!line) return renderHome();
    const locked = saveData.level < line.unlockLevel;
    const best = saveData.lineBest[line.id];
    const stars = saveData.lineStars[line.id] || 0;
    const sample = getSampleProblems(line).slice(0, 6);
    app.innerHTML = `
      <section class="card">
        <div class="section-title" style="margin-top:0">
          <div>
            <div class="line-icon">${line.icon}</div>
            <h1>${escapeHtml(line.name)}</h1>
            <p class="meta">${escapeHtml(line.description)}</p>
          </div>
          <span class="pill ${locked ? "red" : "green"}">${locked ? `🔒 Lv.${line.unlockLevel}` : "発車可能"}</span>
        </div>
        <div class="grid three">
          <div class="card flat"><strong>開放レベル</strong><p>Lv.${line.unlockLevel}</p></div>
          <div class="card flat"><strong>難易度</strong><p>${escapeHtml(line.difficulty)}</p></div>
          <div class="card flat"><strong>駅数 / 制限時間</strong><p>${line.stationCount}駅 / ${line.timeLimit}秒</p></div>
        </div>
        <div class="grid two" style="margin-top:16px">
          <div class="card flat">
            <h3>最高運行記録</h3>
            ${best ? `<table class="stat-table"><tr><th>評価</th><td>${best.grade}</td></tr><tr><th>ポイント</th><td>${best.score.toLocaleString()}</td></tr><tr><th>正答率</th><td>${best.accuracy}%</td></tr><tr><th>スター</th><td>${"★".repeat(stars)}${"☆".repeat(Math.max(0, 3 - stars))}</td></tr></table>` : `<p class="empty-state">まだ運行記録がありません。</p>`}
          </div>
          <div class="card flat">
            <h3>出題例</h3>
            <div class="badge-grid" style="margin-top:12px">
              ${sample.map(item => `<span class="badge">${escapeHtml(item.label || item.kana)}</span>`).join("")}
            </div>
          </div>
        </div>
        <div class="btn-row">
          <button class="btn" id="startLine" ${locked ? "disabled" : ""}>発車</button>
          <button class="btn secondary" id="backHome">ホームへ戻る</button>
        </div>
      </section>
    `;
    document.getElementById("backHome").addEventListener("click", renderHome);
    document.getElementById("startLine").addEventListener("click", () => startLine(line.id));
  }

  function startLine(lineId) {
    const line = getLine(lineId);
    if (!line || saveData.level < line.unlockLevel) return;

    const problems = getProblemsForLine(line).slice(0, line.stationCount);
    if (problems.length === 0) {
      showToast("出題できる駅がありません。先にほかの路線で運行してみましょう。");
      return;
    }

    currentSession = {
      line,
      problems,
      index: 0,
      score: 0,
      exp: 0,
      correct: 0,
      miss: 0,
      timeouts: 0,
      combo: 0,
      maxCombo: 0,
      delay: 0,
      startedAt: Date.now(),
      finished: false,
      currentInput: "",
      hintShown: false,
      answerShown: false,
      stationStartedAt: Date.now(),
      remaining: line.timeLimit
    };

    saveData.playCount += 1;
    saveData.lastPlayDate = getToday();
    unlockBadge("初乗車");
    save();
    playEffect("departureBell");
    startTrainLoop();
    speakAnnouncement("start", line.startAnnouncement || "default", { line: line.name });
    renderDriving();
    startStation();
  }

  function renderDriving() {
    if (!currentSession) return;
    const s = currentSession;
    const problem = s.problems[s.index];
    const hidden = s.line.source === "listening" || (s.line.id === "legend" && problem.type === "listening");
    const displayText = hidden && !s.answerShown ? "車内アナウンスを聞いて入力" : (problem.label || problem.kana);
    app.innerHTML = `
      <section class="play-layout">
        <div class="station-board">
          <div>
            <div class="board-top">
              <div>
                <div class="board-line">${escapeHtml(s.line.name)}</div>
                <div>${s.index + 1}駅目 / ${s.problems.length}駅</div>
              </div>
              <button class="btn secondary" id="abortRun">運行中止</button>
            </div>
            <div class="station-name ${hidden && !s.answerShown ? "hidden-answer" : ""}">${escapeHtml(displayText)}${hidden && !s.answerShown ? "" : "駅"}</div>
            <div class="answer-hint" id="answerHint">${buildHintText(problem, s)}</div>
            <input class="input-box" id="typingInput" autocomplete="off" autocapitalize="none" spellcheck="false" inputmode="latin" placeholder="ローマ字で入力" />
            <div class="feedback" id="feedback"></div>
          </div>
          <div>
            <div class="announcement-box" id="announcementBox">アナウンスを準備しています。</div>
            <div class="btn-row" id="listeningButtons" style="${hidden ? "" : "display:none"}">
              <button class="btn ghost" id="replayAudio">もう一度聞く</button>
              <button class="btn ghost" id="showHint">ヒント表示</button>
              <button class="btn ghost" id="showAnswer">答えを見る</button>
            </div>
          </div>
        </div>
        <aside class="card">
          <h2>運行状況</h2>
          <div class="gauge-grid" style="margin-top:16px">
            <div class="gauge"><small>連続定刻</small><strong id="comboValue">${s.combo}</strong></div>
            <div class="gauge"><small>遅延</small><strong id="delayValue">${s.delay}分</strong></div>
            <div class="gauge"><small>運行ポイント</small><strong id="scoreValue">${s.score}</strong></div>
            <div class="gauge"><small>残り時間</small><strong id="timeValue">${s.remaining}秒</strong></div>
          </div>
          <div style="margin-top:16px">
            <div class="small">正解候補</div>
            <div class="romaji-list">${hidden && !s.answerShown ? `<span class="pill">聞き取り中：正解候補は非表示</span>` : problem.answers.slice(0, 10).map(answer => `<span class="romaji-chip">${escapeHtml(answer)}</span>`).join("")}${(!hidden || s.answerShown) && problem.answers.length > 10 ? `<span class="pill">ほか ${problem.answers.length - 10}</span>` : ""}</div>
            <p class="small">入力中に間違った文字が入ると「遅延 +1分」です。<span class="kbd">Esc</span> で運行中止。</p>
          </div>
        </aside>
      </section>
    `;

    document.getElementById("abortRun").addEventListener("click", () => {
      stopTimer();
      stopTrainLoop();
      renderLineDetail(s.line.id);
    });
    const input = document.getElementById("typingInput");
    input.addEventListener("input", handleTyping);
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") handleEnterSubmit();
    });
    document.getElementById("replayAudio")?.addEventListener("click", () => replayListening(problem));
    document.getElementById("showHint")?.addEventListener("click", () => showListeningHint(problem));
    document.getElementById("showAnswer")?.addEventListener("click", () => revealListeningAnswer(problem));
    setTimeout(() => input.focus(), 0);
  }

  function startStation() {
    const s = currentSession;
    if (!s || s.finished) return;
    s.currentInput = "";
    s.hintShown = false;
    s.answerShown = false;
    s.remaining = s.line.timeLimit;
    s.stationStartedAt = Date.now();
    const problem = s.problems[s.index];
    const stationName = problem.label || problem.kana;
    speakAnnouncement("nextStation", "default", { station: stationName, line: s.line.name });
    if (problem.type === "listening") {
      setTimeout(() => replayListening(problem, true), 350);
    }
    stopTimer();
    timerId = setInterval(() => {
      s.remaining -= 1;
      const timeEl = document.getElementById("timeValue");
      if (timeEl) timeEl.textContent = `${s.remaining}秒`;
      if (s.remaining <= 0) handleTimeout();
    }, 1000);
  }

  function handleTyping(event) {
    const s = currentSession;
    if (!s || s.finished) return;
    const input = event.target;
    const problem = s.problems[s.index];
    const value = normalizeInput(input.value);
    s.currentInput = value;

    if (!value) {
      setFeedback("", "");
      return;
    }

    if (problem.answers.includes(value)) {
      handleCorrect(value);
      return;
    }

    const validPrefix = problem.answers.some(answer => answer.startsWith(value));
    if (!validPrefix) {
      handleMistype(input, problem);
    } else {
      setFeedback("そのまま入力しよう", "warn");
    }
  }

  function handleEnterSubmit() {
    const s = currentSession;
    if (!s || s.finished) return;
    const input = document.getElementById("typingInput");
    const problem = s.problems[s.index];
    const value = normalizeInput(input.value);
    if (problem.answers.includes(value)) handleCorrect(value);
    else handleMistype(input, problem);
  }

  function handleCorrect(typed) {
    const s = currentSession;
    if (!s || s.finished) return;
    const problem = s.problems[s.index];
    stopTimer();

    s.correct += 1;
    s.combo += 1;
    s.maxCombo = Math.max(s.maxCombo, s.combo);
    saveData.maxComboEver = Math.max(saveData.maxComboEver, s.combo);
    saveData.totalCorrect += 1;
    saveData.correctCount[problem.kana] = (saveData.correctCount[problem.kana] || 0) + 1;

    const multiplier = comboMultiplier(s.combo) * (s.line.scoreBonus || 1);
    const point = Math.round(120 * multiplier);
    const expGain = 10 + comboExpBonus(s.combo) + (s.line.id === "review" ? 5 : 0);
    s.score += point;
    s.exp += expGain;

    if (hasNotationVariation(problem.kana)) {
      saveData.notationCorrectCount += 1;
      if (saveData.notationCorrectCount >= 20) unlockBadge("表記ちがい案内人");
    }

    if (s.combo >= 5) unlockBadge("5駅連続定刻");
    if (s.combo >= 10) unlockBadge("10駅連続定刻");

    if (s.line.id === "review") markWeakCorrect(problem);
    else markKnownCorrect(problem);

    updateRunMeters();
    playEffect("correct");
    const comboKey = s.combo >= 20 ? "combo20" : s.combo >= 10 ? "combo10" : s.combo >= 5 ? "combo5" : s.combo >= 3 ? "combo3" : "default";
    speakAnnouncement("correct", comboKey, { combo: s.combo, score: s.score, delay: s.delay });
    setFeedback(`定刻到着！ +${point}ポイント / +${expGain}EXP`, "ok");

    setTimeout(nextStationOrFinish, 650);
  }

  function handleMistype(input, problem) {
    const s = currentSession;
    if (!s || s.finished) return;
    s.miss += 1;
    s.combo = 0;
    s.delay += 1;
    saveData.totalMiss += 1;
    addWeakItem(problem, s.line.id);
    input.value = "";
    s.currentInput = "";
    updateRunMeters();
    playEffect("miss");
    speakAnnouncement("miss", "default", { delay: s.delay });
    setFeedback("入力ミス！ 遅延 +1分。もう一度入力しよう", "bad");
    if (s.delay >= 10) {
      stopTimer();
      setTimeout(() => finishRun(false), 600);
    }
  }

  function handleTimeout() {
    const s = currentSession;
    if (!s || s.finished) return;
    const problem = s.problems[s.index];
    stopTimer();
    s.timeouts += 1;
    s.miss += 1;
    s.combo = 0;
    s.delay += 3;
    saveData.totalMiss += 1;
    addWeakItem(problem, s.line.id);
    updateRunMeters();
    playEffect("miss");
    speakAnnouncement("timeout", "default", { delay: s.delay });
    setFeedback("通過してしまった！ 遅延 +3分", "bad");
    if (s.delay >= 10) setTimeout(() => finishRun(false), 700);
    else setTimeout(nextStationOrFinish, 900);
  }

  function nextStationOrFinish() {
    const s = currentSession;
    if (!s || s.finished) return;
    s.index += 1;
    if (s.index >= s.problems.length) {
      finishRun(true);
    } else {
      renderDriving();
      startStation();
    }
  }

  function finishRun(reachedEnd) {
    const s = currentSession;
    if (!s || s.finished) return;
    s.finished = true;
    stopTimer();
    stopTrainLoop();

    const accuracy = s.problems.length ? Math.round((s.correct / s.problems.length) * 100) : 0;
    const gradeInfo = getGrade(accuracy, s.delay, reachedEnd);
    const routeClearExp = reachedEnd ? 50 : 0;
    const noMissExp = reachedEnd && s.miss === 0 && s.delay === 0 ? 100 : 0;
    const legendExp = reachedEnd && s.line.id === "legend" ? 500 : 0;
    s.exp += routeClearExp + noMissExp + legendExp;

    const oldLevel = saveData.level;
    saveData.exp += s.exp;
    saveData.totalScore += s.score;
    saveData.bestScore = Math.max(saveData.bestScore, s.score);
    processLevelUp();

    if (reachedEnd) {
      if (!saveData.clearedLines.includes(s.line.name)) saveData.clearedLines.push(s.line.name);
      if (s.line.clearBadge) unlockBadge(s.line.clearBadge);
      if (s.miss === 0 && s.delay === 0) {
        unlockBadge("定刻デビュー");
        unlockBadge("遅延ゼロ運転士");
      }
      if (s.line.id === "legend") unlockBadge("でんせつの運転士");
    }
    if (saveData.level >= 100) unlockBadge("レジェンド到着");

    const stars = gradeInfo.letter === "S" ? 3 : gradeInfo.letter === "A" ? 2 : gradeInfo.letter === "B" ? 1 : 0;
    saveData.lineStars[s.line.id] = Math.max(saveData.lineStars[s.line.id] || 0, stars);
    const best = saveData.lineBest[s.line.id];
    if (!best || s.score > best.score) {
      saveData.lineBest[s.line.id] = { grade: gradeInfo.full, letter: gradeInfo.letter, score: s.score, accuracy, delay: s.delay, date: getToday() };
    }
    save();

    const levelChange = oldLevel === saveData.level ? `Lv.${saveData.level}` : `Lv.${oldLevel} → Lv.${saveData.level}`;
    const announcementKey = reachedEnd && gradeInfo.letter === "S" ? "s" : "default";
    speakAnnouncement(reachedEnd ? "clear" : "fail", announcementKey, { level: saveData.level, title: saveData.title, score: s.score, delay: s.delay });

    app.innerHTML = `
      <section class="card">
        <div class="section-title" style="margin-top:0">
          <div>
            <h1>${reachedEnd ? "終点到着！" : "運転見合わせ"}</h1>
            <p class="meta">${escapeHtml(s.line.name)} の運行レポート</p>
          </div>
          <span class="pill gold">${escapeHtml(gradeInfo.full)}</span>
        </div>
        <div class="grid two">
          <div>
            <div class="result-grade">${gradeInfo.letter}</div>
            <div class="progress" aria-label="正答率"><span style="--value:${accuracy}%"></span></div>
            <p class="small" style="text-align:center">正答率 ${accuracy}%</p>
          </div>
          <div>
            <table class="stat-table">
              <tr><th>正解駅</th><td>${s.correct} / ${s.problems.length}</td></tr>
              <tr><th>ミス</th><td>${s.miss}</td></tr>
              <tr><th>時間切れ</th><td>${s.timeouts}</td></tr>
              <tr><th>遅延</th><td>${s.delay}分</td></tr>
              <tr><th>最大連続定刻</th><td>${s.maxCombo}駅</td></tr>
              <tr><th>運行ポイント</th><td>${s.score.toLocaleString()}</td></tr>
              <tr><th>EXP</th><td>+${s.exp}</td></tr>
              <tr><th>レベル</th><td>${levelChange}</td></tr>
            </table>
          </div>
        </div>
        <div class="btn-row">
          <button class="btn" id="retryLine">もう一度発車</button>
          <button class="btn secondary" id="lineDetail">路線詳細へ</button>
          <button class="btn secondary" id="homeAfterResult">ホームへ戻る</button>
          <button class="btn warning" id="reviewAfterResult">やりなおし回送線へ</button>
        </div>
      </section>
    `;
    document.getElementById("retryLine").addEventListener("click", () => startLine(s.line.id));
    document.getElementById("lineDetail").addEventListener("click", () => renderLineDetail(s.line.id));
    document.getElementById("homeAfterResult").addEventListener("click", renderHome);
    document.getElementById("reviewAfterResult").addEventListener("click", () => renderLineDetail("review"));
  }

  function processLevelUp() {
    while (saveData.level < MAX_LEVEL && saveData.exp >= nextExp(saveData.level)) {
      saveData.exp -= nextExp(saveData.level);
      saveData.level += 1;
      saveData.title = getTitle(saveData.level);
      playEffect("levelUp");
      speakAnnouncement("levelUp", "default", { level: saveData.level, title: saveData.title });
    }
    if (saveData.level >= MAX_LEVEL) {
      saveData.level = MAX_LEVEL;
      saveData.exp = Math.min(saveData.exp, nextExp(MAX_LEVEL) - 1);
    }
  }

  function comboMultiplier(combo) {
    if (combo >= 20) return 3;
    if (combo >= 10) return 2;
    if (combo >= 5) return 1.5;
    if (combo >= 3) return 1.2;
    return 1;
  }

  function comboExpBonus(combo) {
    if (combo > 0 && combo % 10 === 0) return 30;
    if (combo > 0 && combo % 5 === 0) return 10;
    if (combo > 0 && combo % 3 === 0) return 5;
    return 0;
  }

  function getGrade(accuracy, delay, reachedEnd) {
    if (!reachedEnd) return { letter: "D", full: "D 大幅遅延" };
    if (accuracy === 100 && delay === 0) return { letter: "S", full: "S 完全定刻運行" };
    if (accuracy >= 90) return { letter: "A", full: "A ほぼ定刻" };
    if (accuracy >= 70) return { letter: "B", full: "B 少し遅延" };
    if (accuracy >= 50) return { letter: "C", full: "C 遅延あり" };
    return { letter: "D", full: "D 大幅遅延" };
  }

  function updateRunMeters() {
    const s = currentSession;
    if (!s) return;
    setText("comboValue", s.combo);
    setText("delayValue", `${s.delay}分`);
    setText("scoreValue", s.score);
    setText("timeValue", `${s.remaining}秒`);
  }

  function setFeedback(text, type) {
    const el = document.getElementById("feedback");
    if (!el) return;
    el.className = `feedback ${type || ""}`;
    el.textContent = text;
  }

  function getLine(lineId) {
    return LINE_DATA.find(line => line.id === lineId);
  }

  function getProblemsForLine(line) {
    const builders = {
      kana: () => shuffle(KANA_LESSONS.map(item => buildProblem(item.kana, "kana", item.label, item.note))),
      short: () => shuffle(WORD_DATA.short.map(item => buildProblem(item.kana, "word", item.label))),
      long: () => shuffle(WORD_DATA.long.map(item => buildProblem(item.kana, "word", item.label))),
      sentence: () => shuffle(SENTENCE_DATA.map(item => buildProblem(item.kana, "sentence", item.label))),
      shinkansen: () => shuffle([...WORD_DATA.shinkansen, ...SENTENCE_DATA].map(item => buildProblem(item.kana, "speed", item.label))),
      listening: () => shuffle(LISTENING_DATA.map(item => buildProblem(item.kana, "listening", item.label, item.hint, item.audio))),
      review: () => buildReviewProblems(),
      legend: () => buildLegendProblems()
    };
    const list = builders[line.source]?.() || [];
    if (list.length >= line.stationCount) return list;
    return repeatToLength(list, line.stationCount);
  }

  function getSampleProblems(line) {
    if (line.source === "review") {
      const weak = Object.values(saveData.weakItems).sort((a, b) => b.miss - a.miss).map(w => ({ kana: w.kana, label: w.kana }));
      return weak.length ? weak : [{ kana: "し" }, { kana: "ち" }, { kana: "つ" }, { kana: "しゃ" }, { kana: "きっぷ" }, { kana: "でんしゃ" }];
    }
    return getProblemsForLine(line).slice(0, 8);
  }

  function buildReviewProblems() {
    const weak = Object.values(saveData.weakItems)
      .filter(item => item.miss > 0)
      .sort((a, b) => (b.miss - b.correctStreak) - (a.miss - a.correctStreak))
      .map(item => buildProblem(item.kana, item.type || "review", item.label || item.kana, item.note || "苦手駅"));
    if (weak.length) return repeatToLength(weak, getLine("review").stationCount);
    return shuffle([
      buildProblem("し", "review", "し", "苦手になりやすい表記"),
      buildProblem("ち", "review", "ち", "苦手になりやすい表記"),
      buildProblem("つ", "review", "つ", "苦手になりやすい表記"),
      buildProblem("ふ", "review", "ふ", "苦手になりやすい表記"),
      buildProblem("しゃ", "review", "しゃ", "苦手になりやすい表記"),
      buildProblem("でんしゃ", "review", "でんしゃ", "苦手になりやすい単語"),
      buildProblem("きっぷ", "review", "きっぷ", "小さい っ の練習")
    ]);
  }

  function buildLegendProblems() {
    const all = [
      ...KANA_LESSONS.map(item => buildProblem(item.kana, "kana", item.label, item.note)),
      ...WORD_DATA.short.map(item => buildProblem(item.kana, "word", item.label)),
      ...WORD_DATA.long.map(item => buildProblem(item.kana, "word", item.label)),
      ...SENTENCE_DATA.map(item => buildProblem(item.kana, "sentence", item.label)),
      ...WORD_DATA.shinkansen.map(item => buildProblem(item.kana, "speed", item.label)),
      ...LISTENING_DATA.map(item => buildProblem(item.kana, "listening", item.label, item.hint, item.audio))
    ];
    return shuffle(all);
  }

  function buildProblem(kana, type, label, note, audio) {
    return {
      id: `${type}:${kana}:${audio || ""}`,
      kana,
      label: label || kana,
      type,
      note,
      audio,
      answers: buildRomajiCandidates(kana)
    };
  }

  function buildRomajiCandidates(kanaText) {
    const normalized = String(kanaText).replace(/[\s　、。,.!?！？「」『』]/g, "");
    const tokens = [];
    for (let i = 0; i < normalized.length; i += 1) {
      const char = normalized[i];
      if (char === "っ") {
        tokens.push({ type: "sokuon", kana: "っ" });
        continue;
      }
      const pair = normalized.slice(i, i + 2);
      if (ROMAJI_TABLE[pair]) {
        tokens.push({ type: "romaji", kana: pair, variants: ROMAJI_TABLE[pair] });
        i += 1;
        continue;
      }
      if (ROMAJI_TABLE[char]) {
        tokens.push({ type: "romaji", kana: char, variants: ROMAJI_TABLE[char] });
      }
    }

    const results = combineTokens(tokens, 0);
    return [...new Set(results.map(normalizeInput))].filter(Boolean).slice(0, 5000);
  }

  function combineTokens(tokens, index) {
    if (index >= tokens.length) return [""];
    const token = tokens[index];
    const suffixes = combineTokens(tokens, index + 1);
    if (token.type === "sokuon") {
      const doubled = [];
      for (const suffix of suffixes) {
        if (!suffix) continue;
        const first = suffix[0];
        if (/[bcdfghjklmnpqrstvwxyz]/.test(first)) doubled.push(first + suffix);
        doubled.push("xtu" + suffix, "ltu" + suffix);
      }
      return doubled;
    }
    const out = [];
    for (const variant of token.variants) {
      for (const suffix of suffixes) out.push(variant + suffix);
    }
    return out.slice(0, 5000);
  }

  function normalizeInput(value) {
    return String(value).toLowerCase().trim().replace(/[\s　]/g, "").replace(/[Ａ-Ｚａ-ｚ０-９]/g, ch => String.fromCharCode(ch.charCodeAt(0) - 0xFEE0));
  }

  function hasNotationVariation(kana) {
    return ["し", "ち", "つ", "ふ", "じ", "しゃ", "しゅ", "しょ", "ちゃ", "ちゅ", "ちょ", "じゃ", "じゅ", "じょ"].some(key => kana.includes(key));
  }

  function addWeakItem(problem, lineId) {
    const key = problem.kana;
    const old = saveData.weakItems[key] || { kana: problem.kana, label: problem.label, type: problem.type, lineId, miss: 0, correctStreak: 0 };
    old.miss += 1;
    old.correctStreak = 0;
    old.type = problem.type;
    old.label = problem.label;
    saveData.weakItems[key] = old;
    save();
  }

  function markWeakCorrect(problem) {
    const key = problem.kana;
    if (!saveData.weakItems[key]) return;
    saveData.weakItems[key].correctStreak = (saveData.weakItems[key].correctStreak || 0) + 1;
    if (saveData.weakItems[key].correctStreak >= 3) {
      delete saveData.weakItems[key];
      unlockBadge("苦手駅克服");
      showToast(`「${problem.kana}駅」を克服！`);
    }
    save();
  }

  function markKnownCorrect(problem) {
    const key = problem.kana;
    if (!saveData.weakItems[key]) return;
    saveData.weakItems[key].correctStreak = (saveData.weakItems[key].correctStreak || 0) + 1;
    if (saveData.weakItems[key].correctStreak >= 4) delete saveData.weakItems[key];
    save();
  }

  function unlockBadge(name) {
    if (!name || saveData.badges.includes(name)) return false;
    saveData.badges.push(name);
    playEffect("badgeGet");
    speakAnnouncement("badge", "default", { badge: name });
    showToast(`バッジ獲得：${name}`);
    return true;
  }

  function renderGuide() {
    stopTimer();
    stopTrainLoop();
    app.innerHTML = `
      <section class="card">
        <div class="section-title" style="margin-top:0">
          <div>
            <h1>ローマ字案内</h1>
            <p class="meta">かな・ローマ字の逆引き検索。shi / si のような別表記も確認できます。</p>
          </div>
          <button class="btn secondary" id="guideHome">ホームへ戻る</button>
        </div>
        <div class="guide-search">
          <input class="text-input" id="guideInput" placeholder="例：し / shi / si / でんしゃ" />
          <button class="btn" id="guideSearch">案内</button>
        </div>
        <div id="guideResult" class="guide-result"></div>
      </section>
    `;
    document.getElementById("guideHome").addEventListener("click", renderHome);
    const input = document.getElementById("guideInput");
    const search = () => renderGuideResult(input.value);
    document.getElementById("guideSearch").addEventListener("click", search);
    input.addEventListener("input", search);
    input.addEventListener("keydown", event => { if (event.key === "Enter") search(); });
    input.focus();
    renderGuideResult("し");
  }

  function renderGuideResult(query) {
    const target = document.getElementById("guideResult");
    if (!target) return;
    const q = normalizeInput(query);
    const raw = String(query).trim();
    if (!raw) {
      target.innerHTML = `<p class="empty-state">調べたいかな、またはローマ字を入力してください。</p>`;
      return;
    }

    const candidates = [];
    const kanaSources = [
      ...KANA_LESSONS.map(item => item.kana),
      ...WORD_DATA.short.map(item => item.kana),
      ...WORD_DATA.long.map(item => item.kana),
      ...SENTENCE_DATA.map(item => item.kana),
      ...WORD_DATA.shinkansen.map(item => item.kana)
    ];
    for (const kana of [...new Set(kanaSources)]) {
      const answers = buildRomajiCandidates(kana);
      if (kana.includes(raw) || answers.some(answer => answer.includes(q))) {
        candidates.push({ kana, answers });
      }
    }

    const directExtra = ROMAJI_GUIDE_EXTRA.find(item => item.kana === raw || item.primary === q || item.alternatives.includes(q));
    const head = directExtra ? renderGuideExtra(directExtra) : "";
    const list = candidates.slice(0, 20).map(item => `
      <article class="card flat guide-item">
        <h3>${escapeHtml(item.kana)}</h3>
        <div class="romaji-list">${item.answers.slice(0, 12).map(answer => `<span class="romaji-chip">${escapeHtml(answer)}</span>`).join("")}</div>
        ${item.answers.length > 12 ? `<p class="small">ほか ${item.answers.length - 12} 件の入力候補があります。</p>` : ""}
      </article>
    `).join("");

    target.innerHTML = head + (list || `<p class="empty-state">該当する案内が見つかりませんでした。</p>`);
  }

  function renderGuideExtra(item) {
    return `
      <article class="card flat guide-item">
        <h3>${escapeHtml(item.kana)}</h3>
        <p><strong>よく使われる表記：</strong><span class="romaji-chip">${escapeHtml(item.primary)}</span></p>
        <p><strong>入力でも使える表記：</strong>${item.alternatives.map(alt => `<span class="romaji-chip">${escapeHtml(alt)}</span>`).join(" ")}</p>
        <p class="meta">${escapeHtml(item.description)}</p>
        <p class="small">関連する単語例：${item.examples.map(escapeHtml).join("、")}</p>
      </article>
    `;
  }

  function renderSettings() {
    stopTimer();
    stopTrainLoop();
    const s = saveData.soundSettings;
    app.innerHTML = `
      <section class="card">
        <div class="section-title" style="margin-top:0">
          <div>
            <h1>音設定</h1>
            <p class="meta">localStorageには音声本体を保存せず、この設定だけを保存します。</p>
          </div>
          <button class="btn secondary" id="settingsHome">ホームへ戻る</button>
        </div>
        <div class="card flat">
          ${renderSwitch("soundEnabled", "サウンド全体", s.soundEnabled)}
          ${renderSwitch("announcementEnabled", "車内アナウンス", s.announcementEnabled)}
          ${renderSwitch("trainSoundEnabled", "線路の音", s.trainSoundEnabled)}
          ${renderSwitch("effectEnabled", "効果音", s.effectEnabled)}
          ${renderRange("masterVolume", "マスター音量", s.masterVolume)}
          ${renderRange("announcementVolume", "アナウンス音量", s.announcementVolume)}
          ${renderRange("trainVolume", "線路音量", s.trainVolume)}
          ${renderRange("effectVolume", "効果音音量", s.effectVolume)}
        </div>
        <div class="btn-row">
          <button class="btn" id="testSound">テスト再生</button>
          <button class="btn danger" id="resetSave">セーブデータ初期化</button>
        </div>
      </section>
    `;
    document.getElementById("settingsHome").addEventListener("click", renderHome);
    app.querySelectorAll("[data-setting]").forEach(input => {
      input.addEventListener("input", () => {
        const key = input.dataset.setting;
        if (input.type === "checkbox") saveData.soundSettings[key] = input.checked;
        else saveData.soundSettings[key] = Number(input.value);
        save();
        const valueEl = document.querySelector(`[data-value-for="${key}"]`);
        if (valueEl) valueEl.textContent = `${Math.round(saveData.soundSettings[key] * 100)}`;
      });
    });
    document.getElementById("testSound").addEventListener("click", () => {
      playEffect("departureBell");
      setTimeout(() => playEffect("correct"), 450);
      speakAnnouncement("correct", "default", {});
    });
    document.getElementById("resetSave").addEventListener("click", () => {
      if (!confirm("セーブデータを初期化しますか？")) return;
      localStorage.removeItem(STORAGE_KEY);
      saveData = loadSaveData();
      save();
      renderHome();
    });
  }

  function renderSwitch(key, label, checked) {
    return `
      <div class="setting-row">
        <label for="${key}">${escapeHtml(label)}</label>
        <span class="switch"><input id="${key}" type="checkbox" data-setting="${key}" ${checked ? "checked" : ""}> ${checked ? "ON" : "OFF"}</span>
      </div>
    `;
  }

  function renderRange(key, label, value) {
    return `
      <div class="setting-row">
        <label for="${key}">${escapeHtml(label)}：<span data-value-for="${key}">${Math.round(value * 100)}</span></label>
        <input id="${key}" type="range" min="0" max="1" step="0.01" value="${value}" data-setting="${key}">
      </div>
    `;
  }

  function speakAnnouncement(category, key = "default", values = {}) {
    const group = ANNOUNCEMENTS[category] || {};
    const template = group[key] || group.default || "";
    const message = formatAnnouncement(template, values);
    const box = document.getElementById("announcementBox");
    if (box && message) box.textContent = message;
    if (message) showNonBlockingAnnouncement(message);

    const audioKey = `${category}.${group[key] ? key : "default"}`;
    const src = ANNOUNCEMENT_AUDIO[audioKey] || ANNOUNCEMENT_AUDIO[`${category}.default`];
    if (src) playAudioFile(src, "announcement");
  }

  function showNonBlockingAnnouncement(message) {
    if (!currentSession) return;
    const box = document.getElementById("announcementBox");
    if (box) box.textContent = message;
  }

  function formatAnnouncement(template, values) {
    return String(template).replace(/\{(\w+)\}/g, (_, key) => values[key] ?? "");
  }

  function replayListening(problem, silentToast = false) {
    if (!problem) return;
    if (!silentToast) speakAnnouncement("listening", "replay", {});
    if (problem.audio) playAudioFile(problem.audio, "announcement");
  }

  function showListeningHint(problem) {
    const s = currentSession;
    if (!s || !problem) return;
    s.hintShown = true;
    const hint = document.getElementById("answerHint");
    if (hint) hint.textContent = problem.note || problem.hint || "ヒントはありません。";
    speakAnnouncement("listening", "hint", {});
  }

  function revealListeningAnswer(problem) {
    const s = currentSession;
    if (!s || !problem) return;
    s.answerShown = true;
    s.delay += 3;
    s.miss += 1;
    s.combo = 0;
    saveData.totalMiss += 1;
    addWeakItem(problem, s.line.id);
    updateRunMeters();
    speakAnnouncement("listening", "reveal", {});
    renderDriving();
    updateRunMeters();
  }

  function playEffect(key) {
    if (!saveData.soundSettings.soundEnabled || !saveData.soundSettings.effectEnabled) return;
    const src = SOUND_FILES[key];
    if (!src) return;
    playAudioFile(src, "effect");
  }

  function playAudioFile(src, type = "effect") {
    const settings = saveData.soundSettings;
    if (!settings.soundEnabled) return;
    if (type === "announcement" && !settings.announcementEnabled) return;
    if (type === "effect" && !settings.effectEnabled) return;
    const audio = new Audio(src);
    const typeVolume = type === "announcement" ? settings.announcementVolume : settings.effectVolume;
    audio.volume = clamp(settings.masterVolume * typeVolume, 0, 1);
    audio.play().catch(() => {
      // ブラウザの自動再生制限や音源差し替え前の欠落を許容する。
    });
  }

  function startTrainLoop() {
    const settings = saveData.soundSettings;
    if (!settings.soundEnabled || !settings.trainSoundEnabled) return;
    stopTrainLoop();
    trainLoopAudio = new Audio(SOUND_FILES.trainLoop);
    trainLoopAudio.loop = true;
    trainLoopAudio.volume = clamp(settings.masterVolume * settings.trainVolume, 0, 1);
    trainLoopAudio.play().catch(() => {});
  }

  function stopTrainLoop() {
    if (trainLoopAudio) {
      trainLoopAudio.pause();
      trainLoopAudio.currentTime = 0;
      trainLoopAudio = null;
    }
  }

  function buildHintText(problem, session) {
    if (!problem) return "";
    if (session?.line.source === "listening" || problem.type === "listening") {
      return session?.hintShown ? (problem.note || "ヒントはありません。") : "聞き取り路線：必要ならヒント表示を使えます。";
    }
    const primary = problem.answers[0] || "";
    const alt = problem.answers.slice(1, 4).join(" / ");
    return `${primary}${alt ? ` / ${alt} どちらでもOK` : ""}${problem.note ? `｜${problem.note}` : ""}`;
  }

  function stopTimer() {
    if (timerId) {
      clearInterval(timerId);
      timerId = null;
    }
  }

  function renderSettingsButtonOnly() {}

  function shuffle(array) {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function repeatToLength(list, length) {
    if (!list.length) return [];
    const result = [];
    while (result.length < length) result.push(...shuffle(list));
    return result.slice(0, length);
  }

  function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  function showToast(message) {
    const area = document.getElementById("toastArea");
    const template = document.getElementById("toastTemplate");
    const node = template.content.firstElementChild.cloneNode(true);
    node.textContent = message;
    area.appendChild(node);
    setTimeout(() => node.remove(), 3600);
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function getToday() {
    const date = new Date();
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  updateTopStatus();
  renderHome();
})();
