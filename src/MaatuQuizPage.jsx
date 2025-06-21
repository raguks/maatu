import React, { useState, useEffect, useMemo, useRef } from 'react';
import './MaatuQuizPage.css'; // Keep the existing CSS
import { allSentences, wordBatches, kannadaQuestionsData, minimalLearningSentences, allPossibleEnglishAnswers } from './QuizData.js';
// Import the new AksharaData
import { varnamale, kaagunita, ottakshara, allPossibleLetterTransliterations, ottaksharaWordsData } from './AksharaData.js';


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

// Fisher-Yates shuffle algorithm: Creates a new shuffled array without modifying the original.
const shuffleArray = (array) => {
  const newArray = [...array]; // Create a shallow copy to avoid modifying original
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

// Function to get a random subset of questions from a given data array.
const getRandomQuestions = (data, count) => {
  const shuffled = shuffleArray(data); // Use the helper shuffle function
  return shuffled.slice(0, count);
};

// Function to generate options for a question, now more flexible for new quiz types.
// It ensures there are always 4 options (1 correct, up to 3 incorrect).
const generateOptions = (quizType, currentQuestion, allPossibleEnglishAnswersPool = [], allPossibleLetterTransliterationsPool = []) => {
  let correctAnswer;
  // Ensure incorrectOptionsProvided is an array, even if currentQuestion.incorrectOptions is undefined or null
  let incorrectOptionsProvided = currentQuestion.incorrectOptions || [];

  // Determine the correct answer based on the quiz type.
  if (quizType === 'sentence' || quizType === 'minimalLearning') {
    // For English prompt -> Kannada options: Correct answer is the Kannada text.
    correctAnswer = currentQuestion.kannada;
  } else if (quizType === 'word' || quizType === 'kannadaQuestion' || quizType === 'ottaksharaWords') {
    // For Kannada prompt -> English options: Correct answer is the English text.
    correctAnswer = currentQuestion.english;
  } else if (quizType === 'letterIdentification') {
    // For Kannada letter -> English transliteration options: Correct answer is the Roman Kannada.
    correctAnswer = currentQuestion.romanKannada; // Correct answer is transliteration
  } else {
    // Log an error if an unhandled quiz type is encountered.
    console.error("Unknown quiz type in generateOptions:", quizType);
    return []; // Return an empty array to prevent further errors.
  }

  // Filter out any incorrect options that are identical to the correct answer.
  const uniqueIncorrectOptions = incorrectOptionsProvided.filter(
    option => option !== correctAnswer
  );

  let chosenIncorrect = [];
  if (uniqueIncorrectOptions.length >= 3) {
    // If there are 3 or more unique incorrect options, select 3 randomly.
    chosenIncorrect = shuffleArray(uniqueIncorrectOptions).slice(0, 3);
  } else {
    // If fewer than 3 unique incorrect options are provided, use all available and try to fill from general pools.
    chosenIncorrect = [...uniqueIncorrectOptions]; // Copy to be safe

    let genericCandidates = [];
    if (quizType === 'letterIdentification') {
      // For letter identification, use the general transliteration pool for distractor options.
      genericCandidates = allPossibleLetterTransliterationsPool.filter(
        translit => translit !== correctAnswer && !chosenIncorrect.includes(translit)
      );
    } else if (quizType === 'word' || quizType === 'kannadaQuestion' || quizType === 'ottaksharaWords') {
      // For English options (word/Kannada question), use the general English words pool.
      genericCandidates = allPossibleEnglishAnswersPool.filter(
        word => word !== correctAnswer && !chosenIncorrect.includes(word)
      );
    }
    // For sentence/minimalLearning types, if `incorrectOptionsProvided` is insufficient,
    // and there's no generic Kannada pool, placeholders will be used as a last resort.

    // Add unique generic candidates until we have 3 incorrect options.
    const shuffledGenericCandidates = shuffleArray(genericCandidates);
    for (let i = 0; i < shuffledGenericCandidates.length && chosenIncorrect.length < 3; i++) {
        if (!chosenIncorrect.includes(shuffledGenericCandidates[i])) { // Ensure only unique candidates are added
            chosenIncorrect.push(shuffledGenericCandidates[i]);
        }
    }

    // If still not enough (less than 3 incorrect options), add generic placeholders.
    while (chosenIncorrect.length < 3) {
      if (quizType === 'sentence' || quizType === 'minimalLearning') {
        chosenIncorrect.push(`[ಆಯ್ಕೆ ${chosenIncorrect.length + 1}]`); // Placeholder in Kannada for Kannada options
      } else { // word, kannadaQuestion, ottaksharaWords, letterIdentification (English/Roman Kannada options)
        chosenIncorrect.push(`[Option ${chosenIncorrect.length + 1}]`); // Placeholder in English
      }
    }
  }

  // Combine the correct answer with the chosen incorrect options and shuffle them.
  const options = shuffleArray([correctAnswer, ...chosenIncorrect]);
  return options;
};


// --- React Component ---
function QuizPage() {
  // State to manage the active main tab: 'mainQuiz' or 'letterGame'.
  const [mainActiveTab, setMainActiveTab] = useState('mainQuiz'); 

  // State to track if a quiz session has started.
  const [quizStarted, setQuizStarted] = useState(false);
  // State to determine the type of quiz within the 'mainQuiz' tab.
  const [quizType, setQuizType] = useState('sentence');
  // State for the subtype within the 'letterGame' tab (varnamale, kaagunita, ottakshara).
  const [letterSubtype, setLetterSubtype] = useState('varnamale'); 

  // Number of questions for the current quiz session.
  const [numQuestions, setNumQuestions] = useState(50); // Default to 50 questions
  // Index of the current question being displayed.
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  // Current score of the user.
  const [score, setScore] = useState(0);
  // The option selected by the user for the current question.
  const [selectedOption, setSelectedOption] = useState(null);
  // Controls the visibility of the feedback area and its buttons
  const [showFeedback, setShowFeedback] = useState(false);
  // State to indicate if the quiz has finished.
  const [quizFinished, setQuizFinished] = useState(false);
  // Name entered by the student.
  const [studentName, setStudentName] = useState('');
  // Flag to track if html2canvas library has loaded.
  const [isHtml2CanvasLoaded, setIsHtml2CanvasLoaded] = useState(false);
  // Timestamp when the quiz started, used for duration calculation.
  const [quizStartTime, setQuizStartTime] = useState(null);
  // Formatted string representing the duration of the quiz.
  const [quizDuration, setQuizDuration] = useState(''); 

  // Word Quiz specific states:
  // Array of unlocked word batch indices (e.g., [0, 1] means batch 1 and 2 are unlocked).
  const [unlockedWordBatches, setUnlockedWordBatches] = useState([0]); 
  // The currently selected word batch before starting a quiz.
  const [selectedWordBatchForStart, setSelectedWordBatchForStart] = useState(0); 

  // The actual list of questions for the current quiz session.
  const [sessionQuestions, setSessionQuestions] = useState([]);

  // Letter Identification specific states:
  // Object to track how many times each Kannada letter has been incorrectly identified.
  const [letterErrorCounts, setLetterErrorCounts] = useState({}); 
  // Set of Kannada letters that the user has correctly identified on the first attempt.
  const [masteredLetters, setMasteredLetters] = useState(new Set());


  // Determine the current question object based on the current index in `sessionQuestions`.
  const currentQuestion = sessionQuestions[currentQuestionIndex];

  // Memoized AudioContext for generating sound effects, ensuring it's only created once.
  const audioContext = useMemo(() => {
    if (typeof window !== 'undefined') { // Ensure AudioContext is created only in browser environment.
      return new (window.AudioContext || window.webkitAudioContext)();
    }
    return null; // Return null if not in a browser environment.
  }, []);

  // Memoized GainNode for controlling the volume of sound effects.
  const gainNode = useMemo(() => {
    if (audioContext) {
      const node = audioContext.createGain();
      node.connect(audioContext.destination);
      node.gain.value = 0.1; // Set a low volume for subtle effects.
      return node;
    }
    return null;
  }, [audioContext]);


  // Effect hook to dynamically load the html2canvas library.
  useEffect(() => {
    loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js')
      .then(() => {
        setIsHtml2CanvasLoaded(true);
        console.log("html2canvas loaded successfully.");
      })
      .catch(error => console.error("Failed to load html2canvas:", error));

    // Cleanup function to close the AudioContext when the component unmounts.
    return () => {
      if (audioContext && audioContext.state !== 'closed') {
        audioContext.close().catch(e => console.error("Error closing AudioContext:", e));
      }
    };
  }, [audioContext]);


  // Helper function to play a tone using the Web Audio API.
  const playTone = (frequency, duration, type = 'sine') => {
    if (!audioContext || audioContext.state === 'closed') {
      console.warn("AudioContext is not active or closed. Cannot play tone.");
      return;
    }
    if (audioContext.state === 'suspended') {
      // Attempt to resume AudioContext if it's suspended (e.g., after user interaction).
      audioContext.resume().catch(e => console.error("Error resuming AudioContext before tone:", e));
    }
    const oscillator = audioContext.createOscillator();
    oscillator.type = type; // Type of waveform (sine, square, sawtooth, triangle).
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    oscillator.connect(gainNode); // Connect to the gain node for volume control.
    oscillator.start();
    oscillator.stop(audioContext.currentTime + duration); // Stop the sound after a specified duration.
  };

  // Plays a sound indicating a correct answer.
  const playCorrectSound = () => {
    playTone(880, 0.1); // A high note.
    setTimeout(() => playTone(1320, 0.1), 100); // A higher note after a short delay for a 'chime' effect.
  };

  // Plays a sound indicating an incorrect answer.
  const playIncorrectSound = () => {
    playTone(220, 0.2, 'sawtooth'); // A low, slightly jarring note.
  };

  // Plays a subtle click sound for button interactions.
  const playButtonClick = () => {
    if (audioContext && audioContext.state === 'suspended') {
      audioContext.resume().catch(e => console.error("Error resuming AudioContext on button click:", e));
    }
    playTone(1000, 0.05, 'triangle'); // A very short, subtle click.
  };

  // Helper function to generate questions specifically for the Letter Identification game.
  // It prioritizes letters that haven't been mastered or were frequently missed.
  const generateLetterIdentificationQuestions = (sourceData, errorCounts, masteredSet, count) => {
    let questions = [];
    // Extract all Kannada characters from the source data.
    // const allLetters = sourceData.map(item => item.kannada); // This line is not directly used in the logic below, can be removed if not needed elsewhere.

    // 1. Prioritize letters not yet seen/mastered in this session.
    let unmastered = sourceData.filter(item => !masteredSet.has(item.kannada));
    unmastered = shuffleArray(unmastered); // Shuffle to randomize the order of unmastered letters.

    // 2. Prioritize letters that were frequently missed based on `errorCounts`.
    let missedLetters = Object.entries(errorCounts)
      .filter(([, c]) => c > 0) // Consider only letters with at least one error.
      .sort((a, b) => b[1] - a[1]) // Sort by most errors first (descending order).
      .map(([kannadaChar]) => sourceData.find(item => item.kannada === kannadaChar)) // Get the full question object.
      .filter(item => item && !masteredSet.has(item.kannada) && !unmastered.some(q => q.kannada === item.kannada)); // Exclude if already mastered or already in the unmastered list.

    // Combine prioritized lists, ensuring uniqueness.
    let prioritizedQuestions = [...unmastered];
    missedLetters.forEach(item => {
        if (!prioritizedQuestions.some(q => q.kannada === item.kannada)) {
            prioritizedQuestions.push(item);
        }
    });

    questions = [...prioritizedQuestions]; // Start building the session questions with prioritized items.

    // 3. Fill the rest with random letters from the full source, avoiding duplicates if possible.
    let fillerQuestions = shuffleArray(sourceData).filter(item => !questions.some(q => q.kannada === item.kannada));

    // For a finite game, ensure we pick exactly `count` or up to the maximum available.
    while (questions.length < count && fillerQuestions.length > 0) {
        questions.push(fillerQuestions.shift()); // Take from filler and remove to avoid re-picking.
    }

    // If still not enough questions to meet `count`, randomly pick from the source data.
    while (questions.length < count) {
        questions.push(sourceData[Math.floor(Math.random() * sourceData.length)]);
    }

    // Final shuffle and cap to `count` before returning.
    return shuffleArray(questions.slice(0, count));
  };


  // Effect to reset selected option and feedback display when a new question is displayed.
  // This is crucial to prevent the feedback area and buttons from showing prematurely.
  useEffect(() => {
    // Only reset if a quiz is active and a question is available
    if (quizStarted && currentQuestion) {
      setSelectedOption(null);
      setShowFeedback(false); // Ensure feedback is hidden when a new question loads
    }
  }, [currentQuestionIndex, quizStarted, currentQuestion]);


  // Memoized `options` array for the current question, ensuring it only re-generates when necessary.
  const options = useMemo(() => {
    if (currentQuestion) {
      // Pass the current question object, and global pools as arguments to `generateOptions`.
      return generateOptions(mainActiveTab === 'letterGame' ? 'letterIdentification' : quizType, currentQuestion, allPossibleEnglishAnswers, allPossibleLetterTransliterations);
    }
    return []; // Return empty array if no current question.
  }, [currentQuestion, quizType, mainActiveTab]);


  // Initialize Web Speech API (SpeechSynthesis) for text-to-speech functionality.
  const synth = window.speechSynthesis;
  // State to store the detected Kannada voice.
  const [kannadaVoice, setKannadaVoice] = useState(null);

  // Effect hook to load and identify a Kannada voice for speech synthesis.
  useEffect(() => {
    if (!synth) {
      console.warn("Web Speech API not supported in this browser.");
      return;
    }

    const loadVoices = () => {
      const voices = synth.getVoices(); // Get all available voices.
      // Find a Kannada voice, prioritizing 'kn-IN' language code or 'kannada' in voice name.
      const foundVoice = voices.find(voice => voice.lang === 'kn-IN' || voice.name.toLowerCase().includes('kannada'));
      if (foundVoice) {
        setKannadaVoice(foundVoice);
        console.log("Kannada voice loaded:", foundVoice.name, "Lang:", foundVoice.lang);
      } else {
        console.warn("Kannada voice not found. Using default voice if available.");
        console.log("Available voices:", voices.map(v => ({ name: v.name, lang: v.lang })));
      }
    };

    // If voices are already loaded, call `loadVoices` immediately.
    if (synth.getVoices().length > 0) {
      loadVoices();
    } else {
      // Otherwise, set an event listener to call `loadVoices` when voices change (i.e., finish loading).
      synth.onvoiceschanged = loadVoices;
    }

    // Cleanup: remove the event listener when the component unmounts.
    return () => {
      if (synth.onvoiceschanged) {
        synth.onvoiceschanged = null;
      }
    };
  }, [synth]); // Dependency array includes `synth` to run when it's available.

  // Function to speak Kannada text using the Web Speech API.
  const speakKannada = (text) => {
    if (!synth) {
      console.warn("Web Speech API not supported in this browser.");
      alert("Text-to-speech is not supported in your browser. Please check browser settings or use a different browser.");
      return;
    }
    if (synth.speaking) {
      synth.cancel(); // Stop any ongoing speech before starting a new one.
    }
    const utterance = new SpeechSynthesisUtterance(text); // Create a new speech utterance.

    if (kannadaVoice) {
      utterance.voice = kannadaVoice; // Set the found Kannada voice.
      utterance.lang = kannadaVoice.lang; // Set the language matching the voice.
    } else {
      utterance.lang = 'kn-IN'; // Fallback to explicitly setting language if no specific voice is found.
    }

    try {
      if (audioContext && audioContext.state === 'suspended') {
        // Attempt to resume AudioContext if suspended, before speaking.
        audioContext.resume().catch(e => console.error("Error resuming AudioContext before speech:", e));
      }
      synth.speak(utterance); // Start speaking the utterance.
      console.log("Attempting to speak:", text);
    } catch (error) {
      console.error("Error speaking:", error);
      alert("Could not play audio. Check browser console for details.");
    }
  };

  // Handler for when the "Start Quiz" button is clicked.
  const handleStartQuiz = () => {
    playButtonClick(); // Play button click sound.
    if (studentName.trim() === '') {
      alert("Please enter your name before starting the quiz.");
      return; // Prevent quiz start if name is empty.
    }

    let questionsSource = [];
    let currentQuizMaxQuestions = 0;
    
    if (mainActiveTab === 'mainQuiz') {
      if (quizType === 'sentence') {
        questionsSource = allSentences;
      } else if (quizType === 'word') {
        questionsSource = wordBatches[selectedWordBatchForStart] || [];
      } else if (quizType === 'kannadaQuestion') {
        questionsSource = kannadaQuestionsData;
      } else if (quizType === 'minimalLearning') {
        questionsSource = minimalLearningSentences;
      } else if (quizType === 'ottaksharaWords') { // New Ottakshara Words quiz
        questionsSource = ottaksharaWordsData;
      }
      currentQuizMaxQuestions = questionsSource.length;
      setSessionQuestions(getRandomQuestions(questionsSource, Math.min(numQuestions, currentQuizMaxQuestions))); 
    } else if (mainActiveTab === 'letterGame') {
        if (letterSubtype === 'varnamale') {
          questionsSource = varnamale;
        } else if (letterSubtype === 'kaagunita') {
          questionsSource = kaagunita;
        } else if (letterSubtype === 'ottakshara') {
          questionsSource = ottakshara;
        }
        currentQuizMaxQuestions = questionsSource.length; // Max questions for letter game is the full set of the subtype
        
        // Reset error counts and mastered letters specifically for the letter game on start.
        setLetterErrorCounts({});
        setMasteredLetters(new Set());
        // Generate questions for the letter game, prioritizing missed/unmastered letters, only at start.
        setSessionQuestions(generateLetterIdentificationQuestions(questionsSource, {}, new Set(), currentQuizMaxQuestions)); // Pass empty counts/mastered for initial generation.
        // The numQuestions state for letter game is already set to currentQuizMaxQuestions by handleLetterSubtypeChange
    }

    // Ensure `numQuestions` (the user-requested count) does not exceed the `currentQuizMaxQuestions`.
    const finalNumQuestionsToSet = Math.min(numQuestions, currentQuizMaxQuestions);
    setNumQuestions(finalNumQuestionsToSet); // Update the state with the capped number of questions.

    if (finalNumQuestionsToSet > 0) {
      setQuizStarted(true); // Begin the quiz.
      setQuizFinished(false); // Ensure quiz finished state is reset.
      setQuizStartTime(Date.now()); // Record the start time.
    } else {
      alert(`No questions available for this selection.`); // Alert if no questions can be generated.
    }
    setCurrentQuestionIndex(0); // Reset question index.
    setScore(0); // Reset score.
    setSelectedOption(null); // Clear selected option.
    setShowFeedback(false); // Ensure feedback is hidden.
  };

  // Handler for when a user selects an option.
  const handleOptionSelect = (option) => {
    if (audioContext && audioContext.state === 'suspended') {
      audioContext.resume().catch(e => console.error("Error resuming AudioContext on option select:", e));
    }
    console.log("handleOptionSelect triggered.");
    console.log("Current selectedOption (before update):", selectedOption);
    console.log("Current Question in handleOptionSelect:", currentQuestion);

    // Only allow selection if an option hasn't been picked yet for the current question.
    if (selectedOption === null) { 
      setSelectedOption(option);

      let isCorrect;
      if (mainActiveTab === 'mainQuiz') {
        if (quizType === 'sentence' || quizType === 'minimalLearning') {
          isCorrect = (option === currentQuestion.kannada);
        } else if (quizType === 'word' || quizType === 'kannadaQuestion' || quizType === 'ottaksharaWords') {
          isCorrect = (option === currentQuestion.english);
        }
      } else if (mainActiveTab === 'letterGame') {
        // Correctness logic for letter game: compare selected option with currentQuestion.romanKannada
        isCorrect = (option === currentQuestion.romanKannada);

        // Add console log to debug score registration for letter game
        console.log(`Letter Game: Selected: "${option}", Correct Answer: "${currentQuestion?.romanKannada}", Is Correct: ${isCorrect}, Current Question: `, currentQuestion);

        // Update letter error counts and mastered letters for the letter identification quiz.
        // These updates are fine as they don't affect sessionQuestions re-generation anymore.
        if (isCorrect) {
          setMasteredLetters(prev => new Set(prev).add(currentQuestion.kannada)); // Add to mastered set if correct.
        } else {
          setLetterErrorCounts(prev => ({
            ...prev,
            [currentQuestion.kannada]: (prev[currentQuestion.kannada] || 0) + 1 // Increment error count for the letter.
          }));
        }
      }

      if (isCorrect) {
        setScore(prevScore => {
          console.log(`Score before: ${prevScore}, Score after: ${prevScore + 1}`);
          return prevScore + 1; // Increment score if the answer is correct.
        });
        playCorrectSound(); // Play correct answer sound.
      } else {
        playIncorrectSound(); // Play incorrect answer sound.
      }

      // Show feedback area after a short delay
      setTimeout(() => {
        setShowFeedback(true);
      }, 300); // 300ms delay to allow styling to apply before buttons appear
    }
  };

  // Handler for navigating to the next question or finishing the quiz.
  const handleNextQuestion = () => {
    playButtonClick(); // Play button click sound.
    console.log("handleNextQuestion triggered.");
    console.log("State before next question logic:", { selectedOption, showFeedback, currentQuestionIndex, sessionQuestionsLength: sessionQuestions.length });

    if (synth && synth.speaking) {
      synth.cancel(); // Stop any ongoing speech.
    }

    const nextIndex = currentQuestionIndex + 1;

    // Logic for progressing through questions or finishing the quiz.
    if (nextIndex < sessionQuestions.length) {
      setCurrentQuestionIndex(nextIndex); // Move to the next question.
      // selectedOption and showFeedback are reset by the useEffect on currentQuestionIndex change
    } else {
      // Quiz session has ended.
      if (quizType === 'word' && mainActiveTab === 'mainQuiz') { // Special logic for Word Quiz batches.
        const totalQuestionsInBatch = wordBatches[selectedWordBatchForStart].length;
        const percentage = (score / totalQuestionsInBatch) * 100;

        // Check conditions for unlocking the next batch: complete all questions in the batch AND score >= 80%.
        if (sessionQuestions.length === totalQuestionsInBatch && percentage >= 80) {
          if (selectedWordBatchForStart < wordBatches.length - 1) {
            // Unlock the next batch if available.
            setUnlockedWordBatches(prev => {
              if (!prev.includes(selectedWordBatchForStart + 1)) {
                return [...prev, selectedWordBatchForStart + 1];
              }
              return prev;
            });
            alert(`Congratulations! You scored ${percentage.toFixed(0)}% on Batch ${selectedWordBatchForStart + 1}. The next batch is now unlocked!`);
            setSelectedWordBatchForStart(prevIndex => prevIndex + 1); // Move to the newly unlocked batch's index.
            setQuizStarted(false); // Return to the start screen.
            setQuizFinished(true); // Mark quiz as finished to show results.
          } else {
            setQuizFinished(true); // All batches completed.
            alert(`Congratulations! You scored ${percentage.toFixed(0)}%. You have completed all available word batches!`);
          }
        } else {
          // If conditions not met, provide feedback and prompt to repeat.
          let message = `You scored ${percentage.toFixed(0)}% on Batch ${selectedWordBatchForStart + 1}.`;
          if (sessionQuestions.length < totalQuestionsInBatch) {
              message += ` To unlock the next batch, you must complete all ${totalQuestionsInBatch} questions in this batch.`;
          }
          if (percentage < 80) {
              message += ` You need at least 80% to unlock the next batch. Please repeat this batch to improve.`;
          }
          alert(message);
          setQuizStarted(false); // Return to the start screen.
          setQuizFinished(true); // Mark quiz as finished to show results.
        }
      } else { // For all other main quiz types and Letter Identification game, simply finish.
        setQuizFinished(true);
      }

      // Calculate and set the quiz duration when the quiz finishes.
      if (quizStartTime) {
        const endTime = Date.now();
        const durationInSeconds = Math.floor((endTime - quizStartTime) / 1000);
        const minutes = Math.floor(durationInSeconds / 60);
        const seconds = durationInSeconds % 60;
        setQuizDuration(`${minutes}m ${seconds}s`);
      }
    }
  };

  // Handler to stop the letter identification quiz prematurely.
  const handleStopLetterQuiz = () => {
    playButtonClick();
    if (synth && synth.speaking) {
      synth.cancel(); // Stop ongoing speech.
    }
    setQuizFinished(true); // Mark quiz as finished.
    // Calculate and set the quiz duration.
    if (quizStartTime) {
      const endTime = Date.now();
      const durationInSeconds = Math.floor((endTime - quizStartTime) / 1000);
      const minutes = Math.floor(durationInSeconds / 60);
      const seconds = durationInSeconds % 60;
      setQuizDuration(`${minutes}m ${seconds}s`);
    }
  };

  // Handler to speak the Kannada text of the current question.
  const handleListenToLearn = () => {
    playButtonClick();
    if (currentQuestion) {
      // If it's the letter game, speak the Kannada letter.
      if (mainActiveTab === 'letterGame') {
        speakKannada(currentQuestion.kannada);
      } else {
        // Otherwise, speak the Kannada part of the question for other quiz types.
        speakKannada(currentQuestion.kannada);
      }
    }
  };

  // Resets all quiz-related states to their initial values, effectively starting fresh.
  const resetQuiz = () => {
    playButtonClick();
    if (synth && synth.speaking) {
      synth.cancel(); // Stop ongoing speech.
    }
    setQuizStarted(false); // Quiz not started.
    setNumQuestions(50); // Reset to default number of questions.
    setCurrentQuestionIndex(0); // Reset question index.
    setScore(0); // Reset score.
    setSelectedOption(null); // Clear selected option.
    setShowFeedback(false); // Clear feedback display state
    setQuizFinished(false); // Quiz not finished.
    setSessionQuestions([]); // Clear session-specific questions.
    setQuizStartTime(null); // Clear start time.
    setQuizDuration(''); // Clear duration.
    setUnlockedWordBatches([0]); // Reset unlocked word batches (only first unlocked).
    setSelectedWordBatchForStart(0); // Reset selected word batch.
    setQuizType('sentence'); // Reset to default quiz type for main tab.
    setLetterSubtype('varnamale'); // Reset letter subtype for letter game tab.
    setLetterErrorCounts({}); // Clear letter error counts.
    setMasteredLetters(new Set()); // Clear mastered letters.
    setMainActiveTab('mainQuiz'); // Reset to default main tab.
  };

  // Handler to download the quiz results as an image.
  const handleDownloadResults = async () => {
    if (!isHtml2CanvasLoaded) {
      alert("Image capture library is still loading. Please wait a moment.");
      return;
    }

    const resultsElement = document.querySelector('.quiz-results'); // Select the results section.
    if (resultsElement) {
      try {
        // Use html2canvas to capture the content of the results element.
        const canvas = await window.html2canvas(resultsElement, {
          scale: 2, // Increase resolution for better quality.
          useCORS: true, // Allow cross-origin images (if any).
          backgroundColor: '#f0f4f8' // Set a consistent background color for the capture.
        });
        const image = canvas.toDataURL('image/jpeg', 0.9); // Convert canvas to JPEG data URL.

        const link = document.createElement('a'); // Create a temporary anchor element.
        link.href = image; // Set the image data as the link's target.
        link.download = `KannadaQuiz_Result_${studentName || 'Guest'}_${new Date().toLocaleDateString()}.jpg`; // Set download filename.
        document.body.appendChild(link); // Append link to body (required for Firefox).
        link.click(); // Programmatically click the link to trigger download.
        document.body.removeChild(link); // Remove the temporary link.

      } catch (error) {
        console.error("Error capturing quiz results:", error);
        alert("Failed to download results image. Please try again.");
      }
    }
  };


  // Determines the CSS class for an option button based on selection and correctness.
  const getOptionClassName = (option) => {
    if (selectedOption === null) {
      return "option-button"; // Default style if no option is selected yet.
    }
    
    let isCorrectOption;
    // Check if the current tab is 'mainQuiz' or 'letterGame' to determine correctness logic
    if (mainActiveTab === 'mainQuiz') {
      if (quizType === 'sentence' || quizType === 'minimalLearning') {
        isCorrectOption = (option === currentQuestion.kannada);
      } else if (quizType === 'word' || quizType === 'kannadaQuestion' || quizType === 'ottaksharaWords') {
        isCorrectOption = (option === currentQuestion.english);
      }
    } else if (mainActiveTab === 'letterGame') {
      // For letter game, the correct option is `currentQuestion.romanKannada`
      isCorrectOption = (option === currentQuestion.romanKannada);
    }

    if (isCorrectOption) {
      return "option-button correct"; // Apply 'correct' class if it's the right answer.
    }
    if (option === selectedOption && !isCorrectOption) {
      return "option-button incorrect"; // Apply 'incorrect' class if it's the selected wrong answer.
    }
    // If an option is selected but it's not the current 'option' and not the 'correct' option, it should remain default.
    return "option-button"; 
  };

  // Formats the current date and time for display.
  const currentDateTime = new Date().toLocaleString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  });

  // Handler for selecting a word batch.
  const handleBatchSelect = (index) => {
    playButtonClick();
    if (unlockedWordBatches.includes(index)) { // Only allow selection of unlocked batches.
      setSelectedWordBatchForStart(index); // Set the batch as selected for the next quiz start.
      setNumQuestions(wordBatches[index].length); // Automatically set `numQuestions` to the full size of the selected batch.
    } else {
      alert("This batch is locked. Please complete the previous batches with at least 80% score to unlock it.");
    }
  };

  // Handler for changing the main quiz type dropdown.
  const handleQuizTypeChange = (e) => {
    const newQuizType = e.target.value;
    playButtonClick();
    setQuizType(newQuizType); // Update the quiz type.
    setSelectedWordBatchForStart(0); // Reset word batch selection when main quiz type changes.
    
    // Set a sensible default for `numQuestions` based on the newly selected quiz type, capped by max available.
    if (newQuizType === 'sentence') {
      setNumQuestions(Math.min(50, allSentences.length));
    } else if (newQuizType === 'word') {
      setNumQuestions(Math.min(50, wordBatches[0].length)); // Default to the size of the first batch.
    } else if (newQuizType === 'kannadaQuestion') {
      setNumQuestions(Math.min(50, kannadaQuestionsData.length));
    } else if (newQuizType === 'minimalLearning') {
      setNumQuestions(Math.min(50, minimalLearningSentences.length));
    } else if (newQuizType === 'ottaksharaWords') {
      setNumQuestions(Math.min(50, ottaksharaWordsData.length));
    }
  };

  // Handler for changing the letter identification sub-tab.
  const handleLetterSubtypeChange = (newSubtype) => {
    playButtonClick();
    setLetterSubtype(newSubtype); // Update the letter subtype.
    // Reset error counts and mastered letters when changing letter subtypes.
    setLetterErrorCounts({});
    setMasteredLetters(new Set());
    // Adjust `numQuestions` based on the total number of letters in the newly selected subtype for finite play.
    let newNumQuestions = 50; // Default or fallback value.
    if (newSubtype === 'varnamale') {
      newNumQuestions = varnamale.length; // Set to the total number of alphabets.
    } else if (newSubtype === 'kaagunita') {
      newNumQuestions = kaagunita.length; // Set to the total number of vowel signs.
    } else if (newSubtype === 'ottakshara') {
      newNumQuestions = ottakshara.length; // Set to the total number of compound letters.
    }
    setNumQuestions(newNumQuestions); // Update `numQuestions` to reflect the full length of the selected subtype.
  };

  // Memoized value to determine the maximum number of questions allowed for the current quiz type/subtype.
  const maxQuestionsForCurrentType = useMemo(() => {
    if (mainActiveTab === 'mainQuiz') {
      if (quizType === 'sentence') {
        return allSentences.length;
      } else if (quizType === 'word') {
        return wordBatches[selectedWordBatchForStart]?.length || 0;
      } else if (quizType === 'kannadaQuestion') {
        return kannadaQuestionsData.length;
      } else if (quizType === 'minimalLearning') {
        return minimalLearningSentences.length;
      } else if (quizType === 'ottaksharaWords') {
        return ottaksharaWordsData.length;
      }
    } else if (mainActiveTab === 'letterGame') {
      if (letterSubtype === 'varnamale') return varnamale.length;
      if (letterSubtype === 'kaagunita') return kaagunita.length;
      if (letterSubtype === 'ottakshara') return ottakshara.length;
      return 0; // Should not happen if `letterSubtype` is always valid.
    }
    return 0; // Should not happen for main quiz types.
  }, [quizType, selectedWordBatchForStart, letterSubtype, mainActiveTab]);


  // Memoized text for the start button in the main quiz tab.
  const mainQuizStartButtonText = useMemo(() => {
    let text = "Start ";
    if (quizType === 'sentence') text += "Sentence Quiz";
    else if (quizType === 'word') text += `Word Quiz (Batch ${selectedWordBatchForStart + 1})`;
    else if (quizType === 'kannadaQuestion') text += "Kannada Question Quiz";
    else if (quizType === 'minimalLearning') text += "Kannada Lesson Quiz";
    else if (quizType === 'ottaksharaWords') text += "Ottakshara Words Quiz";
    else text += "Quiz"; // Fallback text.
    return text;
  }, [quizType, selectedWordBatchForStart]);

  // Memoized text for the start button in the letter identification game tab.
  const letterGameStartButtonText = useMemo(() => {
    let text = "Start ";
    if (letterSubtype === 'varnamale') text += 'Letter Game (Alphabets)';
    else if (letterSubtype === 'kaagunita') text += 'Letter Game (Vowel Signs)';
    else if (letterSubtype === 'ottakshara') text += 'Letter Game (Compound)';
    else text += "Letter Game"; // Fallback text.
    return text;
  }, [letterSubtype]);


  return (
    <div className="quiz-container">
      <div className="small-heading-banner">
        <h2>ಕನ್ನಡ ಕಲಿಕೆ ಕೆನಡಾ</h2>
      </div>

      <h1> ಮನೆಯ ಮಾತು ಕಲಿ (Daily Kannada Quiz)</h1>

      {/* Main Tabs for Quiz Sections - Allows switching between main quizzes and the letter game. */}
      <div className="main-tab-buttons">
        <button
          className={`main-tab-button ${mainActiveTab === 'mainQuiz' ? 'active' : ''}`}
          onClick={() => {
            if (!quizStarted) { // Prevent tab switching if a quiz is currently active.
              setMainActiveTab('mainQuiz');
              setQuizType('sentence'); // Reset to default quiz type for the main tab.
              setLetterSubtype('varnamale'); // Ensure letter subtype is reset.
              setNumQuestions(Math.min(50, allSentences.length)); // Reset num questions for main quiz.
            }
          }}
          disabled={quizStarted}
          /* Disable tab button when quiz is active */
        >
          ಮನೆಯ ಮಾತು ರಸಪ್ರಶ್ನೆ (Main Quizzes)
        </button>
        <button
          className={`main-tab-button ${mainActiveTab === 'letterGame' ? 'active' : ''}`}
          onClick={() => {
            if (!quizStarted) { // Prevent tab switching if a quiz is currently active.
              setMainActiveTab('letterGame');
              setQuizType('letterIdentification'); // Set `quizType` to 'letterIdentification' when this tab is active.
              // Set initial letter subtype and `numQuestions` for the letter game to its max available for finite play.
              setLetterSubtype('varnamale');
              setNumQuestions(varnamale.length); // Set to max available for Varnamale.
            }
          }}
          disabled={quizStarted}
          /* Disable tab button when quiz is active */
        >
          ಅಕ್ಷರ ಗುರುತಿಸುವಿಕೆ (Letter Game)
        </button>
      </div>

      {!quizStarted && ( // Render quiz settings if a quiz is not started.
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

          {/* Content for Main Quizzes Tab, shown when `mainActiveTab` is 'mainQuiz'. */}
          {mainActiveTab === 'mainQuiz' && (
            <>
              <div className="quiz-type-dropdown-container">
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
                  <option value="ottaksharaWords">ಒತ್ತಕ್ಷರ ಪದಗಳು (Ottakshara Words)</option> {/* New quiz type option. */}
                </select>
              </div>

              <p>Choose how many questions you want to practice:</p>
              <div className="input-group">
                <input
                  type="number"
                  min="1"
                  max={maxQuestionsForCurrentType} /* Dynamically set max based on quiz type. */
                  value={numQuestions}
                  onChange={(e) => setNumQuestions(Math.max(1, Math.min(Number(e.target.value), maxQuestionsForCurrentType)))}
                  className="num-questions-input"
                />
                <span className="available-sentences">(Available: {maxQuestionsForCurrentType} questions)</span>
              </div>

              {quizType === 'word' && ( // Special UI for Word Quiz batch selection.
                <>
                  <p>Select a word batch (each batch has 50 words):</p>
                  <div className="batch-selection-container">
                    {wordBatches.map((batch, index) => (
                      <button
                        key={index}
                        className={`batch-button ${unlockedWordBatches.includes(index) ? 'unlocked' : 'locked'} ${selectedWordBatchForStart === index ? 'selected-batch' : ''}`}
                        onClick={() => handleBatchSelect(index)}
                        disabled={!unlockedWordBatches.includes(index)} // Disable locked batches.
                      >
                        Batch {index + 1} {unlockedWordBatches.includes(index) ? '' : '🔒'}
                      </button>
                    ))}
                  </div>
                  <p className="batch-info">Total words available across all batches: {wordBatches.flat().length}</p>
                </>
              )}
              {/* Start button for main quizzes. */}
              <button onClick={handleStartQuiz} className="start-button" disabled={quizType === 'word' && !unlockedWordBatches.includes(selectedWordBatchForStart)}>
                {mainQuizStartButtonText}
              </button>
            </>
          )}

          {/* Content for Letter Identification Game Tab, shown when `mainActiveTab` is 'letterGame'. */}
          {mainActiveTab === 'letterGame' && (
            <>
              {/* Sub-tabs for Letter Identification Quiz categories. */}
              <div className="letter-subtype-tabs">
                <button
                  className={`tab-button ${letterSubtype === 'varnamale' ? 'active' : ''}`}
                  onClick={() => handleLetterSubtypeChange('varnamale')}
                >
                  ವರ್ಣಮಾಲೆ (Alphabets)
                </button>
                <button
                  className={`tab-button ${letterSubtype === 'kaagunita' ? 'active' : ''}`}
                  onClick={() => handleLetterSubtypeChange('kaagunita')}
                >
                  ಕಾಗುಣಿತ (Vowel Signs)
                </button>
                <button
                  className={`tab-button ${letterSubtype === 'ottakshara' ? 'active' : ''}`}
                  onClick={() => handleLetterSubtypeChange('ottakshara')}
                >
                  ಒತ್ತಕ್ಷರ (Compound)
                </button>
              </div>

              {/* Information about the number of letters in the selected category. */}
              <p>You will be tested on {maxQuestionsForCurrentType} unique letters/compounds from the selected category.</p>
              {/* Start button for the letter game. */}
              <button onClick={handleStartQuiz} className="start-button">
                {letterGameStartButtonText}
              </button>
            </>
          )}
        </div>
      )}

      {/* Render quiz content when a quiz is started and not finished, and a current question exists. */}
      {quizStarted && !quizFinished && currentQuestion && (
        <div className="quiz-content">
          <p className="question-counter">Question {currentQuestionIndex + 1}
            {` / ${sessionQuestions.length}`} {/* Always show total questions for the session. */}
            {mainActiveTab === 'mainQuiz' && quizType === 'word' && ` (Batch ${selectedWordBatchForStart + 1})`} {/* Display batch info for word quiz. */}
            {mainActiveTab === 'letterGame' && ` (${ // Display letter subtype info for letter game.
                  letterSubtype === 'varnamale' ? 'Alphabets' :
                  letterSubtype === 'kaagunita' ? 'Vowel Signs' :
                  'Compound'
                })`}
          </p>
          <div className="question-box">
            {(mainActiveTab === 'mainQuiz' && (quizType === 'sentence' || quizType === 'minimalLearning')) && (
              <p className="english-sentence">{currentQuestion.english}</p> // Display English sentence.
            )}
            {(mainActiveTab === 'mainQuiz' && (quizType === 'word' || quizType === 'kannadaQuestion' || quizType === 'ottaksharaWords')) && (
              <>
                <p className="kannada-word-question">{currentQuestion.kannada} ({currentQuestion.romanKannada})</p> {/* Display Kannada word with Romanization. */}
              </>
            )}
            {/* Display Kannada letter in a very large font for the letter identification game. */}
            {mainActiveTab === 'letterGame' && (
              <p className="kannada-letter-display">{currentQuestion.kannada}</p>
            )}
          </div>

          <div className="options-grid">
            {options.map((option, index) => ( // Map through generated options to create buttons.
              <button
                key={index}
                className={getOptionClassName(option)} // Apply dynamic CSS class based on selection/correctness.
                onClick={() => handleOptionSelect(option)} // Handle option click.
                disabled={selectedOption !== null} // Disable buttons once an option is selected.
              >
                {option}
              </button>
            ))}
          </div>

          {/* Feedback area and buttons are now consistently displayed only if showFeedback is true */}
          {showFeedback && ( 
            <div className="feedback-area">
              {(mainActiveTab === 'mainQuiz' && (quizType === 'sentence' || quizType === 'minimalLearning')) && currentQuestion.romanKannada && (
                <p className="roman-kannada-feedback">
                  {currentQuestion.romanKannada} {/* Display Roman Kannada for Sentence/Minimal Learning. */}
                </p>
              )}
              {(mainActiveTab === 'mainQuiz' && (quizType === 'word' || quizType === 'kannadaQuestion' || quizType === 'ottaksharaWords')) && currentQuestion.english && (
                <p className="roman-kannada-feedback">
                  Correct: {currentQuestion.english} {/* Display correct English for Word/Kannada Question. */}
                </p>
              )}
              {/* For letter identification, show the correct transliteration with "Correct: " prefix */}
              {mainActiveTab === 'letterGame' && currentQuestion.romanKannada && (
                <p className="roman-kannada-feedback">
                  Correct: {currentQuestion.romanKannada}
                </p>
              )}
              <button
                onClick={handleListenToLearn}
                className="listen-button"
              >
                Listen to Learn {/* Button to play audio of the Kannada text. */}
              </button>
              {/* Button to proceed to the next question or finish the quiz. */}
              <button onClick={handleNextQuestion} className="next-button">
                {currentQuestionIndex === sessionQuestions.length - 1 ?
                  (mainActiveTab === 'mainQuiz' && quizType === 'word' ? "Complete Batch" : "Finish Quiz")
                  : "Next Question"}
              </button>
            </div>
          )}
          {/* Stop Game button is always visible during the letter game when a quiz is started */}
          {mainActiveTab === 'letterGame' && quizStarted && !quizFinished && ( 
              <div className="stop-game-button-container">
                  <button onClick={handleStopLetterQuiz} className="reset-button">
                      Stop Game
                  </button>
              </div>
          )}
        </div>
      )}

      {quizFinished && ( // Render quiz results when the quiz is finished.
        <>
          <div className="quiz-results">
            <div className="small-heading-banner">
              <h2>ಕನ್ನಡ ಕಲಿಕೆ ಕೆನಡಾ</h2>
            </div>
            <h2>{mainActiveTab === 'letterGame' ? "Kannada Letter Identification Game" : `Kannada ${quizType} Quiz`} Finished!</h2>
            {studentName && <p className="student-name-result">Student: {studentName}</p>}
            <p className="final-score">
              Your Score: {score} / {sessionQuestions.length} ({sessionQuestions.length > 0 ? ((score / sessionQuestions.length) * 100).toFixed(0) : 0}%)
            </p>
            {quizDuration && (
              <p className="quiz-duration">Time taken: {quizDuration}</p>
            )}
            <p className="current-date-time">Completed on: {currentDateTime}</p>

            {/* Display most frequently missed letters for the Letter Identification Game. */}
            {mainActiveTab === 'letterGame' && Object.keys(letterErrorCounts).length > 0 && (
                <div className="most-missed-letters-section">
                    <h3>Most Frequently Missed Letters:</h3>
                    <ul className="missed-letters-list">
                        {Object.entries(letterErrorCounts)
                            .sort(([, countA], [, countB]) => countB - countA) // Sort by highest error count.
                            .slice(0, 5) // Show only the top 5 missed letters.
                            .map(([letter, count]) => (
                                <li key={letter}>
                                    <span className="missed-letter-kannada">{letter}</span>
                                    <span className="missed-letter-count"> (Missed: {count} times)</span>
                                </li>
                            ))}
                        {Object.keys(letterErrorCounts).length > 5 && (
                            <li className="missed-letters-more">...and more. Keep practicing!</li>
                        )}
                    </ul>
                </div>
            )}

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
            {mainActiveTab === 'mainQuiz' && `For all quizzes, you can now choose the number of questions.`}
            {mainActiveTab === 'letterGame' && `For the Letter Identification Game, you practice all letters in the selected category.`}
          </p>
          <div className="author-info">
            Author: Ragu Kattinakere <br/>
          </div>
        </>
      )}
      {/* Footer Logo - Placeholder, replace src with your actual logo image URL. */}.
      <div className="logo-bottom-right">
        <img src="https://placehold.co/60x60/f0f4f8/2c3e50?text=Kಕ" alt="Kannada Maple Logo" />
      </div>
    </div>
  );
}

export default QuizPage;
