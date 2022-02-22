// Pages
const gamePage = document.getElementById('game-page');
const scorePage = document.getElementById('score-page');
const splashPage = document.getElementById('splash-page');
const countdownPage = document.getElementById('countdown-page');
// Splash Page
const startForm = document.getElementById('start-form');
const radioContainers = document.querySelectorAll('.radio-container');
const radioInputs = document.querySelectorAll('input');
const bestScores = document.querySelectorAll('.best-score-value');
// Countdown Page
const countdown = document.querySelector('.countdown');
// Game Page
const itemContainer = document.querySelector('.item-container');
// Score Page
const finalTimeEl = document.querySelector('.final-time');
const baseTimeEl = document.querySelector('.base-time');
const penaltyTimeEl = document.querySelector('.penalty-time');
const playAgainBtn = document.querySelector('.play-again');

// Equations
let questionAmount = 0;
let equationsArray = [];
let playerGuessArray = [];
let bestScoreArray = [];

// Game Page
let firstNumber = 0;
let secondNumber = 0;
let equationObject = {};
const wrongFormat = [];

// Time
let timer;
let timePlayed = 0;
let baseTime = 0;
let penaltyTime = 0;
let finalTime = 0;
let finalTimeDisplay = '0.0';

// Scroll
let valueY = 0; //80px height for each eqn


const bestScoresToDOM = () => {
  bestScores.forEach((bestScoreEl, index) => {
    bestScoreEl.textContent = `${bestScoreArray[index].bestScore}s`
  })
}

// Check localStorage for best scores, and set bestScoreArray
const getSavedBestScores = () => {
  if (localStorage.getItem('bestScores')) {
    bestScoreArray = JSON.parse(localStorage.bestScores);
  } else {
    bestScoreArray = [
      {questions: 10, bestScore: finalTimeDisplay},
      {questions: 25, bestScore: finalTimeDisplay},
      {questions: 50, bestScore: finalTimeDisplay},
      {questions: 99, bestScore: finalTimeDisplay},
    ];
  }
  bestScoresToDOM();
}

// Set best score array
const updateBestScore = () => {
  bestScoreArray.forEach((score, index) => {
    // Select correct one to update
    if (questionAmount == score.questions) {
      const savedBestScore = Number(bestScoreArray[index].bestScore);
      // Update if new score is less than saved score (better) or replacing 0.0s
      if (savedBestScore === 0 || savedBestScore > finalTime) {
        bestScoreArray[index].bestScore = finalTimeDisplay;
      }
    }
  });
  // Update splash page
  bestScoresToDOM();
  //Save to localStorage
  localStorage.setItem('bestScores', JSON.stringify(bestScoreArray));
}

// Reset Game
const playAgain = () => {
  gamePage.addEventListener('click', startTimer);
  scorePage.hidden = true;
  splashPage.hidden = false;
  equationsArray = [];
  playerGuessArray = [];
  valueY = 0;
  playAgainBtn.hidden = true;
}

// Show Scores Page
const showScorePage = () => {
  // Show Play Again button after 1 seocnd pause (avoid skipping page)
  gamePage.hidden = true;
  scorePage.hidden = false;
  setTimeout(() => {
    playAgainBtn.hidden = false;
  }, 1000);
  
}

// Format and show scored in DOM
const scoresToDOM = () => {
  finalTimeDisplay = finalTime.toFixed(1);
  baseTime = timePlayed.toFixed(1);
  penaltyTime = penaltyTime.toFixed(1);
  baseTimeEl.textContent = `Base Time: ${baseTime}s`;
  penaltyTimeEl.textContent = `Penalty: +${penaltyTime}s (${penaltyTime/0.5} Wrong)`;
  finalTimeEl.textContent = `${finalTimeDisplay}s`
  updateBestScore();
  // scroll to top of item container and show score page
  itemContainer.scrollTo({top: 0, behavior: 'instant'});
  showScorePage();
}

// Stop time, check results, go to score pg
const checkTime = () => {
  if (playerGuessArray.length == questionAmount) {
    clearInterval(timer);
    // Add penalty time if detected wrong guess
    equationsArray.forEach((equation, index) => {
      if (equation.evaluated !== playerGuessArray[index]) {
        // WRONG guess, add penalty
        penaltyTime +=0.5;
      }
    });
    finalTime = timePlayed + penaltyTime;
    console.log('time', timePlayed, 'penalty', penaltyTime, 'final', finalTime)
    scoresToDOM();
  }
}

// Ad 1/10th of second to timePlayed
const addTime = () => {
  timePlayed += 0.1;
  checkTime();
}

// Start timer when user interracts
const startTimer = () => {
  // Reset times
  timePlayed = 0;
  penaltyTime = 0;
  finalTime = 0;
  timer = setInterval(addTime, 100);
  gamePage.removeEventListener('click', startTimer);

}

// Scroll down and store user answer in playerGuessArray
const select = (guessedTrue) => {
  valueY += 80;
  itemContainer.scroll(0, valueY);
  // Add player guess to array
  guessedTrue ? playerGuessArray.push('true') : playerGuessArray.push('false');
  return;
}

// Displays Game Page
const showGamePage = () => {
  gamePage.hidden = false;
  countdownPage.hidden = true;
}


// Get random num 0->max
const getRandomInt = (max) => {
  return Math.floor(Math.random() * Math.floor(max));
}

// Create Correct/Incorrect Random Equations
function createEquations() {
  // Randomly choose how many correct equations there should be
  const correctEquations = getRandomInt(questionAmount);
  
  // Set amount of wrong equations
  const wrongEquations = questionAmount - correctEquations;

  // Loop through, multiply random numbers up to 9, push to array
  for (let i = 0; i < correctEquations; i++) {
    firstNumber = getRandomInt(9);
    secondNumber = getRandomInt(9);
    const equationValue = firstNumber * secondNumber;
    const equation = `${firstNumber} x ${secondNumber} = ${equationValue}`;
    equationObject = { value: equation, evaluated: 'true' };
    equationsArray.push(equationObject);
  }
  // Loop through, mess with the equation results, push to array
  for (let i = 0; i < wrongEquations; i++) {
    firstNumber = getRandomInt(9);
    secondNumber = getRandomInt(9);
    const equationValue = firstNumber * secondNumber;
    wrongFormat[0] = `${firstNumber} x ${secondNumber + 1} = ${equationValue}`;
    wrongFormat[1] = `${firstNumber} x ${secondNumber} = ${equationValue - 1}`;
    wrongFormat[2] = `${firstNumber + 1} x ${secondNumber} = ${equationValue}`;
    const formatChoice = getRandomInt(3);
    const equation = wrongFormat[formatChoice];
    equationObject = { value: equation, evaluated: 'false' };
    equationsArray.push(equationObject);
  }
  shuffle(equationsArray);
}

const equationsToDOM = () => {
  equationsArray.forEach((equation) => {
    // Item
    const item = document.createElement('div');
    item.classList.add('item');
    // Equation Text
    const equationText = document.createElement('h1');
    equationText.textContent = equation.value;
    // Append
    item.appendChild(equationText);
    itemContainer.appendChild(item);
  })
}

// Dynamically adding correct/incorrect equations
function populateGamePage() {

  // Reset DOM, Set Blank Space Above
  itemContainer.textContent = '';
  // Spacer
  const topSpacer = document.createElement('div');
  topSpacer.classList.add('height-240');
  // Selected Item
  const selectedItem = document.createElement('div');
  selectedItem.classList.add('selected-item');
  // Append
  itemContainer.append(topSpacer, selectedItem);

  // Create Equations, Build Elements in DOM
  createEquations();
  equationsToDOM();

  // Set Blank Space Below
  const bottomSpacer = document.createElement('div');
  bottomSpacer.classList.add('height-500');
  itemContainer.appendChild(bottomSpacer);

}

// Display: 3, 2, 1, GO!
const countdownStart = () => {
  let count = 3;

  countdown.textContent = count;
  const timeCountdown = setInterval(()=> {
    count--;
    if(count === 0) {
      countdown.textContent = 'GO!'
    } else if (count < 0) {
      showGamePage();
      clearInterval(timeCountdown);
    } else {
      countdown.textContent = count;
    }
  }, 1000);
}

// Go from Splash Page -> Countdown Page
const showCountdown = () => {
  splashPage.hidden = true;
  countdownPage.hidden = false;
  countdownStart();
  populateGamePage();
  setTimeout(showGamePage, 4500);
}

// Get value of selected radio button
const getRadioValue = () => {
  let radioValue = '';
  radioInputs.forEach((radioInput) => {
    if (radioInput.checked) {
      radioValue = radioInput.value; //found selected option
    }
  });
  return radioValue;
}


const selectQuestionAmount = (e) => {
  e.preventDefault();
  questionAmount = getRadioValue();
  // console.log(questionAmount);
  if (questionAmount) {
    showCountdown();
  }
}

startForm.addEventListener('click', () => {
  radioContainers.forEach((radioEl) => {
    // Reset selected label styling
    radioEl.classList.remove('selected-label');
    // Add it back if radio button is checked
    radioEl.children[1].checked && radioEl.classList.add('selected-label');
  })
});

// Event Listeners
startForm.addEventListener('submit', selectQuestionAmount);
gamePage.addEventListener('click', startTimer);

// On Load
getSavedBestScores();
