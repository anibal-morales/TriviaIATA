// Referencias al DOM (asegúrate de tener el arreglo AIRPORTS cargado desde airports.js)
const iataCodeEl = document.getElementById("iata-code");
const formEl = document.getElementById("trivia-form");
const inputEl = document.getElementById("answer-input");
const submitBtnEl = document.getElementById("submit-btn");
const feedbackEl = document.getElementById("feedback");
const nextBtnEl = document.getElementById("next-btn");
const scoreEl = document.getElementById("score");
const streakEl = document.getElementById("streak");
const timerEl = document.getElementById("timer");
const timerBarEl = document.getElementById("timer-bar");

// Configuración y estado del juego
const QUESTION_TIME_LIMIT = 10; // segundos por pregunta
let score = 0;
let streak = 0;
let currentAirport = null;
let remainingAirports = [];
let hasAnswered = false;
let timeLeft = QUESTION_TIME_LIMIT;
let timerId = null;

function normalizeText(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function shuffleArray(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function updateScoreboard() {
  scoreEl.textContent = score;
  streakEl.textContent = streak;
}

function updateTimerDisplay() {
  const safeTimeLeft = Math.max(0, timeLeft);
  const percentage = (safeTimeLeft / QUESTION_TIME_LIMIT) * 100;

  timerEl.textContent = `${safeTimeLeft}s`;
  timerBarEl.style.width = `${percentage}%`;

  const isWarning = safeTimeLeft <= 3 && !hasAnswered;
  timerEl.classList.toggle("timer-warning", isWarning);
  timerBarEl.classList.toggle("warning", isWarning);
}

function stopTimer() {
  if (timerId !== null) {
    clearInterval(timerId);
    timerId = null;
  }
}

function finishQuestionUI() {
  hasAnswered = true;
  inputEl.disabled = true;
  submitBtnEl.disabled = true;
  stopTimer();
  updateTimerDisplay();
  nextBtnEl.classList.remove("hidden");
  nextBtnEl.focus();
}

function handleTimeOut() {
  if (hasAnswered || !currentAirport) return;

  timeLeft = 0;
  streak = 0;

  feedbackEl.textContent = `Se te acabo el tiempo nenita :P ${currentAirport.code} corresponde a ${currentAirport.city}, ${currentAirport.country} — ${currentAirport.name}.`;
  feedbackEl.className = "feedback incorrect";

  updateScoreboard();
  finishQuestionUI();
}

function startTimer() {
  stopTimer(); // Evita que queden intervalos anteriores activos
  timeLeft = QUESTION_TIME_LIMIT;
  updateTimerDisplay();

  timerId = setInterval(() => {
    timeLeft -= 1;
    updateTimerDisplay();

    if (timeLeft <= 0) {
      handleTimeOut();
    }
  }, 1000);
}

function loadNextQuestion() {
  if (remainingAirports.length === 0) {
    remainingAirports = shuffleArray(AIRPORTS);
  }

  currentAirport = remainingAirports.pop();
  hasAnswered = false;

  iataCodeEl.textContent = currentAirport.code;
  inputEl.value = "";
  inputEl.disabled = false;
  submitBtnEl.disabled = false;
  feedbackEl.textContent = "";
  feedbackEl.className = "feedback";
  nextBtnEl.classList.add("hidden");
  inputEl.focus();

  startTimer();
}

function handleSubmit(event) {
  event.preventDefault();
  if (hasAnswered || !currentAirport) return;

  const userAnswer = normalizeText(inputEl.value);
  if (!userAnswer) return;

  const validAnswers = new Set([
    normalizeText(currentAirport.city),
    ...(currentAirport.aliases || []).map(normalizeText)
  ]);

  if (validAnswers.has(userAnswer)) {
    streak += 1;
    // Suma puntos base + bono por racha + bono por velocidad (1 punto por segundo restante)
    const streakBonus = Math.min((streak - 1) * 5, 20);
    const speedBonus = timeLeft;
    score += 10 + streakBonus + speedBonus;

    feedbackEl.textContent = `CORRRRRECTO (+${10 + streakBonus + speedBonus} pts) ${currentAirport.code} es ${currentAirport.city}, ${currentAirport.country} (${currentAirport.name}).`;
    feedbackEl.className = "feedback correct";
  } else {
    streak = 0;
    feedbackEl.textContent = `Nerea pendeja estupida!!!. ${currentAirport.code} corresponde a ${currentAirport.city}, ${currentAirport.country} — ${currentAirport.name}.`;
    feedbackEl.className = "feedback incorrect";
  }

  updateScoreboard();
  finishQuestionUI();
}

formEl.addEventListener("submit", handleSubmit);
nextBtnEl.addEventListener("click", loadNextQuestion);

updateScoreboard();
loadNextQuestion();