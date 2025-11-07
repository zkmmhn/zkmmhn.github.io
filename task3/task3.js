const questionsData = [
    {
        question: "Если человека назвали мордофиля, то это…",
        answers: [
            { text: "Значит, что он тщеславный.", correct: true },
            { text: "Значит, что у него лицо как у хряка.", correct: false },
            { text: "Значит, что чумазый.", correct: false }
        ],
        explanation: "Ну зачем же вы так... В Этимологическом словаре русского языка Макса Фасмера поясняется, что мордофилей называют чванливого человека. Ну а «чванливый» — это высокомерный, тщеславный."
    },
    {
        question: "«Да этот Ярополк — фуфлыга!» Что не так с Ярополком?",
        answers: [
            { text: "Он маленький и невзрачный.", correct: true },
            { text: "Он тот еще алкоголик.", correct: false },
            { text: "Он не держит свое слово.", correct: false }
        ],
        explanation: "Точно! Словарь Даля говорит, что фуфлыгой называют невзрачного малорослого человека. А еще так называют прыщи."
    },
    {
        question: "Если человека прозвали пятигузом, значит, он…",
        answers: [
            { text: "Не держит слово.", correct: true },
            { text: "Изменяет жене.", correct: false },
            { text: "Без гроша в кармане.", correct: false }
        ],
        explanation: "Может сесть сразу на пять стульев. Согласно Этимологическому словарю русского языка Макса Фасмера, пятигуз — это ненадежный, непостоянный человек."
    },
    {
        question: "Кто такой шлындра?",
        answers: [
            { text: "Обманщик.", correct: false },
            { text: "Нытик.", correct: false },
            { text: "Бродяга.", correct: true }
        ],
        explanation: "Да! В Словаре русского арго «шлындрать» означает бездельничать, шляться."
    }
];
const shuffledQuestions = questionsData.sort(() => Math.random() - 0.5);

let currentIndex = 0;
let correctCount = 0;
let completedQuestions = [];

document.addEventListener("DOMContentLoaded", () => showQuestion());

function showQuestion() {
    const container = document.getElementById("questionsContainer");
    const noQuestions = document.getElementById("noQuestions");
    const stats = document.getElementById("stats");

    if (currentIndex >= shuffledQuestions.length) {
        noQuestions.style.display = "block";
        stats.style.display = "block";
        document.getElementById("correctCount").textContent = correctCount;
        document.getElementById("totalCount").textContent = shuffledQuestions.length;
        const percent = Math.round((correctCount / shuffledQuestions.length) * 100);
        document.getElementById("percent").textContent = percent;
        document.getElementById("progressBar").style.width = percent + "%";
        showCompletedQuestions();
        return;
    }

    const q = shuffledQuestions[currentIndex];

    const block = document.createElement("div");
    block.className = "question-block";

    block.innerHTML = `
            <div class="question-number">Вопрос ${currentIndex + 1}</div>
            <div class="question-body">
                <div class="question-text">${q.question}</div>
                <div class="answers-container"></div>
            </div>
        `;

    const answersContainer = block.querySelector(".answers-container");
    const shuffled = q.answers.sort(() => Math.random() - 0.5);

    shuffled.forEach(a => {
        const el = document.createElement("div");
        el.className = "answer";
        el.textContent = a.text;

        el.addEventListener('mousedown', () => {
            el.classList.add('shake');
            setTimeout(() => {
                el.classList.remove('shake');
            }, 500);
        });

        el.onclick = () => handleAnswer(el, a.correct, block, q.explanation, q);
        answersContainer.appendChild(el);
    });

    container.appendChild(block);
}

function handleAnswer(answerEl, isCorrect, block, explanation, questionData) {
    const answers = block.querySelectorAll(".answer");
    const questionText = block.querySelector(".question-text");

    answers.forEach(a => a.style.pointerEvents = "none");

    const marker = document.createElement("span");
    marker.className = "marker " + (isCorrect ? "correct-marker" : "incorrect-marker");
    marker.textContent = isCorrect ? "✓" : "✗";
    questionText.prepend(marker);

    const answersContainer = block.querySelector(".answers-container");

    if (isCorrect) {
        answerEl.classList.add("correct");
        correctCount++;

        const exp = document.createElement("div");
        exp.className = "explanation";
        exp.textContent = explanation;
        exp.style.display = "block";
        answersContainer.appendChild(exp);

        setTimeout(() => {
            answers.forEach(a => {
                if (!a.classList.contains("correct")) a.classList.add("move-down");
            });
        }, 2000);

        setTimeout(() => {
            answerEl.classList.add("move-down");
            exp.classList.add("move-down");
        }, 4000);

        setTimeout(() => {
            answersContainer.remove();
            block.classList.add("compact");
        }, 5500);

        setTimeout(() => {
            completedQuestions.push({
                question: questionData.question,
                correctAnswer: questionData.answers.find(a => a.correct).text,
                explanation: explanation,
                isCorrect: true
            });
            currentIndex++;
            showQuestion();
        }, 6000);

    } else {
        answerEl.classList.add("incorrect");

        const correctAnswer = questionData.answers.find(a => a.correct);
        const correctEl = Array.from(answers).find(a => a.textContent === correctAnswer.text);
        if (correctEl) correctEl.classList.add("correct");

        setTimeout(() => {
            answers.forEach(a => a.classList.add("move-down"));
        }, 2000);

        setTimeout(() => {
            answersContainer.remove();
            block.classList.add("compact");
        }, 3500);

        setTimeout(() => {
            completedQuestions.push({
                question: questionData.question,
                correctAnswer: correctAnswer.text,
                explanation: explanation,
                isCorrect: false
            });
            currentIndex++;
            showQuestion();
        }, 4000);
    }
}

function showCompletedQuestions() {
    const container = document.getElementById("questionsContainer");
    container.innerHTML = '';

    completedQuestions.forEach((q, index) => {
        const block = document.createElement("div");
        block.className = "question-block completed compact";
        block.dataset.index = index;

        block.innerHTML = `
            <div class="question-number">Вопрос ${index + 1}</div>
            <div class="question-body">
                <div class="question-text">
                    <span class="marker ${q.isCorrect ? 'correct-marker' : 'incorrect-marker'}">
                        ${q.isCorrect ? '✓' : '✗'}
                    </span>
                    ${q.question}
                </div>
                <button class="show-answer">Показать правильный ответ</button>
                <div class="correct-answer">
                    <strong>Правильный ответ:</strong> ${q.correctAnswer}
                    <div class="explanation" style="display:block; margin-top:8px;">${q.explanation}</div>
                </div>
            </div>
        `;

        const showAnswerBtn = block.querySelector('.show-answer');
        const correctAnswer = block.querySelector('.correct-answer');

        showAnswerBtn.style.display = 'block';

        showAnswerBtn.addEventListener('click', (e) => {
            e.stopPropagation();

            document.querySelectorAll('.correct-answer').forEach(el => {
                if (el !== correctAnswer) el.style.display = 'none';
            });
            document.querySelectorAll('.show-answer').forEach(btn => {
                if (btn !== showAnswerBtn) btn.style.display = 'block';
            });
            document.querySelectorAll('.question-block').forEach(b => {
                if (b !== block) b.classList.add('compact');
            });

            correctAnswer.style.display = 'block';
            showAnswerBtn.style.display = 'none';
            block.classList.remove("compact");
        });

        block.addEventListener('click', () => {
            if (correctAnswer.style.display === 'block') {
                correctAnswer.style.display = 'none';
                showAnswerBtn.style.display = 'block';
                block.classList.add('compact');
            }
        });

        container.appendChild(block);
    });
}
