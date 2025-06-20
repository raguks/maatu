import React, { useState, useEffect, useMemo, useRef } from 'react';
import './MaatuQuizPage.css';
import { allSentences, wordBatches, kannadaQuestionsData, minimalLearningSentences, allPossibleEnglishAnswers } from './QuizData.js';

// Dynamically load html2canvas library for image downloading
const loadScript = (src) => {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve(script);
    script.onerror = () => reject(new Error(`Script load error for ${src}`));
    document.body.appendChild(script);
  });
};

// --- Helper Functions (Defined before the component) ---

// Fisher-Yates shuffle algorithm
const shuffleArray = (array) => {
  const newArray = [...array]; // Create a shallow copy to avoid modifying original
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

// Function to get a random subset of questions
const getRandomQuestions = (data, count) => {
  const shuffled = shuffleArray(data); // Use the helper shuffle function
  return shuffled.slice(0, count);
};

// Function to generate options for a question
// Updated signature to correctly handle incorrect options based on quizType
const generateOptions = (quizType, correctAnswer, incorrectOptionsProvided = []) => {
  let chosenIncorrect = [];

  if (quizType === 'sentence' || quizType === 'minimalLearning') {
    // For sentence and minimal learning, prompt is English, options are Kannada
    // incorrectOptionsProvided will be currentQuestion.incorrectOptions for these types
    const uniqueIncorrectOptions = incorrectOptionsProvided.filter(
      option => option !== correctAnswer
    );

    if (uniqueIncorrectOptions.length >= 3) {
      chosenIncorrect = shuffleArray(uniqueIncorrectOptions).slice(0, 3);
    } else {
      chosenIncorrect = [...uniqueIncorrectOptions];
      while (chosenIncorrect.length < 3) {
        chosenIncorrect.push(`[ಆಯ್ಕೆ ${chosenIncorrect.length + 1}]`); // Placeholders for Kannada options if insufficient
      }
    }
  } else if (quizType === 'word' || quizType === 'kannadaQuestion') {
    // For word and Kannada question, prompt is Kannada, options are English
    // incorrectOptionsProvided will be currentQuestion.incorrectOptions for these types (now present in wordBatches)
    let incorrectCandidates = incorrectOptionsProvided.filter(
      word => word !== correctAnswer
    );

    incorrectCandidates = shuffleArray(incorrectCandidates); // Shuffle candidates once

    // Take up to 3 unique incorrect options from the filtered and shuffled candidates
    for (let i = 0; i < incorrectCandidates.length && chosenIncorrect.length < 3; i++) {
        if (!chosenIncorrect.includes(incorrectCandidates[i])) { // Ensure uniqueness within chosenIncorrect
            chosenIncorrect.push(incorrectCandidates[i]);
        }
    }

    // If still not enough unique English words from the provided incorrectOptions,
    // and if allPossibleEnglishAnswers is available, try to draw from there.
    // This is a fallback if specific incorrect options are too few.
    if (chosenIncorrect.length < 3 && allPossibleEnglishAnswers.length > 0) {
        let genericIncorrectCandidates = allPossibleEnglishAnswers.filter(
            word => word !== correctAnswer && !chosenIncorrect.includes(word)
        );
        genericIncorrectCandidates = shuffleArray(genericIncorrectCandidates);

        for (let i = 0; i < genericIncorrectCandidates.length && chosenIncorrect.length < 3; i++) {
            chosenIncorrect.push(genericIncorrectCandidates[i]);
        }
    }

    // If still not enough, add generic placeholders as a last resort
    while (chosenIncorrect.length < 3) {
      chosenIncorrect.push(`[Meaning ${chosenIncorrect.length + 1}]`);
    }
  }
  
  const options = shuffleArray([correctAnswer, ...chosenIncorrect]);
  return options;
};


// --- React Component ---
function QuizPage() {
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizType, setQuizType] = useState('sentence'); // 'sentence', 'word', 'kannadaQuestion', 'minimalLearning'
  const [numQuestions, setNumQuestions] = useState(50); // Default to 50 questions
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [quizFinished, setQuizFinished] = useState(false);
  const [studentName, setStudentName] = useState('');
  const [isHtml2CanvasLoaded, setIsHtml2CanvasLoaded] = useState(false);
  const [quizStartTime, setQuizStartTime] = useState(null);
  const [quizDuration, setQuizDuration] = useState('');

  // Word Quiz specific states
  const [unlockedWordBatches, setUnlockedWordBatches] = useState([0]); // Initially only the first batch is unlocked
  const [selectedWordBatchForStart, setSelectedWordBatchForStart] = useState(0); // Track selected batch for start button

  // Use a separate state to store the actual questions for the current quiz session.
  const [sessionQuestions, setSessionQuestions] = useState([]);

  // Determine the current question based on quiz type and index
  const currentQuestion = sessionQuestions[currentQuestionIndex];

  // Audio Context for sound effects
  const audioContext = useMemo(() => {
    return new (window.AudioContext || window.webkitAudioContext)();
  }, []);

  const gainNode = useMemo(() => {
    const node = audioContext.createGain();
    node.connect(audioContext.destination);
    node.gain.value = 0.1; // Low volume for effects
    return node;
  }, [audioContext]);


  useEffect(() => {
    // Load html2canvas
    loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js')
      .then(() => {
        setIsHtml2CanvasLoaded(true);
        console.log("html2canvas loaded successfully.");
      })
      .catch(error => console.error("Failed to load html2canvas:", error));

    return () => {
      // Cleanup AudioContext on unmount if it was created
      if (audioContext && audioContext.state !== 'closed') {
        audioContext.close();
      }
    };
  }, [audioContext]);


  const playTone = (frequency, duration, type = 'sine') => {
    if (audioContext.state === 'suspended') {
      audioContext.resume().catch(e => console.error("Error resuming AudioContext before tone:", e));
    }
    if (!audioContext) {
      console.warn("AudioContext not initialized.");
      return;
    }
    const oscillator = audioContext.createOscillator();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    oscillator.connect(gainNode);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + duration);
  };

  const playCorrectSound = () => {
    playTone(880, 0.1); // A high note
    setTimeout(() => playTone(1320, 0.1), 100); // A higher note after a short delay
  };

  const playIncorrectSound = () => {
    playTone(220, 0.2, 'sawtooth'); // A low, slightly jarring note
  };

  const playButtonClick = () => {
    if (audioContext.state === 'suspended') {
      audioContext.resume().catch(e => console.error("Error resuming AudioContext on button click:", e));
    }
    playTone(1000, 0.05, 'triangle'); // A very short, subtle click
  };


  // When the quiz starts or batch changes, populate sessionQuestions
  useEffect(() => {
    if (quizStarted && !quizFinished) {
      let questionsSource = [];
      
      if (quizType === 'sentence') {
        questionsSource = allSentences;
      } else if (quizType === 'word') {
        // Use selectedWordBatchForStart for fetching questions when starting the quiz
        questionsSource = wordBatches[selectedWordBatchForStart] || [];
      } else if (quizType === 'kannadaQuestion') {
        questionsSource = kannadaQuestionsData;
      } else if (quizType === 'minimalLearning') {
        questionsSource = minimalLearningSentences;
      }

      // Ensure numQuestions does not exceed available questions
      const actualNumQuestions = Math.min(numQuestions, questionsSource.length);

      setSessionQuestions(getRandomQuestions(questionsSource, actualNumQuestions));
      setCurrentQuestionIndex(0); // Reset question index for new quiz/batch
      setScore(0); // Reset score for new quiz/batch
      setSelectedOption(null); // Reset selected option
    }
  }, [quizStarted, quizFinished, quizType, numQuestions, selectedWordBatchForStart]);

  // Memoize options for the current question
  const options = useMemo(() => {
    if (currentQuestion) {
      if (quizType === 'sentence' || quizType === 'minimalLearning') {
        // Pass quizType, correctAnswer (Kannada), and relevant incorrect options array
        return generateOptions(quizType, currentQuestion.kannada, currentQuestion.incorrectOptions);
      } else { // quizType === 'word' || quizType === 'kannadaQuestion'
        // Pass quizType, correctAnswer (English), AND currentQuestion.incorrectOptions (now present in wordBatches)
        // Note: The previous logic for allPossibleEnglishAnswersPool is removed from here
        // as incorrectOptions are now directly in the wordBatches data structure.
        return generateOptions(quizType, currentQuestion.english, currentQuestion.incorrectOptions);
      }
    }
    return [];
  }, [currentQuestion, quizType]);


  // Web Speech API setup
  const synth = window.speechSynthesis;
  const [kannadaVoice, setKannadaVoice] = useState(null);

  useEffect(() => {
    if (!synth) {
      console.warn("Web Speech API not supported in this browser.");
      return;
    }

    const loadVoices = () => {
      const voices = synth.getVoices();
      const foundVoice = voices.find(voice => voice.lang === 'kn-IN' || voice.name.toLowerCase().includes('kannada'));
      if (foundVoice) {
        setKannadaVoice(foundVoice);
        console.log("Kannada voice loaded:", foundVoice.name, "Lang:", foundVoice.lang);
      } else {
        console.warn("Kannada voice not found. Using default voice if available.");
        console.log("Available voices:", voices.map(v => ({ name: v.name, lang: v.lang })));
      }
    };

    if (synth.getVoices().length > 0) {
      loadVoices();
    } else {
      synth.onvoiceschanged = loadVoices;
    }

    return () => {
      if (synth.onvoiceschanged) {
        synth.onvoiceschanged = null;
      }
    };
  }, [synth]);

  const speakKannada = (text) => {
    if (!synth) {
      console.warn("Web Speech API not supported in this browser.");
      alert("Text-to-speech is not supported in your browser. Please check browser settings or use a different browser.");
      return;
    }
    if (synth.speaking) {
      synth.cancel();
    }
    const utterance = new SpeechSynthesisUtterance(text);

    if (kannadaVoice) {
      utterance.voice = kannadaVoice;
      utterance.lang = kannadaVoice.lang;
    } else {
      utterance.lang = 'kn-IN';
    }

    try {
      if (audioContext.state === 'suspended') {
        audioContext.resume().catch(e => console.error("Error resuming AudioContext before speech:", e));
      }
      synth.speak(utterance);
      console.log("Attempting to speak:", text);
    } catch (error) {
      console.error("Error speaking:", error);
      alert("Could not play audio. Check browser console for details.");
    }
  };

  const handleStartQuiz = () => {
    playButtonClick();
    if (studentName.trim() === '') {
      alert("Please enter your name before starting the quiz.");
      return;
    }

    let maxQuestionsForSelectedType;
    if (quizType === 'sentence') {
      maxQuestionsForSelectedType = allSentences.length;
    } else if (quizType === 'word') {
      maxQuestionsForSelectedType = wordBatches[selectedWordBatchForStart].length;
    } else if (quizType === 'kannadaQuestion') {
      maxQuestionsForSelectedType = kannadaQuestionsData.length;
    } else if (quizType === 'minimalLearning') {
      maxQuestionsForSelectedType = minimalLearningSentences.length;
    }

    // Ensure requested numQuestions does not exceed available for the chosen type
    const finalNumQuestions = Math.min(numQuestions, maxQuestionsForSelectedType);

    if (finalNumQuestions > 0) {
      setNumQuestions(finalNumQuestions); // Update numQuestions state with the final capped value
      setQuizStarted(true);
      setQuizFinished(false);
      setQuizStartTime(Date.now());
      // sessionQuestions will be set by the useEffect now
    } else {
      alert(`Please enter a number between 1 and ${maxQuestionsForSelectedType} for the number of questions.`);
    }
  };

  const handleOptionSelect = (option) => {
    if (audioContext.state === 'suspended') {
      audioContext.resume().catch(e => console.error("Error resuming AudioContext on option select:", e));
    }
    if (selectedOption === null) {
      setSelectedOption(option);

      let isCorrect;
      if (quizType === 'sentence' || quizType === 'minimalLearning') {
        isCorrect = (option === currentQuestion.kannada);
      } else if (quizType === 'word' || quizType === 'kannadaQuestion') {
        isCorrect = (option === currentQuestion.english);
      }

      if (isCorrect) {
        setScore(prevScore => prevScore + 1);
        playCorrectSound();
      } else {
        playIncorrectSound();
      }
    }
  };

  const handleNextQuestion = () => {
    playButtonClick();
    if (selectedOption !== null) {
      if (synth && synth.speaking) {
        synth.cancel();
      }

      const nextIndex = currentQuestionIndex + 1;
      if (nextIndex < sessionQuestions.length) {
        setCurrentQuestionIndex(nextIndex);
        setSelectedOption(null);
      } else {
        // Quiz batch finished logic
        if (quizType === 'word') {
          const totalQuestionsInBatch = wordBatches[selectedWordBatchForStart].length;
          const percentage = (score / totalQuestionsInBatch) * 100;

          // Condition to unlock next batch:
          // 1. User must have attempted ALL questions in the *actual batch* (not just the sessionQuestions subset if it was restricted)
          // 2. User must score 80% or higher on the entire batch.
          if (sessionQuestions.length === totalQuestionsInBatch && percentage >= 80) {
            if (selectedWordBatchForStart < wordBatches.length - 1) {
              // Unlock next batch and proceed
              setUnlockedWordBatches(prev => {
                if (!prev.includes(selectedWordBatchForStart + 1)) {
                  return [...prev, selectedWordBatchForStart + 1];
                }
                return prev;
              });
              alert(`Congratulations! You scored ${percentage.toFixed(0)}% on Batch ${selectedWordBatchForStart + 1}. The next batch is now unlocked!`);
              setSelectedWordBatchForStart(prevIndex => prevIndex + 1); // Move to next batch to be loaded
              setQuizStarted(false); // Go back to start screen to show results and new batch selection
              setQuizFinished(true); // Show results for current batch
            } else {
              setQuizFinished(true); // All batches completed
              alert(`Congratulations! You scored ${percentage.toFixed(0)}%. You have completed all available word batches!`);
            }
          } else {
            let message = `You scored ${percentage.toFixed(0)}% on Batch ${selectedWordBatchForStart + 1}.`;
            if (sessionQuestions.length < totalQuestionsInBatch) {
                message += ` To unlock the next batch, you must complete all ${totalQuestionsInBatch} questions in this batch.`;
            }
            if (percentage < 80) {
                message += ` You need at least 80% to unlock the next batch. Please repeat this batch to improve.`;
            }
            alert(message);
            setQuizStarted(false); // Go back to start screen to allow repeating the batch
            setQuizFinished(true); // Show results for current batch
          }
        } else { // Sentence, Kannada Question, Minimal Learning quizzes finished
          setQuizFinished(true);
        }

        // Calculate duration when quiz finishes
        if (quizStartTime) {
          const endTime = Date.now();
          const durationInSeconds = Math.floor((endTime - quizStartTime) / 1000);
          const minutes = Math.floor(durationInSeconds / 60);
          const seconds = durationInSeconds % 60;
          setQuizDuration(`${minutes}m ${seconds}s`);
        }
      }
    } else {
      alert("Please select an answer before proceeding.");
    }
  };

  const handleListenToLearn = () => {
    playButtonClick();
    if (currentQuestion && currentQuestion.kannada) {
      speakKannada(currentQuestion.kannada);
    }
  };

  const resetQuiz = () => {
    playButtonClick();
    if (synth && synth.speaking) {
      synth.cancel();
    }
    setQuizStarted(false);
    // studentName is retained, no change here
    setNumQuestions(50); // Reset to default
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedOption(null);
    setQuizFinished(false);
    setSessionQuestions([]);
    setQuizStartTime(null);
    setQuizDuration('');
    setUnlockedWordBatches([0]); // Only first batch unlocked on full reset
    setSelectedWordBatchForStart(0); // Reset selected batch for starting
    setQuizType('sentence'); // Reset to default quiz type
  };

  const handleDownloadResults = async () => {
    if (!isHtml2CanvasLoaded) {
      alert("Image capture library is still loading. Please wait a moment.");
      return;
    }

    const resultsElement = document.querySelector('.quiz-results');
    if (resultsElement) {
      try {
        const canvas = await window.html2canvas(resultsElement, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#f0f4f8'
        });
        const image = canvas.toDataURL('image/jpeg', 0.9);

        const link = document.createElement('a');
        link.href = image;
        link.download = `KannadaQuiz_Result_${studentName || 'Guest'}_${new Date().toLocaleDateString()}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

      } catch (error) {
        console.error("Error capturing quiz results:", error);
        alert("Failed to download results image. Please try again.");
      }
    }
  };


  const getOptionClassName = (option) => {
    if (selectedOption === null) {
      return "option-button";
    }
    
    let isCorrectOption;
    if (quizType === 'sentence' || quizType === 'minimalLearning') {
      isCorrectOption = (option === currentQuestion.kannada);
    } else { // quizType === 'word' || quizType === 'kannadaQuestion'
      isCorrectOption = (option === currentQuestion.english);
    }

    if (isCorrectOption) {
      return "option-button correct";
    }
    if (option === selectedOption && !isCorrectOption) {
      return "option-button incorrect";
    }
    return "option-button";
  };

  const currentDateTime = new Date().toLocaleString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  });

  const handleBatchSelect = (index) => {
    playButtonClick();
    if (unlockedWordBatches.includes(index)) {
      setSelectedWordBatchForStart(index); // Only set the selected batch, don't start quiz immediately
      setNumQuestions(wordBatches[index].length); // Set numQuestions to batch size
    } else {
      alert("This batch is locked. Please complete the previous batches with at least 80% score to unlock it.");
    }
  };

  // Handler for quiz type dropdown change
  const handleQuizTypeChange = (e) => {
    const newQuizType = e.target.value;
    playButtonClick();
    setQuizType(newQuizType);
    setSelectedWordBatchForStart(0); // Reset selected batch when quiz type changes

    // Set numQuestions to a sensible default for the new quiz type
    // This allows the user to then adjust it if they wish, up to max available.
    if (newQuizType === 'sentence') {
      setNumQuestions(Math.min(50, allSentences.length));
    } else if (newQuizType === 'word') {
      setNumQuestions(Math.min(50, wordBatches[0].length)); // Default to first batch, capped at its size
    } else if (newQuizType === 'kannadaQuestion') {
      setNumQuestions(Math.min(50, kannadaQuestionsData.length));
    } else if (newQuizType === 'minimalLearning') {
      setNumQuestions(Math.min(50, minimalLearningSentences.length));
    }
  };

  // Determine the max questions allowed for the current quiz type
  const maxQuestionsForCurrentType = useMemo(() => {
    if (quizType === 'sentence') {
      return allSentences.length;
    } else if (quizType === 'word') {
      return wordBatches[selectedWordBatchForStart].length;
    } else if (quizType === 'kannadaQuestion') {
      return kannadaQuestionsData.length;
    } else if (quizType === 'minimalLearning') {
      return minimalLearningSentences.length;
    }
    return 0; // Should not happen
  }, [quizType, selectedWordBatchForStart]);


  return (
    <div className="quiz-container">
      <div className="small-heading-banner">
        <h2>ಕನ್ನಡ ಕಲಿಕೆ ಕೆನಡಾ</h2>
      </div>

      <h1> ಮನೆಯ ಮಾತು ಕಲಿ (Daily Kannada Quiz)</h1>

      {!quizStarted && (
        <div className="quiz-settings">
          <p>Ready to test your Kannada skills?</p>
          <div className="input-group">
            <label htmlFor="studentNameInput" className="input-label">Your Name:</label>
            <input
              id="studentNameInput"
              type="text"
              placeholder="Enter your name"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              className="student-name-input"
            />
          </div>

          <div className="quiz-type-dropdown-container"> {/* Container for dropdown */}
            <label htmlFor="quizTypeSelect" className="input-label">Select Quiz Type:</label>
            <select
              id="quizTypeSelect"
              value={quizType}
              onChange={handleQuizTypeChange}
              className="quiz-type-select"
            >
              <option value="sentence">ವಾಕ್ಯ ರಸಪ್ರಶ್ನೆ (Sentence Quiz)</option>
              <option value="word">ಪದ ರಸಪ್ರಶ್ನೆ (Word Quiz)</option>
              <option value="kannadaQuestion">ಕನ್ನಡ ಪ್ರಶ್ನೆ (Kannada Question Quiz)</option>
              <option value="minimalLearning">ಕನ್ನಡ ಪಾಠ (Kannada Lesson Quiz)</option>
            </select>
          </div>

          {/* This section for number of questions is now always visible */}
          <p>Choose how many questions you want to practice:</p>
          <div className="input-group">
            <input
              type="number"
              min="1"
              max={maxQuestionsForCurrentType} /* Dynamically set max based on quiz type */
              value={numQuestions}
              onChange={(e) => setNumQuestions(Math.max(1, Math.min(Number(e.target.value), maxQuestionsForCurrentType)))}
              className="num-questions-input"
            />
            <span className="available-sentences">(Available: {maxQuestionsForCurrentType} questions)</span>
          </div>

          {quizType === 'word' && (
            <>
              <p>Select a word batch (each batch has 50 words):</p>
              <div className="batch-selection-container">
                {wordBatches.map((batch, index) => (
                  <button
                    key={index}
                    className={`batch-button ${unlockedWordBatches.includes(index) ? 'unlocked' : 'locked'} ${selectedWordBatchForStart === index ? 'selected-batch' : ''}`}
                    onClick={() => handleBatchSelect(index)}
                    disabled={!unlockedWordBatches.includes(index)}
                  >
                    Batch {index + 1} {unlockedWordBatches.includes(index) ? '' : '�'}
                  </button>
                ))}
              </div>
              <p className="batch-info">Total words available across all batches: {wordBatches.flat().length}</p>
              <button onClick={handleStartQuiz} className="start-button" disabled={!unlockedWordBatches.includes(selectedWordBatchForStart)}>
                Start Word Quiz (Batch {selectedWordBatchForStart + 1})
              </button>
            </>
          )}

          {/* The start button for other quiz types (Sentence, Kannada Question, Minimal Learning) */}
          {(quizType !== 'word') && (
            <button onClick={handleStartQuiz} className="start-button">
              Start {
                quizType === 'sentence' ? "Sentence Quiz" :
                quizType === 'kannadaQuestion' ? "Kannada Question Quiz" :
                "Kannada Lesson Quiz"
              }
            </button>
          )}
        </div>
      )}

      {quizStarted && !quizFinished && currentQuestion && (
        <div className="quiz-content">
          <p className="question-counter">Question {currentQuestionIndex + 1} / {sessionQuestions.length}
            {quizType === 'word' && ` (Batch ${selectedWordBatchForStart + 1})`}
          </p>
          <div className="question-box">
            {quizType === 'sentence' || quizType === 'minimalLearning' ? (
              <p className="english-sentence">{currentQuestion.english}</p>
            ) : ( // This handles 'word' and 'kannadaQuestion'
              <>
                <p className="kannada-word-question">{currentQuestion.kannada} ({currentQuestion.romanKannada})</p>
              </>
            )}
          </div>

          <div className="options-grid">
            {options.map((option, index) => (
              <button
                key={index}
                className={getOptionClassName(option)}
                onClick={() => handleOptionSelect(option)}
                disabled={selectedOption !== null}
              >
                {option}
              </button>
            ))}
          </div>

          {selectedOption !== null && (
            <div className="feedback-area">
              {quizType === 'sentence' || quizType === 'minimalLearning' ? (
                currentQuestion.romanKannada && (
                  <p className="roman-kannada-feedback">
                    {currentQuestion.romanKannada}
                  </p>
                )
              ) : ( // This handles 'word' and 'kannadaQuestion'
                currentQuestion.english && (
                  <p className="roman-kannada-feedback">
                    Correct: {currentQuestion.english}
                  </p>
                )
              )}
              <button
                onClick={handleListenToLearn}
                className="listen-button"
              >
                Listen to Learn
              </button>
              <button onClick={handleNextQuestion} className="next-button">
                {currentQuestionIndex === sessionQuestions.length - 1 ?
                  (quizType === 'word' ? "Complete Batch" : "Finish Quiz")
                  : "Next Question"}
              </button>
            </div>
          )}
        </div>
      )}

      {quizFinished && (
        <>
          <div className="quiz-results">
            <div className="small-heading-banner">
              <h2>ಕನ್ನಡ ಕಲಿಕೆ ಕೆನಡಾ</h2>
            </div>
            <h2>Kannada {quizType} Quiz Finished!</h2>
            {studentName && <p className="student-name-result">Student: {studentName}</p>}
            <p className="final-score">
              Your Score: {score} / {sessionQuestions.length} ({sessionQuestions.length > 0 ? ((score / sessionQuestions.length) * 100).toFixed(0) : 0}%)
            </p>
            {quizDuration && (
              <p className="quiz-duration">Time taken: {quizDuration}</p>
            )}
            <p className="current-date-time">Completed on: {currentDateTime}</p>
            <div className="author-info">
              <br/> Kannada Kalike Canada - Kannada Sangha Toronto.
            </div>
          </div>
          <div className="results-buttons-container">
            <button
              onClick={handleDownloadResults}
              className="download-results-button"
              disabled={!isHtml2CanvasLoaded}
            >
              {isHtml2CanvasLoaded ? "Download Results" : "Loading Downloader..."}
            </button>
            <button onClick={resetQuiz} className="reset-button">Start New Quiz</button>
          </div>
          <p className="tts-help-info">
            *If "Listen to Learn" doesn't work, ensure your browser's text-to-speech is enabled and a Kannada voice is installed (check browser/OS settings).<br/>
            For Word Quiz: ensure the selected batch is green (unlocked) to play. Score 80% to unlock next batch.<br/>
            For all quizzes, you can now choose the number of questions.
          </p>
          <div className="author-info">
            Author: Ragu Kattinakere <br/>
          </div>
        </>
      )}
    </div>
  );
}

export default QuizPage;