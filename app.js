const WORD_BANK = {
  easy: [
    { english: 'apple', meaning: '사과' },
    { english: 'book', meaning: '책' },
    { english: 'water', meaning: '물' },
    { english: 'school', meaning: '학교' },
    { english: 'happy', meaning: '행복한' },
    { english: 'family', meaning: '가족' }
  ],
  medium: [
    { english: 'library', meaning: '도서관' },
    { english: 'because', meaning: '왜냐하면' },
    { english: 'important', meaning: '중요한' },
    { english: 'careful', meaning: '조심하는' },
    { english: 'weather', meaning: '날씨' },
    { english: 'question', meaning: '질문' }
  ],
  hard: [
    { english: 'environment', meaning: '환경' },
    { english: 'discover', meaning: '발견하다' },
    { english: 'adventure', meaning: '모험' },
    { english: 'knowledge', meaning: '지식' },
    { english: 'responsible', meaning: '책임감 있는' },
    { english: 'communication', meaning: '의사소통' }
  ]
};

const difficultyOrder = ['easy', 'medium', 'hard'];
const difficultyLabelMap = { easy: '쉬움', medium: '보통', hard: '어려움' };

const scoreEl = document.getElementById('score');
const streakEl = document.getElementById('streak');
const difficultyLabelEl = document.getElementById('difficultyLabel');
const wordPromptEl = document.getElementById('wordPrompt');
const choicesEl = document.getElementById('choices');
const feedbackEl = document.getElementById('feedback');
const reviewBtn = document.getElementById('reviewBtn');
const wrongWordListEl = document.getElementById('wrongWordList');

const state = {
  score: 0,
  streak: 0,
  difficulty: 'easy',
  currentQuestion: null,
  wrongWords: [],
  reviewMode: false,
  reviewQueue: []
};

function shuffle(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

function getPoolByMode() {
  if (state.reviewMode && state.reviewQueue.length > 0) {
    return state.reviewQueue;
  }
  return WORD_BANK[state.difficulty];
}

function getRandomQuestion() {
  const pool = getPoolByMode();
  const target = pool[Math.floor(Math.random() * pool.length)];

  const allMeanings = [
    ...WORD_BANK.easy,
    ...WORD_BANK.medium,
    ...WORD_BANK.hard
  ]
    .filter((item) => item.english !== target.english)
    .map((item) => item.meaning);

  const wrongOptions = shuffle(allMeanings).slice(0, 3);
  const options = shuffle([target.meaning, ...wrongOptions]);

  return {
    english: target.english,
    meaning: target.meaning,
    options
  };
}

function refreshStatus() {
  scoreEl.textContent = String(state.score);
  streakEl.textContent = String(state.streak);
  difficultyLabelEl.textContent = state.reviewMode
    ? `복습 (${difficultyLabelMap[state.difficulty]})`
    : difficultyLabelMap[state.difficulty];
}

function renderWrongWordList() {
  wrongWordListEl.innerHTML = '';

  if (state.wrongWords.length === 0) {
    const empty = document.createElement('li');
    empty.textContent = '아직 틀린 단어가 없어요 👍';
    wrongWordListEl.appendChild(empty);
    reviewBtn.disabled = true;
    return;
  }

  reviewBtn.disabled = false;

  const unique = new Map();
  state.wrongWords.forEach((word) => {
    unique.set(word.english, word);
  });

  unique.forEach((word) => {
    const li = document.createElement('li');
    li.textContent = `${word.english} : ${word.meaning}`;
    wrongWordListEl.appendChild(li);
  });
}

function adjustDifficulty() {
  if (state.reviewMode) {
    return;
  }

  const currentIndex = difficultyOrder.indexOf(state.difficulty);

  if (state.streak >= 3 && currentIndex < difficultyOrder.length - 1) {
    state.difficulty = difficultyOrder[currentIndex + 1];
    state.streak = 0;
    feedbackEl.textContent = '🎉 연속 정답! 난이도가 올라갔어요!';
    feedbackEl.className = 'feedback correct';
  }
}

function askQuestion() {
  refreshStatus();
  renderWrongWordList();

  if (state.reviewMode && state.reviewQueue.length === 0) {
    state.reviewMode = false;
    feedbackEl.textContent = '복습을 완료했어요! 이제 일반 퀴즈로 돌아갑니다.';
    feedbackEl.className = 'feedback correct';
  }

  state.currentQuestion = getRandomQuestion();
  wordPromptEl.textContent = state.currentQuestion.english;
  choicesEl.innerHTML = '';

  state.currentQuestion.options.forEach((option) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'choice-btn';
    button.textContent = option;
    button.addEventListener('click', () => checkAnswer(option));
    choicesEl.appendChild(button);
  });
}

function disableChoices(disabled) {
  document
    .querySelectorAll('.choice-btn')
    .forEach((btn) => (btn.disabled = disabled));
}

function checkAnswer(selected) {
  const correct = state.currentQuestion.meaning;

  disableChoices(true);

  if (selected === correct) {
    state.score += 10;
    state.streak += 1;
    feedbackEl.textContent = '정답! 아주 잘했어요 🌟';
    feedbackEl.className = 'feedback correct';

    if (state.reviewMode) {
      state.reviewQueue = state.reviewQueue.filter(
        (item) => item.english !== state.currentQuestion.english
      );
    }
  } else {
    state.streak = 0;
    feedbackEl.textContent = `아쉬워요! 정답은 "${correct}"였어요.`;
    feedbackEl.className = 'feedback wrong';

    if (
      !state.wrongWords.some(
        (item) => item.english === state.currentQuestion.english
      )
    ) {
      state.wrongWords.push({
        english: state.currentQuestion.english,
        meaning: state.currentQuestion.meaning
      });
    }

    if (state.reviewMode) {
      state.reviewQueue.push({
        english: state.currentQuestion.english,
        meaning: state.currentQuestion.meaning
      });
    }
  }

  adjustDifficulty();
  refreshStatus();
  renderWrongWordList();

  setTimeout(() => {
    askQuestion();
  }, 900);
}

reviewBtn.addEventListener('click', () => {
  state.reviewMode = true;
  state.reviewQueue = shuffle(state.wrongWords);
  feedbackEl.textContent = '복습 모드 시작! 틀린 단어를 다시 맞춰봐요.';
  feedbackEl.className = 'feedback';
  askQuestion();
});

askQuestion();
