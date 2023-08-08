document.addEventListener('DOMContentLoaded', () => {
    const apiUrl = 'https://opentdb.com/api.php';

    const startBtn = document.getElementById('startBtn');
    const restartBtn = document.getElementById('restartBtn');
    const nextBtn = document.getElementById('nextBtn');
    const questionElement = document.querySelector('.question');
    const answersList = document.querySelector('.answers');
    const scoreElement = document.getElementById('score');
    const timerElement = document.getElementById('timer');
    const difficultySelect = document.getElementById('difficulty');
    const typeSelect = document.getElementById('type');
    const categorySelect = document.getElementById('category');

    if (startBtn && restartBtn && nextBtn && questionElement && answersList && scoreElement && timerElement && difficultySelect && typeSelect && categorySelect) {
        let questions = [];
        let currentQuestionIndex = 0;
        let score = 0;
        let timerInterval;

        startBtn.addEventListener('click', startTrivia);
        restartBtn.addEventListener('click', restartTrivia);
        nextBtn.addEventListener('click', nextQuestion);

        async function startTrivia() {
            try {
                const category = categorySelect.value;
                const difficulty = difficultySelect.value;
                const type = typeSelect.value;

                questions = await fetchTrivia(category, difficulty, type);

                startBtn.classList.add('hidden');
                restartBtn.classList.add('hidden');
                nextBtn.classList.remove('hidden');
                score = 0;
                currentQuestionIndex = 0;
                updateScore();
                displayQuestion(questions[currentQuestionIndex]);
                startTimer(60); // Cambiar el valor del cronómetro según lo desees
            } catch (error) {
                console.error(error);
            }
        }

        function restartTrivia() {
            clearInterval(timerInterval);
            timerElement.textContent = '60';
            startTrivia();
        }

        function startTimer(duration) {
            let time = duration;
            timerInterval = setInterval(() => {
                timerElement.textContent = time;
                if (time <= 0) {
                    clearInterval(timerInterval);
                    displayFinalScore();
                }
                time--;
            }, 1000);
        }

        function nextQuestion() {
            currentQuestionIndex++;
            if (currentQuestionIndex < questions.length) {
                displayQuestion(questions[currentQuestionIndex]);
                nextBtn.classList.add('hidden');
            } else {
                displayFinalScore();
            }
        }

        function displayQuestion(question) {
            questionElement.textContent = decodeEntities(question.question);
            answersList.innerHTML = '';

            const allAnswers = [...question.incorrect_answers, question.correct_answer];
            const shuffledAnswers = shuffleArray(allAnswers);

            shuffledAnswers.forEach(answer => {
                const answerItem = document.createElement('li');
                answerItem.textContent = decodeEntities(answer);
                answerItem.addEventListener('click', () => checkAnswer(answer, question.correct_answer));
                answersList.appendChild(answerItem);
            });
        }

        function updateScore() {
            scoreElement.textContent = score;
        }

        function checkAnswer(selectedAnswer, correctAnswer) {
            clearInterval(timerInterval);
            if (selectedAnswer === correctAnswer) {
                score += 100;
                updateScore();
            }
            nextBtn.classList.remove('hidden');
        }

        function displayFinalScore() {
            questionElement.textContent = 'Trivia completada';
            answersList.innerHTML = '';
            nextBtn.classList.add('hidden');
            restartBtn.classList.remove('hidden');
        }

        async function fetchTrivia(category, difficulty, type) {
            const response = await fetch(`${apiUrl}?amount=10&category=${category}&difficulty=${difficulty}&type=${type}&lang=es`);
            const data = await response.json();

            if (data.results) {
                return data.results;
            } else {
                throw new Error('Error al obtener las preguntas');
            }
        }

        function shuffleArray(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
        }

        function decodeEntities(encodedString) {
            const textArea = document.createElement('textarea');
            textArea.innerHTML = encodedString;
            return textArea.value;
        }

        async function populateCategories() {
            try {
                const response = await fetch('https://opentdb.com/api_category.php');
                const data = await response.json();

                if (data.trivia_categories) {
                    data.trivia_categories.forEach(category => {
                        const option = document.createElement('option');
                        option.value = category.id;
                        option.textContent = category.name;
                        categorySelect.appendChild(option);
                    });
                }
            } catch (error) {
                console.error(error);
            }
        }

        populateCategories();
    } else {
        console.error('No se pudo encontrar uno o más elementos en el DOM.');
    }
});
