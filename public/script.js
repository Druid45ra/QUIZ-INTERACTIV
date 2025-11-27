// script.js — versiunea îmbunătățită cu dark-mode, export CSV, API save și animații
(() => {
  const STORAGE_KEY = "quiz_highscores_v1";
  const THEME_KEY = "quiz_theme_v1";
  const DEFAULT_TIME_PER_Q = 30;
  const SPEED_BONUS_MAX = 10;
  const BASE_POINTS = 10;
  const SERVER_ENDPOINT = "/api/scores";

  const state = {
    pool: [],
    index: 0,
    score: 0,
    correct: 0,
    wrong: 0,
    streak: 0,
    startAt: null,
    totalSecondsElapsed: 0,
    perQuestionStart: null,
    timerInterval: null,
    mode: "exam",
    settings: { timePerQuestion: DEFAULT_TIME_PER_Q, numQuestions: 8 },
    answersLog: [],
  };

  // DOM
  const $ = (s) => document.querySelector(s);
  const startBtn = $("#start-btn");
  const practiceBtn = $("#practice-btn");
  const shuffleBtn = $("#shuffle-btn");
  const startScreen = $("#start-screen");
  const qScreen = $("#question-screen");
  const resultScreen = $("#result-screen");
  const questionText = $("#question-text");
  const answersWrap = $("#answers");
  const progressFill = $("#progress-fill");
  const currentIndexEl = $("#current-index");
  const totalEl = $("#current-index").parent().find("span").eq(1);
  const scoreEl = $("#score");
  const correctCountEl = $("#correct-count");
  const wrongCountEl = $("#wrong-count");
  const totalTimerEl = $("#total-timer");
  const qTimerEl = $("#q-timer");
  const nextBtn = $("#next-btn");
  const quitBtn = $("#quit-btn");
  const restartBtn = $("#restart-btn");
  const finalScoreEl = $("#final-score");
  const finalPercentEl = $("#final-percent");
  const resultMessage = $("#result-message");
  const reviewList = $("#review-list");
  const bestScoreEl = $("#best-score");
  const exportBtn = $("#export-csv");
  const sendServerBtn = $("#send-server");
  const serverStatus = $("#server-status");
  const themeToggle = $("#theme-toggle");

  const timePerInput = $("#time-per-q");
  const numQuestionsInput = $("#num-questions");

  // Utils
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const formatTime = (s) => {
    if (s < 60) return `00:${String(s).padStart(2, "0")}`;
    const mm = Math.floor(s / 60);
    const ss = s % 60;
    return `${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
  };

  // Storage
  function loadBestScore() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const arr = JSON.parse(raw);
      return arr && arr.length ? arr[0] : null;
    } catch {
      return null;
    }
  }
  function saveScoreLocally(entry) {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const arr = raw ? JSON.parse(raw) : [];
      arr.push(entry);
      arr.sort((a, b) => b.score - a.score || a.totalTime - b.totalTime);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(arr.slice(0, 10)));
    } catch {
      /* ignore */
    }
  }

  // Theme
  function initTheme() {
    const stored = localStorage.getItem(THEME_KEY) || "light";
    document.body.setAttribute("data-theme", stored);
    themeToggle.textContent = stored === "dark" ? "☀️" : "🌙";
    themeToggle.onclick = () => {
      const current = document.body.getAttribute("data-theme");
      const next = current === "dark" ? "light" : "dark";
      document.body.setAttribute("data-theme", next);
      localStorage.setItem(THEME_KEY, next);
      themeToggle.textContent = next === "dark" ? "☀️" : "🌙";
      // tiny motion
      themeToggle.animate(
        [{ transform: "rotate(0deg)" }, { transform: "rotate(360deg)" }],
        { duration: 420 }
      );
    };
  }

  // Init
  function init() {
    progressTotalQuestions.textContent = QUESTIONS.length;
    startBtn.addEventListener("click", () => startQuiz("exam"));
    practiceBtn.addEventListener("click", () => startQuiz("practice"));
    shuffleBtn.addEventListener("click", shufflePool);
    nextBtn.addEventListener("click", onNextClicked);
    quitBtn.addEventListener("click", onQuit);
    restartBtn.addEventListener("click", resetToStart);
    $("#retry-btn").addEventListener("click", () => startQuiz(state.mode));
    $("#back-btn").addEventListener("click", resetToStart);
    exportBtn.addEventListener("click", exportCSV);
    sendServerBtn.addEventListener("click", sendScoreToServer);

    timePerInput.addEventListener("change", () => {
      state.settings.timePerQuestion = clamp(
        Number(timePerInput.value) || DEFAULT_TIME_PER_Q,
        5,
        600
      );
    });
    numQuestionsInput.addEventListener("change", () => {
      state.settings.numQuestions = clamp(
        Number(numQuestionsInput.value) || 8,
        3,
        QUESTIONS.length
      );
    });

    // keyboard shortcuts
    window.addEventListener("keydown", (ev) => {
      if (qScreen.classList.contains("hidden")) return;
      const key = ev.key;
      if (/^[1-9]$/.test(key)) {
        const idx = Number(key) - 1;
        const btn = answersWrap.querySelectorAll("button")[idx];
        if (btn && !btn.disabled) btn.click();
      } else if (key === "Enter") {
        if (!nextBtn.classList.contains("hidden")) nextBtn.click();
      }
    });

    // show best score if present
    const best = loadBestScore();
    bestScoreEl.textContent = best
      ? `${best.score}p (${best.correct}/${best.total})`
      : "—";

    // theme init
    initTheme();
    // entrance animation for start panel
    setTimeout(() => startScreen.classList.add("show"), 60);
  }

  // Shuffle
  function shufflePool() {
    for (let i = QUESTIONS.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [QUESTIONS[i], QUESTIONS[j]] = [QUESTIONS[j], QUESTIONS[i]];
    }
    shuffleBtn.classList.add("animate-bounce");
    setTimeout(() => shuffleBtn.classList.remove("animate-bounce"), 600);
    progressTotalQuestions.textContent = QUESTIONS.length;
  }

  // Start
  function startQuiz(mode = "exam") {
    state.mode = mode;
    state.settings.timePerQuestion = clamp(
      Number(timePerInput.value) || DEFAULT_TIME_PER_Q,
      5,
      600
    );
    state.settings.numQuestions = clamp(
      Number(numQuestionsInput.value) || 8,
      3,
      QUESTIONS.length
    );

    state.pool = QUESTIONS.slice(0)
      .sort(() => Math.random() - 0.5)
      .slice(0, state.settings.numQuestions);
    state.index = 0;
    state.score = 0;
    state.correct = 0;
    state.wrong = 0;
    state.streak = 0;
    state.totalSecondsElapsed = 0;
    state.answersLog = [];
    state.startAt = Date.now();

    startScreen.classList.add("hidden");
    resultScreen.classList.add("hidden");
    qScreen.classList.remove("hidden");
    restartBtn.classList.add("hidden");
    nextBtn.classList.add("hidden");

    totalEl.textContent = state.pool.length;
    currentIndexEl.textContent = 1;
    scoreEl.textContent = "0";
    correctCountEl.textContent = "0";
    wrongCountEl.textContent = "0";
    updateProgress();
    updateTimersDisplay();

    if (state.timerInterval) clearInterval(state.timerInterval);
    state.timerInterval = setInterval(() => {
      state.totalSecondsElapsed = Math.floor(
        (Date.now() - state.startAt) / 1000
      );
      updateTimersDisplay();
    }, 500);

    // slight slide-in for container
    qScreen.querySelector("article")?.classList.add("slide-left");
    requestAnimationFrame(() =>
      setTimeout(
        () => qScreen.querySelector("article")?.classList.add("show"),
        20
      )
    );

    renderCurrentQuestion();
  }

  function updateTimersDisplay() {
    totalTimerEl.textContent = formatTime(state.totalSecondsElapsed);
  }

  function startQuestionTimer() {
    state.perQuestionStart = Date.now();
    if (state._qTick) clearInterval(state._qTick);
    state._qTick = setInterval(() => {
      const elapsed = Math.floor((Date.now() - state.perQuestionStart) / 1000);
      const remaining = Math.max(0, state.settings.timePerQuestion - elapsed);
      qTimerEl.textContent = String(remaining);
      if (remaining <= Math.ceil(state.settings.timePerQuestion * 0.25))
        qTimerEl.classList.add("text-[color:var(--danger)]");
      else qTimerEl.classList.remove("text-[color:var(--danger)]");
      if (remaining === 0) {
        clearInterval(state._qTick);
        handleAnswer(null, true);
      }
    }, 250);
  }

  function stopQuestionTimer() {
    if (state._qTick) {
      clearInterval(state._qTick);
      state._qTick = null;
    }
  }

  // Render question with richer animations
  function renderCurrentQuestion() {
    const item = state.pool[state.index];
    if (!item) return finishQuiz();

    currentIndexEl.textContent = state.index + 1;
    // container motion
    const container = questionText.closest("article");
    if (container) {
      container.classList.remove("slide-left", "show");
      void container.offsetWidth;
      container.classList.add("slide-left");
      requestAnimationFrame(() =>
        setTimeout(() => container.classList.add("show"), 8)
      );
    }

    questionText.textContent = item.q;
    answersWrap.innerHTML = "";

    item.options.forEach((opt, i) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className =
        "w-full text-left px-4 py-3 border rounded-lg focus-ring motion-enter";
      btn.innerHTML = `<div class="flex items-center justify-between"><div>${String.fromCharCode(
        65 + i
      )}. ${opt}</div><div class="text-xs text-[color:var(--muted)]"></div></div>`;
      btn.addEventListener("click", () => handleAnswer(i, false));
      btn.dataset.index = i;
      answersWrap.appendChild(btn);

      // staggered reveal with pop-in
      setTimeout(() => {
        btn.classList.add("motion-show");
        btn.classList.add("motion-pop");
        // remove pop animation class after finish to allow re-use
        setTimeout(() => btn.classList.remove("motion-pop"), 520);
      }, 80 + i * 70);
    });

    $("#feedback").textContent = "";
    nextBtn.classList.add("hidden");
    restartBtn.classList.add("hidden");

    qTimerEl.textContent = String(state.settings.timePerQuestion);
    qTimerEl.classList.remove("text-[color:var(--danger)]");
    startQuestionTimer();
    state.perQuestionStart = Date.now();
  }

  // Handle answer (same scoring, plus animations)
  function handleAnswer(selectedIndex, timeout = false) {
    const buttons = Array.from(answersWrap.querySelectorAll("button"));
    if (buttons.length === 0) return;
    if (buttons[0].disabled) return;

    stopQuestionTimer();

    const item = state.pool[state.index];
    const correctIndex = item.answer;
    const timeTaken = Math.max(
      0,
      Math.floor((Date.now() - state.perQuestionStart) / 1000)
    );
    let pointsAwarded = 0;
    let isCorrect = false;

    if (!timeout && selectedIndex === correctIndex) {
      isCorrect = true;
      const speedRatio = clamp(
        (state.settings.timePerQuestion - timeTaken) /
          state.settings.timePerQuestion,
        0,
        1
      );
      const speedBonus = Math.round(SPEED_BONUS_MAX * speedRatio);
      const streakBonus = Math.floor(state.streak / 3);
      pointsAwarded = BASE_POINTS + speedBonus + streakBonus;
      state.score += pointsAwarded;
      state.correct++;
      state.streak++;
      scoreEl.textContent = String(state.score);
      correctCountEl.textContent = String(state.correct);
    } else {
      isCorrect = false;
      pointsAwarded = 0;
      state.wrong++;
      state.streak = 0;
      wrongCountEl.textContent = String(state.wrong);
      state.score = Math.max(0, state.score - 2);
      scoreEl.textContent = String(state.score);
    }

    buttons.forEach((btn) => {
      btn.disabled = true;
      const i = Number(btn.dataset.index);
      if (i === correctIndex) btn.classList.add("is-correct");
      if (!isCorrect && i === selectedIndex) btn.classList.add("is-wrong");
    });

    state.answersLog.push({
      qId: item.id || `idx-${state.index}`,
      q: item.q,
      selected: selectedIndex,
      correctIndex,
      timeTaken,
      pointsAwarded,
      options: item.options,
      explain: item.explain || "",
    });

    const fb = $("#feedback");
    if (isCorrect)
      fb.innerHTML = `<span class="text-[color:var(--success)] font-medium">Corect!</span> +${pointsAwarded}p`;
    else
      fb.innerHTML = `<span class="text-[color:var(--danger)] font-medium">Greșit.</span> Răspuns corect: <strong>${item.options[correctIndex]}</strong>`;

    nextBtn.classList.remove("hidden");
    nextBtn.textContent =
      state.index === state.pool.length - 1 ? "Vezi rezultate" : "Următoarea";

    if (isCorrect) {
      scoreEl.animate(
        [{ transform: "scale(1.06)" }, { transform: "scale(1)" }],
        { duration: 260 }
      );
    }

    updateProgress();
  }

  function onNextClicked() {
    if (state.index < state.pool.length - 1) {
      state.index++;
      renderCurrentQuestion();
    } else {
      finishQuiz();
    }
  }

  function updateProgress() {
    const pct = Math.round((state.index / state.pool.length) * 100);
    progressFill.style.width = `${pct}%`;
  }

  function finishQuiz() {
    stopQuestionTimer();
    if (state.timerInterval) clearInterval(state.timerInterval);
    state.totalSecondsElapsed = Math.floor((Date.now() - state.startAt) / 1000);

    qScreen.classList.add("hidden");
    resultScreen.classList.remove("hidden");

    finalScoreEl.textContent = String(state.score);
    finalPercentEl.textContent = Math.round(
      (state.correct / state.pool.length) * 100
    );
    const perf = state.correct / state.pool.length;
    let msg = "Bine! Poți încerca din nou pentru a îmbunătăți scorul.";
    if (perf === 1) msg = "Perfect — rezultat impecabil!";
    else if (perf >= 0.75) msg = "Foarte bine — aproape perfect!";
    else if (perf >= 0.5) msg = "OK — continuă să exersezi!";
    resultMessage.textContent = msg;

    reviewList.innerHTML = "";
    state.answersLog.forEach((a, idx) => {
      const wrap = document.createElement("div");
      wrap.className = "p-3 bg-[color:var(--card)] rounded-lg border text-sm";
      const wasCorrect = a.selected === a.correctIndex;
      wrap.innerHTML = `
        <div class="flex justify-between items-start">
          <div>
            <div class="font-medium">Q${idx + 1}. ${a.q}</div>
            <div class="text-xs text-[color:var(--muted)] mt-1">Răspuns tău: <strong>${
              a.selected === null ? "Timp expirat" : a.options[a.selected]
            }</strong> — Corect: <strong>${
        a.options[a.correctIndex]
      }</strong></div>
            ${
              a.explain
                ? `<div class="text-xs text-[color:var(--muted)] mt-1">${a.explain}</div>`
                : ""
            }
          </div>
          <div class="text-right">
            <div class="${
              wasCorrect
                ? "text-[color:var(--success)]"
                : "text-[color:var(--danger)]"
            } font-semibold">${
        wasCorrect ? "+" + a.pointsAwarded + "p" : "-"
      } </div>
            <div class="text-xs text-[color:var(--muted)]">${a.timeTaken}s</div>
          </div>
        </div>`;
      reviewList.appendChild(wrap);
    });

    if (state.mode === "exam") {
      saveScoreLocally({
        score: state.score,
        correct: state.correct,
        total: state.pool.length,
        totalTime: state.totalSecondsElapsed,
        when: Date.now(),
      });
      const best = loadBestScore();
      bestScoreEl.textContent = best
        ? `${best.score}p (${best.correct}/${best.total})`
        : "—";
    }
  }

  function onQuit() {
    if (
      !confirm("Ești sigur că vrei să renunți? Progresul curent se va pierde.")
    )
      return;
    resetToStart();
  }

  function resetToStart() {
    stopQuestionTimer();
    if (state.timerInterval) clearInterval(state.timerInterval);
    qScreen.classList.add("hidden");
    resultScreen.classList.add("hidden");
    startScreen.classList.remove("hidden");
    restartBtn.classList.add("hidden");
    nextBtn.classList.add("hidden");
    state.pool = [];
    state.answersLog = [];
  }

  // --- Export CSV ---
  function exportCSV() {
    if (!state.answersLog.length)
      return alert("Nu există rezultate de exportat.");
    const header = [
      "#",
      "Întrebare",
      "Răspunsul tău",
      "Corect",
      "Timp (s)",
      "Puncte",
      "Explicație",
    ];
    const rows = state.answersLog.map((r, i) => {
      const selected =
        r.selected === null
          ? ""
          : `"${r.options[r.selected].replace(/"/g, '""')}"`;
      const correct = `"${r.options[r.correctIndex].replace(/"/g, '""')}"`;
      const q = `"${(r.q || "").replace(/"/g, '""')}"`;
      const explain = r.explain ? `"${r.explain.replace(/"/g, '""')}"` : "";
      return [
        i + 1,
        q,
        selected,
        correct,
        r.timeTaken,
        r.pointsAwarded,
        explain,
      ].join(",");
    });
    const csv = [header.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const date = new Date().toISOString().slice(0, 19).replace("T", "_");
    a.download = `quiz_results_${date}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  // --- Send to server (POST) ---
  async function sendScoreToServer() {
    if (!state.answersLog.length)
      return alert("Nu există rezultate pentru a trimite.");
    serverStatus.textContent = "Trimit...";
    sendServerBtn.disabled = true;
    try {
      const payload = {
        score: state.score,
        correct: state.correct,
        total: state.pool.length,
        totalTime: state.totalSecondsElapsed,
        answers: state.answersLog,
        when: Date.now(),
      };
      const res = await fetch(SERVER_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`Eroare server: ${res.status}`);
      const data = await res.json();
      serverStatus.textContent = "Trimis ✓";
      // tiny success pulse
      serverStatus.animate(
        [{ transform: "scale(1.06)" }, { transform: "scale(1)" }],
        { duration: 300 }
      );
      setTimeout(() => (serverStatus.textContent = ""), 4000);
    } catch (err) {
      serverStatus.textContent = "Eroare trimitere";
      console.error(err);
      alert(
        "Nu s-a putut trimite rezultatul către server. Verifică serverul local sau CORS."
      );
    } finally {
      sendServerBtn.disabled = false;
    }
  }

  // Kickoff
  init();
})();
