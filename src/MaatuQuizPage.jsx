import React, { useState, useEffect, useMemo } from 'react';
import './MaatuQuizPage.css';

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


// --- Your Curated Sentence Data ---
const allSentences = [
  {
    english: "How are you?",
    kannada: "ನೀವು ಹೇಗಿದ್ದೀರಾ?",
    incorrectOptions: ["ನೀನು ಎಲ್ಲಿದ್ದೀಯಾ?", "ಏನು ಮಾಡ್ತಿದ್ದೀಯಾ?", "ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ?", "ಎಲ್ಲಿಗೆ ಹೋಗ್ತಾ ಇದ್ದೀರಾ?"],
    romanKannada: "neevu hēgiddīrā?"
  },
  {
    english: "I am fine.",
    kannada: "ಚೆನ್ನಾಗಿದ್ದೇನೆ",
    incorrectOptions: ["ಸುಸ್ತಾಗಿದೆ", "ನಿದ್ದೆ ಬರ್ತಿದೆ", "ಖುಷಿಯಾಗಿದೆ", "ಬೇಜಾರು ಆಗಿದೆ"],
    romanKannada: "chennāgiddēne"
  },
  {
    english: "What is your name?",
    kannada: "ನಿಮ್ಮ ಹೆಸರು ಏನು?",
    incorrectOptions: ["ನಿಮ್ಮ ಊರು ಏನು?", "ನೀವು ಯಾರು?", "ಇದು ಏನು?", "ನಾನು ಯಾರು?"],
    romanKannada: "nim'ma hesaru ēnu?"
  },
  {
    english: "My name is Seeta.",
    kannada: "ನನ್ನ ಹೆಸರು ಸೀತಾ",
    incorrectOptions: ["ನನ್ನ ಮನೆ ಸೀತಾ", "ನನ್ನ ಊರು ಸೀತಾ", "ಸೀತಾ ಇಲ್ಲಿ", "ಅವಳ ಹೆಸರು ಸೀತಾ"],
    romanKannada: "nanna hesaru sītā"
  },
  {
    english: "Can I go to the bathroom?",
    kannada: "ನಾನು ಬಚ್ಚಲಿಗೆ ಹೋಗಲಾ?",
    incorrectOptions: ["ನಾನು ಹೊರಗೆ ಹೋಗಲಾ?", "ನಾನು ಬರಲಾ?", "ನನಗೆ ನೀರು ಕೊಡಿ?", "ನಾನು ಕುಳಿತುಕೊಳ್ಳಲಾ?"],
    romanKannada: "nānu baccalige hōgalā?"
  },
  {
    english: "I am hungry.",
    kannada: "ನನಗೆ ಹಸಿವಾಗಿದೆ",
    incorrectOptions: ["ನನಗೆ ನೀರಡಿಕೆ ಆಗಿದೆ", "ನನಗೆ ನಿದ್ದೆ ಬರ್ತಿದೆ", "ನನಗೆ ಸುಸ್ತಾಗಿದೆ", "ನನಗೆ ಬೇಜಾರು"],
    romanKannada: "nanage hasivāgide"
  },
  {
    english: "I am thirsty.",
    kannada: "ನೀರಡಿಕೆ ಆಗಿದೆ",
    incorrectOptions: ["ನನಗೆ ಹಸಿವಾಗಿದೆ", "ನನಗೆ ಬೇಜಾರು", "ನನಗೆ ಖುಷಿಯಾಗಿದೆ", "ನ ನನಗೆ ನಿದ್ದೆ ಬರ್ತಿದೆ"],
    romanKannada: "nīraḍike āgide"
  },
  {
    english: "Give me some water.",
    kannada: "ನನಗೆ ನೀರು ಕೊಡಿ.",
    incorrectOptions: ["ನನಗೆ ಊಟ ಕೊಡಿ.", "ನಾನು ನೀರು ಕುಡಿಲಾ?", "ನನಗೆ ಸಹಾಯ ಮಾಡಿ.", "ನನಗೆ ಪುಸ್ತಕ ಕೊಡಿ."],
    romanKannada: "nanage nīru koḍi."
  },
  {
    english: "I like this.",
    kannada: "ನನಗೆ ಇದು ಇಷ್ಟ",
    incorrectOptions: ["ನನಗೆ ಇಷ್ಟ ಇಲ್ಲ", "ಇದು ಏನು?", "ನನಗೆ ಬೇಕು", "ನನಗೆ ಬೇಡ"],
    romanKannada: "nanage idu iṣṭa"
  },
  {
    english: "I don't like this.",
    kannada: "ನನಗೆ ಇಷ್ಟ ಇಲ್ಲ.",
    incorrectOptions: ["ನನಗೆ ಇದು ಇಷ್ಟ", "ಇದು ಚೆನ್ನಾಗಿದೆ", "ನನಗೆ ಬೇಕಾಗಿಲ್ಲ", "ನನಗೆ ಬೇಕು"],
    romanKannada: "nanage iṣṭa illa."
  },
  {
    english: "Can I play?",
    kannada: "ನಾನು ಆಡಲಾ?",
    incorrectOptions: ["ನಾನು ಓದಲಾ?", "ನಾನು ಹೋಗಲಾ?", "ನಾನು ತಿನ್ನಲಾ?", "ನಾನು ಮಲಗಲಾ?"],
    romanKannada: "nānu āḍalā?"
  },
  {
    english: "Where is my book?",
    kannada: "ನನ್ನ ಪುಸ್ತಕ ಎಲ್ಲಿ ಇದೆ?",
    incorrectOptions: ["ನನ್ನ ಪುಸ್ತಕ ಏನು?", "ನನ್ನ ಪೆನ್ ಎಲ್ಲಿ ಇದೆ?", "ನಿನ್ನ ಪುಸ್ತಕ ಎಲ್ಲಿ ಇದೆ?", "ನನ್ನ ಮನೆ ಎಲ್ಲಿ ಇದೆ?"],
    romanKannada: "nanna pustaka elli ide?"
  },
  {
    english: "I don't know.",
    kannada: "ನನಗೆ ಗೊತ್ತಿಲ್ಲ",
    incorrectOptions: ["ನನಗೆ ಗೊತ್ತು", "ನಾನು ಮರೆತೆ", "ನಾನು ಕಲಿತೆ", "ನ ನಾನು ನೋಡಿದೆ"],
    romanKannada: "nanage gottilla"
  },
  {
    english: "I forgot.",
    kannada: "ನಾನು ಮರೆತೆ.",
    incorrectOptions: ["ನಾನು ನೆನಪಿದೆ", "ನಾನು ಕಲಿತೆ", "ನಾನು ನೋಡಿದೆ", "ನಾನು ತಿಳಿದುಕೊಂಡೆ"],
    romanKannana: "nānu marete."
  },
  {
    english: "Can I have some more?",
    kannada: "ಇನ್ನೂ ಸ್ವಲ್ಪ ಬೇಕು",
    incorrectOptions: ["ಸಾಕು", "ನನಗೆ ಬೇಡ", "ನೀರು ಬೇಕು", "ಊಟ ಬೇಕು"],
    romanKannada: "innū svalpa bēku"
  },
  {
    english: "It’s my turn.",
    kannada: "ನನ್ನ ಸರದಿ",
    incorrectOptions: ["ನಿನ್ನ ಸರದಿ", "ಅವನ ಸರದಿ", "ನನ್ನದು ಇಲ್ಲ", "ಅವಳ ಸರದಿ"],
    romanKannada: "nanna saradi"
  },
  {
    english: "I need help.",
    kannada: "ನನಗೆ ಸಹಾಯ ಬೇಕು",
    incorrectOptions: ["ನನಗೆ ನೀರು ಬೇಕು", "ನನಗೆ ಹೋಗ್ಬೇಕು", "ನನಗೆ ನಿದ್ದೆ ಬರ್ತಿದೆ", "ನನಗೆ ಊಟ ಬೇಕು"],
    romanKannada: "nanage sahāya bēku"
  },
  {
    english: "I don’t understand.",
    kannada: "ನನಗೆ ಅರ್ಥವಾಗುತ್ತಿಲ್ಲ.",
    incorrectOptions: ["ನನಗೆ ಅರ್ಥವಾಯಿತು", "ನನಗೆ ಗೊತ್ತಿದೆ", "ನನಗೆ ಓದಲು ಬರುತ್ತದೆ", "ನನಗೆ ನೆನಪಿದೆ"],
    romanKannada: "nanage arthavāguttilla."
  },
  {
    english: "Can you help me?",
    kannada: "ನನಗೆ ಸಹಾಯ ಮಾಡ್ತೀರಾ?",
    incorrectOptions: ["ನಾನು ಸಹಾಯ ಮಾಡಲಾ?", "ನೀವು ನನಗೆ ಕೊಡ್ತೀರಾ?", "ನೀವು ಹೋಗ್ತೀರಾ?", "ನೀವು ತಿಂತೀರಾ?"],
    romanKannada: "nanage sahāya māḍtīrā?"
  },
  {
    english: "Please slow down.",
    kannada: "ನಿಧಾನ ಹೋಗಿ.",
    incorrectOptions: ["ಬೇಗ ಹೋಗಿ.", "ನಿಧಾನ ಬನ್ನಿ.", "ನಿಧಾನ ಬನ್ನಿ.", "ಬೇಗ ಬನ್ನಿ."],
    romanKannada: "nidhāna hōgi."
  },
  {
    english: "I’m bored.",
    kannada: "ನನಗೆ ಬೇಜಾರು.",
    incorrectOptions: ["ನನಗೆ ಖುಷಿಯಾಗಿದೆ", "ನನಗೆ ಆಸಕ್ತಿ ಇದೆ", "ನನಗೆ ಕೆಲಸ ಇದೆ", "ನನಗೆ ನಿದ್ದೆ ಬರ್ತಿದೆ"],
    romanKannada: "nanage bējāru."
  },
  {
    english: "I am sleepy.",
    kannada: "ನನಗೆ ನಿದ್ದೆ ಬರ್ತಿದೆ",
    incorrectOptions: ["ನನಗೆ ಹಸಿವಾಗಿದೆ", "ನನಗೆ ಸುಸ್ತಾಗಿದೆ", "ನನಗೆ ಬೇಜಾರು", "ನನಗೆ ಖುಷಿಯಾಗಿದೆ"],
    romanKannada: "nanage nidde bartide"
  },
  {
    english: "Can I have a snack?",
    kannada: "ನನಗೆ ತಿಂಡಿ ಕೊಡ್ತೀರಾ?",
    incorrectOptions: ["ನನಗೆ ಊಟ ಕೊಡ್ತೀರಾ?", "ನನಗೆ ನೀರು ಕೊಡ್ತೀರಾ?", "ನನಗೆ ಆಡಲು ಬಿಡ್ತೀರಾ?", "ನನಗೆ ನಿದ್ದೆ ಕೊಡ್ತೀರಾ?"],
    romanKannana: "nanage tinḍi koḍtīrā?"
  },
  {
    english: "I need to go.",
    kannada: "ನನಗೆ ಹೋಗ್ಬೇಕು",
    incorrectOptions: ["ನಾನು ಬರಬೇಕು", "ನನಗೆ ಇರಬೇಕು", "ನನಗೆ ಕುಳಿತುಕೊಳ್ಳಬೇಕು", "ನನಗೆ ತಿನ್ನಬೇಕು"],
    romanKannada: "nanage hōgbēku"
  },
  {
    english: "Can we play together?",
    kannada: "ಒಟ್ಟಿಗೆ ಆಡಬಹುದಾ?",
    incorrectOptions: ["ಒಟ್ಟಿಗೆ ಓದಬಹುದಾ?", "ಒಟ್ಟಿಗೆ ಕುಳಿತುಕೊಳ್ಳಬಹುದಾ?", "ಒಟ್ಟಿಗೆ ಹೋಗಬಹುದಾ?", "ಒಟ್ಟಿಗೆ ಮಲಗಬಹುದಾ?"],
    romanKannada: "oṭṭige āḍabahudā?"
  },
  {
    english: "Let's go!",
    kannada: "ಹೋಗೋಣ!",
    incorrectOptions: ["ಬನ್ನಿ!", "ಬರಲ್ಲ!", "ನಿಲ್ಲಿಸು!", "ಮಾಡು!"],
    romanKannada: "hōgōṇa!"
  },
  {
    english: "Shall we go?",
    kannada: "ಹೋಗೋಣ್ವಾ?",
    incorrectOptions: ["ಬರ್ತೀರಾ?", "ನಿಲ್ಲಿಸೋಣ್ವಾ?", "ಮಾಡೋಣ್ವಾ?", "ತಿನ್ನೋಣ್ವಾ?"],
    romanKannada: "hōgōṇvā?"
  },
  {
    english: "I want to go outside.",
    kannada: "ನನಗೆ ಹೊರಗೆ ಹೋಗಬೇಕು",
    incorrectOptions: ["ನನಗೆ ಒಳಗೆ ಹೋಗಬೇಕು", "ನನಗೆ ಮನೆಗೆ ಹೋಗಬೇಕು", "ನನಗೆ ಬಸ್ಸು ಬೇಕು", "ನನಗೆ ತಿನ್ನಬೇಕು"],
    romanKannada: "nanage horage hōgabēku"
  },
  {
    english: "What time is it?",
    kannada: "ಸಮಯ ಎಷ್ಟು?",
    incorrectOptions: ["ಟೈಮ್ ಏನು?", "ಟೈಮ್ ಯಾವುದು?", "ಗಂಟೆ ಏನು?", "ಟೈಮ್ ಯಾಕೆ?"],
    romanKannada: "samaya eṣṭu?"
  },
  {
    english: "I am tired.",
    kannada: "ನನಗೆ ಸುಸ್ತಾಗಿದೆ",
    incorrectOptions: ["ನನಗೆ ಖುಷಿಯಾಗಿದೆ", "ನನಗೆ ನಿದ್ದೆ ಬರ್ತಿದೆ", "ನನಗೆ ಬೇಜಾರು", "ನನಗೆ ಹಸಿವಾಗಿದೆ"],
    romanKannada: "nanage sustāgide"
  },
  {
    english: "What did you say?",
    kannada: "ಏನು ಹೇಳಿದಿರಿ?",
    incorrectOptions: ["ಏನು ಮಾಡಿದೆ?", "ಯಾರು ಹೇಳಿದರು?", "ಎಲ್ಲಿ ಹೋದೆ?", "ಯಾವಾಗ ಹೇಳಿದಿರಿ?"],
    romanKannada: "ēnu hēḷidiri?"
  },
  {
    english: "I am happy.",
    kannada: "ನನಗೆ ಖುಷಿಯಾಗಿದೆ",
    incorrectOptions: ["ನನಗೆ ಬೇಸರ ಆಗಿದೆ", "ನನಗೆ ಸುಸ್ತಾಗಿದೆ", "ನನಗೆ ನಿದ್ದೆ ಬರ್ತಿದೆ", "ನನಗೆ ಹಸಿವಾಗಿದೆ"],
    romanKannada: "nanage khuṣiyāgide"
  },
  {
    english: "I am sad.",
    kannada: "ಬೇಸರ ಆಗಿದೆ",
    incorrectOptions: ["ಖುಷಿಯಾಗಿದೆ", "ಸಂತೋಷವಾಗಿದೆ", "ಆರೋಗ್ಯವಾಗಿದೆ", "ಚೆನ್ನಾಗಿದ್ದೇನೆ"],
    romanKannada: "bēsara āgide"
  },
  {
    english: "I am learning.",
    kannada: "ನಾನು ಕಲಿತಾ ಇದ್ದೇನೆ",
    incorrectOptions: ["ನಾನು ಕಲಿತೆ", "ನಾನು ಕಲಿಸುತ್ತಿದ್ದೇನೆ", "ನಾನು ಕಲಿಯಲಿಲ್ಲ", "ನಾನು ಮರೆತೆ"],
    romanKannada: "nānu kalitā iddēne"
  },
  {
    english: "What is this?",
    kannada: "ಇದು ಏನು?",
    incorrectOptions: ["ಅದು ಏನು?", "ಅವರು ಯಾರು?", "ಇದು ಯಾವುದು?", "ಅದು ಯಾವುದು?"],
    romanKannada: "idu ēnu?"
  },
  {
    english: "Can you repeat that?",
    kannada: "ಇನ್ನೊಮ್ಮೆ ಹೇಳ್ತೀರಾ?",
    incorrectOptions: ["ಇನ್ನೊಮ್ಮೆ ಮಾಡ್ತೀರಾ?", "ಇನ್ನೊಮ್ಮೆ ಬರ್ತೀರಾ?", "ಇನ್ನೊಮ್ಮೆ ಓದ್ತೀರಾ?", "ಇನ್ನೊಮ್ಮೆ ಕೊಡ್ತೀರಾ?"],
    romanKannada: "innomme hēḷtīrā?"
  },
  {
    english: "I don’t feel well./I am not feeling well.",
    kannada: "ನನಗೆ ಹುಷಾರಿಲ್ಲ",
    incorrectOptions: ["ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ", "ನನಗೆ ಸುಸ್ತಾಗಿದೆ", "ನನಗೆ ನಿದ್ದೆ ಬರ್ತಿದೆ", "ನನಗೆ ಹಸಿವಾಗಿದೆ"],
    romanKannana: "nanage huṣārilla"
  },
  {
    english: "I am fine now.",
    kannada: "ಈಗ ಅರಾಮಿದೀನಿ",
    incorrectOptions: ["ಈಗ ಹುಷಾರಿಲ್ಲ", "ಈಗ ಕೆಲಸ ಇದೆ", "ಈಗ ಹೋಗ್ಬೇಕು", "ಈಗ ಬೇಜಾರು"],
    romanKannada: "īga arāmidīni"
  },
  {
    english: "I am busy.",
    kannada: "ನನಗೆ ಕೆಲಸ ಇದೆ",
    incorrectOptions: ["ನನಗೆ ಬೇಜಾರು", "ನಾನು ನಿದ್ದೆ ಬರ್ತಿದೆ", "ನಾನು ಆಡ್ತಾ ಇದ್ದೇನೆ", "ನಾನು ಓದ್ತಾ ಇದ್ದೇನೆ"],
    romanKannada: "nanage kelasa ide"
  },
  {
    english: "I can do it. / I will do it.",
    kannada: "ನಾನು ಮಾಡ್ತೀನಿ",
    incorrectOptions: ["ನಾನು ಮಾಡಲ್ಲ", "ನಾನು ಮಾಡಿದೆ", "ನಾನು ಮಾಡಲಿಲ್ಲ", "ನಾನು ಮಾಡಬೇಕು"],
    romanKannada: "nānu māḍtīni"
  },
  {
    english: "I don’t want to do it.",
    kannada: "ನಾನು ಮಾಡಲ್ಲ",
    incorrectOptions: ["ನಾನು ಮಾಡ್ತೀನಿ", "ನಾನು ಮಾಡಿದೆ", "ನ ನಾನು ಮಾಡಬೇಕು", "ನಾನು ಮಾಡೋಣ"],
    romanKannada: "nānu māḍalla"
  },
  {
    english: "I will be right back.",
    kannada: "ಇರಿ ಬಂದೆ",
    incorrectOptions: ["ಹೋಗ್ತಾ ಇದ್ದೀನಿ", "ನಾನು ಬರಲ್ಲ", "ನಾನು ಇಲ್ಲಿ ಇಲ್ಲ", "ನಾನು ಮಲಗುತ್ತೇನೆ"],
    romanKannada: "iri bande"
  },
  {
    english: "Can you wait?",
    kannada: "ಸ್ವಲ್ಪ ಕಾಯ್ತೀರಾ?",
    incorrectOptions: ["ಸ್ವಲ್ಪ ಹೋಗ್ತೀರಾ?", "ಸ್ವಲ್ಪ ಕೊಡ್ತೀರಾ?", "ಸ್ವಲ್ಪ ತಿಂತೀರಾ?", "ಸ್ವಲ್ಪ ನಿಲ್ಲುತ್ತೀರಾ?"],
    romanKannada: "svalpa kāytīrā?"
  },
  {
    english: "Can I sit here?",
    kannada: "ಇಲ್ಲಿ ಕೂರ್ಲಾ?",
    incorrectOptions: ["ಅಲ್ಲಿ ಕೂರ್ಲಾ?", "ಇಲ್ಲಿ ನಿಂತ್ಕೋಲಾ?", "ಇಲ್ಲಿ ಮಲಗಲಾ?", "ಅಲ್ಲಿ ಹೋಗ್ಲಾ?"],
    romanKannada: "illi kūrlā?"
  },
  {
    english: "Where are you going?",
    kannada: "ಎಲ್ಲಿಗೆ ಹೋಗ್ತಾ ಇದ್ದೀರಾ?",
    incorrectOptions: ["ಯಾರು ಹೋಗ್ತಾ ಇದ್ದೀರಾ?", "ಯಾವಾಗ ಹೋಗ್ತಾ ಇದ್ದೀರಾ?", "ಏನು ಮಾಡ್ತಾ ಇದ್ದೀರಾ?", "ಯಾಕೆ ಹೋಗ್ತಾ ಇದ್ದೀರಾ?"],
    romanKannada: "ellige hōgtā iddīrā?"
  },
  {
    english: "It’s too hot today.",
    kannada: "ಇವತ್ತು ತುಂಬಾ ಸೆಕೆ ಇದೆ",
    incorrectOptions: ["ಇವತ್ತು ತುಂಬಾ ತಂಪು ಇದೆ", "ಇವತ್ತು ಮಳೆ ಇದೆ", "ಇವತ್ತು ಬಿಸಿಲು ಇದೆ", "ಇವತ್ತು ಚಳಿ ಇದೆ"],
    romanKannada: "ivattu tumbā seke ide"
  },
  {
    english: "Can I come?",
    kannada: "ನಾನು ಬರ್ಲಾ?",
    incorrectOptions: ["ನಾನು ಹೋಗ್ಲಾ?", "ನಾನು ಇರ್ಲಾ?", "ನಾನು ಕೂರ್ಲಾ?", "ನಾನು ತಿನ್ನಲಾ?"],
    romanKannada: "nānu barlā?"
  },
  {
    english: "Can I stay?",
    kannada: "ನಾನು ಇರ್ಲಾ?",
    incorrectOptions: ["ನಾನು ಬರ್ಲಾ?", "ನಾನು ಹೋಗ್ಲಾ?", "ನಾನು ಮಾಡ್ಲಾ?", "ನಾನು ನೋಡಲಾ?"],
    romanKannada: "nānu irlā?"
  },
  {
    english: "I won’t come.",
    kannada: "ನಾನು ಬರಲ್ಲ",
    incorrectOptions: ["ನಾನು ಬರ್ತೀನಿ", "ನಾನು ಬಂದೆ", "ನಾನು ಹೋಗ್ತೀನಿ", "ನಾನು ಮಾಡ್ತೀನಿ"],
    romanKannada: "nānu baralla"
  },
  {
    english: "You cried.",
    kannada: "ನೀನು ಅತ್ತೆ",
    incorrectOptions: ["ನೀನು ನಕ್ಕೆ", "ನೀನು ಓಡಿದೆ", "ನೀನು ಕೂತೆ", "ನೀನು ಬರೆದೆ"],
    romanKannada: "nīnu atte"
  },
  {
    english: "He will find.",
    kannada: "ಅವನು ಹುಡುಕುತ್ತಾನೆ",
    incorrectOptions: ["ಅವನು ಓದುತ್ತಾನೆ", "ಅವನು ತಿನ್ನುತ್ತಾನೆ", "ಅವನು ಬರೆಯುತ್ತಾನೆ", "ಅವನು ಓಡುತ್ತಾನೆ"],
    romanKannada: "avanu huḍukuttāne"
  },
  {
    english: "I cried.",
    kannada: "ನಾನು ಅತ್ತೆ",
    incorrectOptions: ["ನಾನು ನಕ್ಕೆ", "ನಾನು ಮಾಡಿದೆ", "ನಾನು ಓಡಿದೆ", "ನಾನು ತಿಂದೆ"],
    romanKannana: "nānu atte"
  },
  {
    english: "We will cry.",
    kannada: "ನಾವು ಅಳುತ್ತೇವೆ",
    incorrectOptions: ["ನಾವು ನಗುತ್ತೇವೆ", "ನಾವು ಓಡುತ್ತೇವೆ", "ನಾವು ಕುಡಿಯುತ್ತೇವೆ", "ನಾವು ತಿನ್ನುತ್ತೇವೆ"],
    romanKannada: "nāvu aḷutēve"
  },
  {
    english: "He cried.",
    kannada: "ಅವನು ಅತ್ತ",
    incorrectOptions: ["ಅವನು ನಕ್ಕ", "ಅವನು ಓಡಿದ", "ಅವನು ಬಿದ್ದ", "ಅವನು ತಿಂದ"],
    romanKannada: "avanu atta"
  },
  {
    english: "I laughed.",
    kannada: "ನಾನು ನಕ್ಕೆ",
    incorrectOptions: ["ನಾನು ಅತ್ತೆ", "ನಾನು ಓಡಿದೆ", "ನಾನು ಕುಡಿದೆ", "ನಾನು ಬರೆದೆ"],
    romanKannada: "nānu nakke"
  },
  {
    english: "She took it.",
    kannada: "ಅವಳು ತಗೊಂಡಳು",
    incorrectOptions: ["ಅವಳು ಕೊಟ್ಟಳು", "ಅವಳು ನೋಡಿದಳು", "ಅವಳು ಬರೆದಳು", "ಅವಳು ತಿಂದಳು"],
    romanKannada: "avaḷu tagoṇḍaḷu"
  },
  {
    english: "He laughed (He was laughing).",
    kannada: "ಅವನು ನಕ್ಕ (ಅವನು ನಗುತ್ತಾ ಇದ್ದ)",
    incorrectOptions: ["ಅವನು ಅತ್ತ (ಅವನು ಅಳುತ್ತಾ ಇದ್ದ)", "ಅವನು ಓಡಿದ (ಅವನು ಓಡುತ್ತಾ ಇದ್ದ)", "ಅವನು ಕುಡಿದ (ಅವನು ಕುಡಿಯುತ್ತಾ ಇದ್ದ)", "ಅವನು ತಿಂದು (ಅವನು ತಿನ್ನುತ್ತಾ ಇದ್ದ)"],
    romanKannada: "avanu nakka (avanu naguttā idda)"
  },
  {
    english: "They read.",
    kannada: "ಅವರು ಓದುತ್ತಾರೆ",
    incorrectOptions: ["ಅವರು ಬರೆಯುತ್ತಾರೆ", "ಅವರು ತಿನ್ನುತ್ತಾರೆ", "ಅವರು ಓಡುತ್ತಾರೆ", "ಅವರು ನೋಡುತ್ತಾರೆ"],
    romanKannada: "avaru ōduttāre"
  },
  {
    english: "They fell.",
    kannada: "ಅವರು ಬಿದ್ದರು",
    incorrectOptions: ["ಅವರು ನಿಂತರು", "ಅವರು ಕುಳಿತುಕೊಂಡರು", "ಅವರು ಓಡಿದರು", "ಅವರು ಎದ್ದರು"],
    romanKannada: "avaru biddaru"
  },
  {
    english: "She wrote.",
    kannada: "ಅವಳು ಬರೆದಳು",
    incorrectOptions: ["ಅವಳು ಓದಿದಳು", "ಅವಳು ತಿಂದಳು", "ಅವಳು ಕುಡಿದಳು", "ಅವಳು ನೋಡಿದಳು"],
    romanKannada: "avaḷu baredaḷu"
  },
  {
    english: "He fell.",
    kannada: "ಅವನು ಬಿದ್ದ",
    incorrectOptions: ["ಅವನು ನಿಂತ", "ಅವನು ಕುಳಿತ", "ಅವನು ಓಡಿದ", "ಅವನು ಎದ್ದ"],
    romanKannada: "avanu bidda"
  },
  {
    english: "She fell.",
    kannada: "ಅವಳು ಬಿದ್ದಳು",
    incorrectOptions: ["ಅವಳು ನಿಂತಳು", "ಅವಳು ಕುಳಿತಳು", "ಅವಳು ಓಡಿದಳು", "ಅವಳು ಎದ್ದಳು"],
    romanKannada: "avaḷu biddalu"
  },
  {
    english: "She is walking.",
    kannada: "ಅವಳು ನಡೀತಾ ಇದ್ದಾಳೆ",
    incorrectOptions: ["ಅವಳು ಓಡ್ತಾ ಇದ್ದಾಳೆ", "ಅವಳು ಕುಳಿತುಕೊಂಡಿದ್ದಾಳೆ", "ಅವಳು ಮಲಗಿದ್ದಾಳೆ", "ಅವಳು ತಿನ್ನುತ್ತಾ ಇದ್ದಾಳೆ"],
    romanKannana: "avaḷu naḍītā iddāḷe"
  },
  {
    english: "You are walking.",
    kannada: "ನೀನು ನಡೀತಾ ಇದೀಯಾ",
    incorrectOptions: ["ನೀನು ಓಡ್ತಾ ಇದೀಯಾ", "ನೀನು ಕುಳಿತುಕೊಂಡಿದ್ದೀಯಾ", "ನೀನು ಮಲಗಿದ್ದೀಯಾ", "ನೀನು ತಿನ್ನುತ್ತಾ ಇದೀಯಾ"],
    romanKannada: "nīnu naḍītā idīyā"
  },
  {
    english: "He is running.",
    kannada: "ಅವನು ಓಡ್ತಾ ಇದ್ದಾನೆ",
    incorrectOptions: ["ಅವನು ನಡೀತಾ ಇದ್ದಾನೆ", "ಅವನು ಕುಳಿತುಕೊಂಡಿದ್ದಾನೆ", "ಅವನು ಮಲಗಿದ್ದಾನೆ", "ಅವನು ತಿನ್ನುತ್ತಾ ಇದ್ದಾನೆ"],
    romanKannada: "avanu ōḍtā iddāne"
  },
  {
    english: "Did you/have you start/started ?",
    kannada: "ನೀನು ಆರಂಭಿಸಿದೆಯಾ?",
    incorrectOptions: ["ನೀನು ಹೊರಟೆಯಾ?", "ನೀನು ಮುಗಿಸಿದೆಯಾ?", "ನೀನು ಬಂದರೆ?", "ನೀನು ನೋಡಿದೆ?"],
    romanKannada: "nīnu ārambhisideyā?"
  },
  {
    english: "The dog is sitting.",
    kannada: "ನಾಯಿ ಕೂತಿದೆ",
    incorrectOptions: ["ನಾಯಿ ಓಡುತ್ತಿದೆ", "ನಾಯಿ ಮಲಗಿದೆ", "ನಾಯಿ ನಿಂತಿದೆ", "ನಾಯಿ ತಿನ್ನುತ್ತಿದೆ"],
    romanKannada: "nāyi kūtide"
  },
  {
    english: "Did you not start?",
    kannada: "ನೀನು ಹೊರಡಲಿಲ್ವಾ?",
    incorrectOptions: ["ನೀನು ಹೊರಟೆಯಾ?", "ನೀನು ಆರಂಭಿಸಿದೆ", "ನೀನು ಮುಗಿಸಿದೆಯಾ?", "ನೀನು ನೋಡಲಿಲ್ವಾ?"],
    romanKannada: "nīnu horaḍalilvā?"
  },
  {
    english: "We are going to sleep.",
    kannada: "ನಾವು ಮಲಗುತ್ತೇವೆ",
    incorrectOptions: ["ನಾವು ಎದ್ದಿದ್ದೇವೆ", "ನಾವು ಓಡುತ್ತೇವೆ", "ನಾವು ಕುಳಿತುಕೊಳ್ಳುತ್ತೇವೆ", "ನಾವು ತಿನ್ನುತ್ತೇವೆ"],
    romanKannada: "nāvu malagatēve"
  },
  {
    english: "What did you buy?",
    kannada: "ನೀವು ಏನು ತಗೊಂಡ್ರಿ?",
    incorrectOptions: ["ನೀವು ಏನು ಮಾರಿದ್ರಿ?", "ನೀವು ಏನು ನೋಡಿದ್ರಿ?", "ನೀವು ಏನು ತಿಂದ್ರಿ?", "ನೀವು ಏನು ಕುಡಿದ್ರಿ?"],
    romanKannada: "neevu ēnu tagoṇḍri?"
  },
  {
    english: "They are buying.",
    kannada: "ಅವರು ಬೈ ಮಾಡ್ತಾ ಇದ್ದಾರೆ.",
    incorrectOptions: ["ಅವರು ಮಾರುತ್ತಾ ಇದ್ದಾರೆ", "ಅವರು ನೋಡುತ್ತಾ ಇದ್ದಾರೆ", "ಅವರು ತಿನ್ನುತ್ತಾ ಇದ್ದಾರೆ", "ಅವರು ಕುಡಿಯುತ್ತಾ ಇದ್ದಾರೆ"],
    romanKannada: "avaru bai māḍtā iddāre."
  },
  {
    english: "What did you sell?",
    kannada: "ನೀವು ಏನು ಮಾರಿದ್ರಿ?",
    incorrectOptions: ["ನೀವು ಏನು ತಗೊಂಡ್ರಿ?", "ನೀವು ಏನು ನೋಡಿದ್ರಿ?", "ನೀವು ಏನು ತಿಂದ್ರಿ?", "ನೀವು ಏನು ಕುಡಿದ್ರಿ?"],
    romanKannada: "neevu ēnu māridri?"
  },
  {
    english: "Did she find it?",
    kannada: "ಅವಳಿಗೆ ಸಿಗ್ತಾ?",
    incorrectOptions: ["ಅವಳಿಗೆ ಸಿಗಲಿಲ್ಲ?", "ಅವಳು ಕಂಡಳು?", "ಅವಳು ಹುಡುಕಿದಳು?", "ಅವಳು ಕೇಳಿದಳು?"],
    romanKannada: "avaḷige sigtā?"
  },
  {
    english: "Did you eat your lunch?",
    kannada: "ಊಟ ಮಾಡಿದ್ಯಾ?",
    incorrectOptions: ["ಊಟ ಆಯ್ತಾ?", "ನೀರಡಿಕೆ ಆಗಿದೆಯಾ?", "ಹಸಿವಾಗಿದೆಯಾ?", "ನಿದ್ದೆ ಬರ್ತಿದೆಯಾ?"],
    romanKannada: "ūṭa māḍidyā?"
  },
  {
    english: "Did you finish your supper?",
    kannada: "ಊಟ ಆಯ್ತಾ?",
    incorrectOptions: ["ಊಟ ಮಾಡಿದ್ಯಾ?", "ನೀವು ತಿಂಡಿ ತಿಂದ್ರು?", "ನೀವು ಕುಡಿದ್ರಿ?", "ನೀವು ಮಲಗಿದ್ರಿ?"],
    romanKannada: "ūṭa āytā?"
  },
  {
    english: "He came.",
    kannada: "ಅವನು ಬಂದ",
    incorrectOptions: ["ಅವನು ಹೋದ", "ಅವನು ನೋಡಿದ", "ಅವನು ನಕ್ಕ", "ಅವನು ಬಿದ್ದ"],
    romanKannada: "avanu banda"
  },
  {
    english: "Let it go?",
    kannada: "ಹೋಗ್ಲಿ ಬಿಡು",
    incorrectOptions: ["ಹೋಗ್ಬೇಡ", "ನಿಲ್ಲಿಸು", "ಬಿಟ್ಟ್ಬಿಡಬೇಡ", "ಮಾಡು"],
    romanKannada: "hōgli biḍu"
  },
  {
    english: "She came.",
    kannada: "ಅವಳು ಬಂದಳು",
    incorrectOptions: ["ಅವಳು ಹೋದಳು", "ಅವಳು ನೋಡಿದಳು", "ಅವಳು ನಕ್ಕಳು", "ಅವಳು ಬಿದ್ದಳು"],
    romanKannada: "avaḷu bandaḷu"
  },
  {
    english: "Close the door.",
    kannada: "ಬಾಗಿಲು ಮುಚ್ಚು",
    incorrectOptions: ["ಬಾಗಿಲು ತೆರೆ", "ಬಾಗಿಲು ತೆಗೆ", "ಬಾಗಿಲು ಹಾಕು", "ಬಾಗಿಲು ಬಿಡು"],
    romanKannada: "bāgilu mucchu"
  },
  {
    english: "She ate.",
    kannada: "ಅವಳು ತಿಂದಳು",
    incorrectOptions: ["ಅವಳು ಕುಡಿದಳು", "ಅವಳು ಓದಿದಳು", "ಅವಳು ಬರೆದಳು", "ಅವಳು ನೋಡಿದಳು"],
    romanKannana: "avaḷu tindaḷu"
  },
  {
    english: "Serve me lunch.",
    kannada: "ಊಟ ಬಡಿಸ್ತೀರಾ",
    incorrectOptions: ["ನನಗೆ ನೀರು ಕೊಡಿ", "ಊಟ ತರ್ತೀರಾ", "ಊಟ ತಿಂತೀರಾ", "ಊಟ ಮಾಡ್ತೀರಾ"],
    romanKannada: "ūṭa baḍistīrā"
  },
  {
    english: "She drank.",
    kannada: "ಅವಳು ಕುಡಿದಳು",
    incorrectOptions: ["ಅವಳು ತಿಂದಳು", "ಅವಳು ಓದಿದಳು", "ಅವಳು ಬರೆದಳು", "ಅವಳು ನೋಡಿದಳು"],
    romanKannana: "avaḷu kuḍidaḷu"
  },
  {
    english: "Open the door.",
    kannada: "ಬಾಗಿಲು ತೆರೆಯಿರಿ",
    incorrectOptions: ["ಬಾಗಿಲು ಮುಚ್ಚಿ", "ಬಾಗಿಲು ಹಾಕಿ", "ಬಾಗಿಲು ಎತ್ತಿ", "ಬಾಗಿಲು ಬಿಡಿ"],
    romanKannana: "bāgilu tereyiri"
  },
  {
    english: "He drank.",
    kannada: "ಅವನು ಕುಡಿದ",
    incorrectOptions: ["ಅವನು ತಿಂದ", "ಅವನು ಓದಿದ", "ಅವನು ಬರೆದ", "ಅವನು ನೋಡಿದ"],
    romanKannada: "avanu kuḍida"
  },
  {
    english: "We spoke.",
    kannada: "ನಾವು ಮಾತಾಡಿದ್ವಿ",
    incorrectOptions: ["ನಾವು ಬರೆದ್ವಿ", "ನಾವು ಓದ್ವಿ", "ನಾವು ಕೇಳಿದ್ವಿ", "ನಾವು ನೋಡಿದ್ವಿ"],
    romanKannada: "nāvu mātāḍidvi"
  },
  {
    english: "This is mine.",
    kannada: "ಇದು ನನ್ನದು",
    incorrectOptions: ["ಇದು ನಿನ್ನದು", "ಇದು ಅವನದು", "ಇದು ಅವಳದು", "ಇದು ಅವರದು"],
    romanKannada: "idu nannadu"
  },
  {
    english: "He was there.",
    kannada: "ಅವನು ಇದ್ದ",
    incorrectOptions: ["ಅವನು ಇಲ್ಲಿ ಇಲ್ಲ", "ಅವನು ಬಂದ", "ಅವನು ನೋಡಿದ", "ಅವನು ಹೋದ"],
    romanKannada: "avanu idda"
  },
  {
    english: "That is yours.",
    kannada: "ಅದು ನಿನ್ನದು",
    incorrectOptions: ["ಅದು ನನ್ನದು", "ಅದು ಅವನದು", "ಅದು ಅವಳದು", "ಅದು ಅವರದು"],
    romanKannada: "adu ninnadu"
  },
  {
    english: "She was there.",
    kannada: "ಅವಳು ಇದ್ದಳು",
    incorrectOptions: ["ಅವಳು ಇಲ್ಲಿ ಇಲ್ಲ", "ಅವಳು ಬಂದಳು", "ಅವಳು ಹೋದಳು", "ಅವಳು ನೋಡಿದಳು"],
    romanKannada: "avaḷu iddaḷu"
  },
  {
    english: "Give it back.",
    kannada: "ವಾಪಸ್ ಕೊಡು",
    incorrectOptions: ["ವಾಪಸ್ ತಗೋ", "ವಾಪಸ್ ಬೇಡ", "ವಾಪಸ್ ಇಡು", "ವಾಪಸ್ ಹೇಳು"],
    romanKannada: "vāpas koḍu"
  },
  {
    english: "She learned.",
    kannada: "ಅವಳು ಕಲಿತಳು",
    incorrectOptions: ["ಅವಳು ಕಲಿಸಿದಳು", "ಅವಳು ನೋಡಿದಳು", "ಅವಳು ಬರೆದಳು", "ಅವಳು ಆಡಿದಳು"],
    romanKannada: "avaḷu kalitaḷu"
  },
  {
    english: "Don't touch my stuff.",
    kannada: "ನನ್ನ ಸಾಮಾನು ಮುಟ್ಟಬೇಡ",
    incorrectOptions: ["ನಿನ್ನ ಸಾಮಾನು ಮುಟ್ಟಬೇಡ", "ನನ್ನ ಸಾಮಾನು ನೋಡು", "ನನ್ನ ಸಾಮಾನು ಕೊಡು", "ನನ್ನ ಸಾಮಾನು ತಿನ್ನು"],
    romanKannada: "nanna sāmānu muṭṭabēḍa"
  },
  {
    english: "We wrote.",
    kannada: "ನಾವು ಬರೆದ್ವಿ",
    incorrectOptions: ["ನಾವು ಓದ್ವಿ", "ನಾವು ಮಾತಾಡಿದ್ವಿ", "ನಾವು ಕೇಳಿದ್ವಿ", "ನಾವು ನೋಡಿದ್ವಿ"],
    romanKannada: "nāvu baredvi"
  },
  {
    english: "Can I borrow it?",
    kannada: "ನಾನು ಇದನ್ನು ತಗೋಬಹುದಾ?",
    incorrectOptions: ["ನಾನು ಇದನ್ನು ಕೊಡಬಹುದಾ?", "ನಾನು ಇದನ್ನು ನೋಡಬಹುದಾ?", "ನಾನು ಇದನ್ನು ಇಡಬಹುದಾ?", "ನಾನು ಇದನ್ನು ಕಲಿಯಬಹುದಾ?"],
    romanKannada: "nānu idannu tagōbahudā?"
  },
  {
    english: "They/He believed.",
    kannada: "ಅವರು ನಂಬಿದರು",
    incorrectOptions: ["ಅವರು ಅನುಮಾನಿಸಿದರು", "ಅವರು ಕೇಳಿದರು", "ಅವರು ಹೇಳಿದರು", "ಅವರು ನೋಡಿದರು"],
    romanKannada: "avaru nambidaru"
  },
  {
    english: "Come here.",
    kannada: "ಇಲ್ಲಿ ಬಾ",
    incorrectOptions: ["ಅಲ್ಲಿ ಹೋಗು", "ಬೇಗ ಮಾಡು", "ಸುಮ್ಮನಿರು", "ನಿಲ್ಲು"],
    romanKannada: "illi bā"
  },
  {
    english: "I called.",
    kannada: "ನಾನು ಕರೆದೆ",
    incorrectOptions: ["ನಾನು ಕೇಳಿದೆ", "ನಾನು ನೋಡಿದೆ", "ನಾನು ಹೇಳಿದೆ", "ನಾನು ಮಾಡಿದೆ"],
    romanKannada: "nānu karede"
  },
  {
    english: "Go away.",
    kannada: "ಅಲ್ಲಿ ಹೋಗು",
    incorrectOptions: ["ಇಲ್ಲಿ ಬಾ", "ಬೇಗ ಮಾಡು", "ಸುಮ್ಮನಿರು", "ನಿಲ್ಲು"],
    romanKannada: "alli hōgu"
  },
  {
    english: "She called.",
    kannada: "ಅವಳು ಕರೆದಳು",
    incorrectOptions: ["ಅವಳು ಕೇಳಿದಳು", "ಅವಳು ನೋಡಿದಳು", "ಅವಳು ಹೇಳಿದಳು", "ಅವಳು ಮಾಡಿದಳು"],
    romanKannada: "avaḷu karedaḷu"
  },
  {
    english: "Sit down.",
    kannada: "ಕೂತ್ಕೋ",
    incorrectOptions: ["ನಿಂತ್ಕೋ", "ಹೋಗು", "ಬಾ", "ನಿಲ್ಲಿಸು"],
    romanKannada: "kūtkō"
  },
  {
    english: "We slept.",
    kannada: "ನಾವು ಮಲ್ಕೊಂಡ್ವಿ",
    incorrectOptions: ["ನಾವು ಎದ್ದೆವು", "ನಾವು ಓದ್ವಿ", "ನಾವು ತಿಂದ್ವಿ", "ನಾವು ಕುಡಿದ್ವಿ"],
    romanKannada: "nāvu malkaṇḍvi"
  },
  {
    english: "Stand up.",
    kannada: "ನಿಂತ್ಕೋ",
    incorrectOptions: ["ಕೂತ್ಕೋ", "ಹೋಗು", "ಬಾ", "ನಿಲ್ಲಿಸು"],
    romanKannada: "nintkō"
  },
  {
    english: "They woke up.",
    kannada: "ಅವರು ಎದ್ದರು",
    incorrectOptions: ["ಅವರು ಮಲಗಿದರು", "ಅವರು ಓಡಿದರು", "ಅವರು ಬಿದ್ದರು", "ಅವರು ಕುಳಿತುಕೊಂಡರು"],
    romanKannada: "avaru eddaru"
  },
  {
    english: "Be quiet.",
    kannada: "ಸುಮ್ಮನಿರು",
    incorrectOptions: ["ಮಾತನಾಡು", "ಕಿರುಚು", "ಬೇಗ ಮಾಡು", "ಕೇಳು"],
    romanKannada: "summaniru"
  },
  {
    english: "I saw.",
    kannada: "ನಾನು ನೋಡಿದೆ",
    incorrectOptions: ["ನಾನು ಕೇಳಿದೆ", "ನಾನು ಹೇಳಿದೆ", "ನಾನು ಮಾಡಿದೆ", "ನ ನಾನು ಬರೆದೆ"],
    romanKannada: "nānu nōḍide"
  },
  {
    english: "Hurry up.",
    kannada: "ಬೇಗ ಮಾಡು",
    incorrectOptions: ["ನಿಧಾನ ಮಾಡು", "ಸುಮ್ಮನಿರು", "ನಿಲ್ಲಿಸು", "ನಿಂತ್ಕೋ"],
    romanKannada: "bēga māḍu"
  },
  {
    english: "She saw.",
    kannada: "ಅವಳು ನೋಡಿದಳು",
    incorrectOptions: ["ಅವಳು ಕೇಳಿದಳು", "ಅವಳು ಹೇಳಿದಳು", "ಅವಳು ಮಾಡಿದಳು", "ಅವಳು ಬರೆದಳು"],
    romanKannada: "avaḷu nōḍidaḷu"
  },
  {
    english: "Look!",
    kannada: "ನೋಡು!",
    incorrectOptions: ["ಕೇಳು!", "ಹೇಳು!", "ಮಾಡು!", "ಬಾ!"],
    romanKannada: "nōḍu!"
  },
  {
    english: "Listen!",
    kannada: "ಕೇಳು!",
    incorrectOptions: ["ನೋಡು!", "ಹೇಳು!", "ಮಾಡು!", "ಬಾ!"],
    romanKannada: "kēḷu!"
  },
  {
    english: "Stop!",
    kannada: "ನಿಲ್ಲಿಸು!",
    incorrectOptions: ["ಹೋಗು!", "ಬಾ!", "ಓಡು!", "ಮಾಡು!"],
    romanKannada: "nillisu!"
  },
  {
    english: "Wait a bit!",
    kannada: "ಸ್ವಲ್ಪ ತಡಿ!",
    incorrectOptions: ["ಬೇಗ ಮಾಡು!", "ಹೋಗು!", "ಮಾಡು!", "ಬಾ!"],
    romanKannada: "svalpa taḍi!"
  },
  // --- New Sentences Added Below ---
  {
    english: "What do we have for Tuesday?",
    kannada: "ಮಂಗಳವಾರ ಏನು ಕಾರ್ಯಕ್ರಮವಿದೆ?",
    incorrectOptions: ["ಮಂಗಳವಾರ ಯಾವಾಗ?", "ಏನು ಕಾರ್ಯಕ್ರಮ?", "ನಾಳೆ ಏನು?", "ಇವತ್ತು ಏನು?"],
    romanKannada: "maṅgaḷavāra ēnu kāryakramavide?"
  },
  {
    english: "Do we have tabs?",
    kannada: "ನಮ್ಮನೆಲಿ ಟ್ಯಾಬ್‌ ಇದೆಯಾ?", // Corrected Kannada script
    incorrectOptions: ["ನಮಗೆ ಟ್ಯಾಬ್ ಬೇಕಾ?", "ನೀವು ಟ್ಯಾಬ್ ಕೊಟ್ಟೀರಾ?", "ಟ್ಯಾಬ್ ಎಲ್ಲಿದೆ?", "ಟ್ಯಾಬ್ ಇಲ್ಲ?"],
    romanKannana: "nammameḷi ṭyāb‌ ideyā?" // Corrected Romanization
  },
  {
    english: "Are we going somewhere today?",
    kannada: "ಇವತ್ತು ಎಲ್ಲಿಗಾದರೂ ಹೋಗಬೇಕಾ?",
    incorrectOptions: ["ಇವತ್ತು ಎಲ್ಲಿದ್ದಾರೆ?", "ನಾಳೆ ಹೋಗೋಣವಾ?", "ಎಲ್ಲಿಗೆ ಹೋಗ್ತೀವಿ?", "ಇವತ್ತು ಮನೆಯಲ್ಲಿ ಇದ್ದೀರಾ?"],
    romanKannada: "ivattu elligādarū hōgabēkā?"
  },
  {
    english: "Do I still have to do it?",
    kannada: "ನಾನು ಇದನ್ನ ಇನ್ನೂ ಮಾಡಲೇಬೇಕಾ?",
    incorrectOptions: ["ನಾನು ಇದನ್ನು ಮಾಡಲಾ?", "ನೀನು ಮಾಡು", "ಇನ್ನೂ ಮಾಡ್ತೀಯಾ?", "ಮಾಡಿ ಆಯ್ತಾ?"],
    romanKannana: "nānu idanna innū māḍalēbēkā?"
  },
  {
    english: "Can we go outside and decide?",
    kannada: "ನಾವು ಹೊರಗೆ ಹೋಗಿ ತೀರ್ಮಾನ ಮಾಡೋಣ್ವಾ?",
    incorrectOptions: ["ಹೊರಗೆ ಹೋಗೋಣವಾ?", "ತೀರ್ಮಾನ ಯಾವಾಗ?", "ಒಳಗೆ ಹೋಗೋಣವಾ?", "ನಾವು ಯಾವಾಗ ತೀರ್ಮಾನ ಮಾಡೋಣ?"],
    romanKannada: "nāvu horage hōgi tīrmāna māḍōṇvā?"
  },
  {
    english: "What's for breakfast?",
    kannada: "ಬೆಳಿಗ್ಗೆ ಏನು ತಿಂಡಿ?",
    incorrectOptions: ["ರಾತ್ರಿ ಏನು ಊಟ?", "ಮಧ್ಯಾಹ್ನ ಏನು?", "ಬೆಳಿಗ್ಗೆ ಎಲ್ಲಿ?", "ತಿಂಡಿ ಏನು?"],
    romanKannada: "beḷigge ēnu tiṇḍi?"
  },
  {
    english: "Is anyone coming to our house?",
    kannada: "ಯಾರಾದರೂ ನಮ್ಮ ಮನೆಗೆ ಬರುತ್ತಿದ್ದಾರಾ?",
    incorrectOptions: ["ಯಾರು ಮನೆಯಲ್ಲಿ ಇದ್ದಾರೆ?", "ಮನೆಗೆ ಯಾರು ಹೋಗ್ತಾರೆ?", "ಯಾರಾದರೂ ಇಲ್ಲ?", "ಮನೆಯಲ್ಲಿ ಏನು?"],
    romanKannada: "yārādarū namma manege baruttiddārā?"
  },
  {
    english: "Is it time for lunch?",
    kannada: "ಊಟ ಮಾಡೋಣವಾ?",
    incorrectOptions: ["ಊಟ ಯಾವಾಗ?", "ಊಟ ಆಯ್ತಾ?", "ನಿದ್ದೆ ಮಾಡೋಣವಾ?", "ಆಟ ಆಡೋಣವಾ?"],
    romanKannada: "ūṭa māḍōṇavā?"
  },
  {
    english: "I want to watch cartoons for some time.",
    kannada: "ಸ್ವಲ್ಪ ಹೊತ್ತು ಕಾರ್ಟೂನ್ ನೋಡ್ಲಾ.",
    incorrectOptions: ["ಹೆಚ್ಚು ಹೊತ್ತು ಕಾರ್ಟೂನ್ ನೋಡ್ಲಾ?", "ಟಿವಿ ನೋಡ್ಲಾ?", "ಆಟ ಆಡ್ಲಾ?", "ನಿದ್ದೆ ಮಾಡ್ಲಾ?"],
    romanKannana: "svalpa hottu kārṭūn nōḍlā."
  },
  {
    english: "I like to play video games.",
    kannada: "ನನಗೆ ವಿಡಿಯೋ ಆಟ ಆಡೋದು ಇಷ್ಟ.",
    incorrectOptions: ["ನನಗೆ ವಿಡಿಯೋ ಆಟ ಇಷ್ಟ ಇಲ್ಲ.", "ನನಗೆ ಆಟ ಇಷ್ಟ.", "ನನಗೆ ಆಟ ಆಡೋದು ಬೇಡ.", "ನನಗೆ ಟಿವಿ ನೋಡ್ಲಿಕ್ಕೆ ಇಷ್ಟ."],
    romanKannada: "nanage viḍiyō āṭa āḍōdu iṣṭa."
  },
  {
    english: "When is Anna coming home?",
    kannada: "ಅಣ್ಣ ಯಾವಾಗ ಮನೆಗೆ ಬರುತ್ತಾನೆ?",
    incorrectOptions: ["ತಂಗಿ ಯಾವಾಗ ಬರುತ್ತಾಳೆ?", "ಅಣ್ಣ ಎಲ್ಲಿದ್ದಾನೆ?", "ಅಮ್ಮಾ ಯಾವಾಗ ಬರುತ್ತಾಳೆ?", "ಯಾವಾಗ ಬರುತ್ತಾನೆ?"],
    romanKannada: "aṇṇa yāvāga manege baruttāne?"
  },
  {
    english: "Do you need help with the dishes?",
    kannada: "ಪಾತ್ರೆ ತೊಳೆಯಲು ಸಹಾಯ ಬೇಕಾ?",
    incorrectOptions: ["ಪಾತ್ರೆ ಎಲ್ಲಿದೆ?", "ಸಹಾಯ ಬೇಕಾ?", "ಅಡುಗೆಗೆ ಸಹಾಯ ಬೇಕಾ?", "ಪಾತ್ರೆ ತೊಳೆಯುವಿಯಾ?"],
    romanKannada: "pātre toḷeyalu sahāya bēkā?"
  },
  {
    english: "Can I make my own breakfast?",
    kannada: "ನಾನೇ ಬೆಳಿಗ್ಗೆ ತಿಂಡಿ ಮಾಡಿಕೊಳ್ಳಬಹುದಾ?",
    incorrectOptions: ["ನಾನು ತಿಂಡಿ ಮಾಡಲಾ?", "ನೀನು ತಿಂಡಿ ಮಾಡು", "ನಾನು ಊಟ ಮಾಡಿಕೊಳ್ಳಲಾ?", "ಬೆಳಿಗ್ಗೆ ಏನು?"],
    romanKannada: "nānē beḷigge tiṇḍi māḍikoḷḷabahudā?"
  },
  {
    english: "I want chocolate milk.",
    kannada: "ನನಗೆ ಚಾಕೋಲೇಟ್ ಹಾಲು ಬೇಕು.",
    incorrectOptions: ["ನನಗೆ ಹಾಲು ಬೇಕು.", "ನನಗೆ ನೀರು ಬೇಕು.", "ನನಗೆ ಚಾಕೋಲೇಟ್ ಬೇಕು.", "ನನಗೆ ಹಾಲು ಇಷ್ಟ ಇಲ್ಲ."],
    romanKannada: "nanage cākōlēṭ hālu bēku."
  },
  {
    english: "I have to finish my homework.",
    kannada: "ನನ್ನ ಮನೆಗೆಲಸ ಮುಗಿಸಬೇಕು.",
    incorrectOptions: ["ನನ್ನ ಮನೆಗೆಲಸ ಬೇಡ.", "ನಾನು ಮನೆಗೆಲಸ ಮಾಡಿದೆ.", "ಮನೆಗೆಲಸ ಯಾವಾಗ?", "ನಾನು ಓದುವೆ."],
    romanKannada: "nanna mane gelasa mugisabēku."
  },
  {
    english: "I will go take a bath now.",
    kannada: "ನಾನು ಈಗ ಸ್ನಾನಕ್ಕೆ ಹೋಗ್ತೀನಿ.",
    incorrectOptions: ["ನಾನು ಈಗ ಸ್ನಾನ ಮಾಡಲ್ಲ.", "ನಾನು ಈಗ ಹೋಗ್ತೀನಿ.", "ಸ್ನಾನ ಯಾವಾಗ?", "ನಾನು ಆಡ್ತೀನಿ."],
    romanKannada: "nānu īga snānakke hōgtīni."
  },
  {
    english: "I played with my friends at school.",
    kannada: "ನಾನು ಶಾಲೆಯಲ್ಲಿ ಗೆಳೆಯರೊಂದಿಗೆ ಆಡಿದೆ.",
    incorrectOptions: ["ನಾನು ಮನೆಯಲ್ಲಿ ಆಡಿದೆ.", "ನಾನು ಶಾಲೆಯಲ್ಲಿ ಓದಿದೆ.", "ಗೆಳೆಯರು ಎಲ್ಲಿದ್ದಾರೆ?", "ನಾನು ಆಟ ಆಡಲ್ಲ."],
    romanKannana: "nānu śāleyalli geḷeyarondege āḍide."
  },
  {
    english: "Can I go to Ian’s house to play?",
    kannada: "ಇಯಾನ್ ಮನೆಗೆ ಆಟಕ್ಕೆ ಹೋಗಬಹುದಾ?",
    incorrectOptions: ["ಯಾನ್ ಮನೆ ಎಲ್ಲಿದೆ?", "ಆಟಕ್ಕೆ ಹೋಗಲಾ?", "ಮನೆಗೆ ಹೋಗಲಾ?", "ಇಯಾನ್ ಜೊತೆ ಆಡ್ಲಾ?"],
    romanKannada: "iyān manege āṭakke hōgabahudā?"
  },
  {
    english: "I have to do my Kumon homework.",
    kannada: "ನಾನು ಕುಮೋನ್ ಮನೆಗೆಲಸ ಮುಗಿಸಬೇಕು.",
    incorrectOptions: ["ನಾನು ಕುಮೋನ್ ಮಾಡಿದೆ.", "ನನಗೆ ಕುಮೋನ್ ಬೇಡ.", "ಕುಮೋನ್ ಯಾವಾಗ?", "ಮನೆಗೆಲಸ ಮಾಡು."],
    romanKannana: "nānu kumōn mane gelasa mugisabēku."
  },
  {
    english: "Can I watch TV?",
    kannada: "ನಾನು ಟಿವಿ ನೋಡಬಹುದಾ?",
    incorrectOptions: ["ನಾನು ಟಿವಿ ನೋಡ್ಲಾ?", "ಟಿವಿ ಬೇಡ?", "ಟಿವಿ ಆನ್ ಮಾಡು", "ನಾನು ಆಟ ಆಡ್ಲಾ?"],
    romanKannada: "nānu ṭivi nōḍabahudā?"
  },
  {
    english: "What's the food, Amma?",
    kannada: "ಅಮ್ಮಾ, ಊಟಕ್ಕೆ ಏನು?",
    incorrectOptions: ["ಅಮ್ಮಾ, ಎಲ್ಲಿ?", "ಅಮ್ಮಾ, ಯಾವಾಗ?", "ಅಮ್ಮಾ, ಏನು ಮಾಡ್ತಾ ಇದ್ದೀಯಾ?", "ಊಟಕ್ಕೆ ಏನು?"],
    romanKannada: "ammā, ūṭakke ēnu?"
  },
  {
    english: "Can you give me Froot Loops or Maggi?",
    kannada: "ನೀನು ನನಗೆ ಫ್ರೂಟ್ ಲೂಪ್ಸ್ ಅಥವಾ ಮ್ಯಾಗಿ ಕೊಡ್ತಿಯಾ?",
    incorrectOptions: ["ಫ್ರೂಟ್ ಲೂಪ್ಸ್ ಬೇಕು?", "ಮ್ಯಾಗಿ ಬೇಡ?", "ನೀನು ನನಗೆ ಕೊಡು?", "ಫ್ರೂಟ್ ಲೂಪ್ಸ್ ಎಲ್ಲಿದೆ?"],
    romanKannada: "nīnu nanage frūṭ lūps athavā myāgi koḍtiyā?"
  },
  {
    english: "Appa, come play with me.",
    kannada: "ಅಪ್ಪಾ, ನನ್ನ ಜೊತೆಗೆ ಆಟಕ್ಕೆ ಬಾ.",
    incorrectOptions: ["ಅಪ್ಪಾ, ಎಲ್ಲಿದ್ದೀರಾ?", "ಅಪ್ಪಾ, ಕೆಲಸ ಮಾಡು", "ಅಪ್ಪಾ, ಆಟ ಆಡಲ್ಲ?", "ನನ್ನ ಜೊತೆ ಆಟ ಆಡು."],
    romanKannada: "appā, nanna jotage āṭakke bā."
  },
  {
    english: "I want to sleep for some more time.",
    kannada: "ನನಗೆ ಇನ್ನೂ ಸ್ವಲ್ಪ ಹೊತ್ತು ಮಲಗಬೇಕು.",
    incorrectOptions: ["ನನಗೆ ಈಗ ನಿದ್ದೆ ಬೇಡ.", "ನಾನು ಎದ್ದೆ.", "ನ ನಾನು ಕೆಲಸ ಮಾಡಬೇಕು.", "ನನಗೆ ಮಲಗಲಿಕ್ಕೆ ಇಷ್ಟ ಇಲ್ಲ."],
    romanKannana: "nanage innū svalpa hottu malagabēku."
  },
  {
    english: "Appa, can you give me a coloring page?",
    kannada: "ಅಪ್ಪಾ, ನನಗೆ ಬಣ್ಣ ಹಚ್ಚುವ ಪುಟ ಕೊಡ್ತಿಯಾ?",
    incorrectOptions: ["ಅಪ್ಪಾ, ಬಣ್ಣ ಎಲ್ಲಿದೆ?", "ನನಗೆ ಬಣ್ಣ ಬೇಕು?", "ಪುಟ ಕೊಡು", "ಅಪ್ಪಾ, ಪುಸ್ತಕ ಕೊಡು."],
    romanKannada: "appā, nanage baṇṇa haccuva puṭa koḍtiyā?"
  },
  {
    english: "Just stop it, OK?",
    kannada: "ಬೇಡ, ಹಾಗೆ ಮಾಡಬೇಡ?",
    incorrectOptions: ["ಹಾಗೆ ಮಾಡು.", "ನಿಲ್ಲಿಸು", "ಬೇಡ", "ಓಕೆ?"],
    romanKannada: "bēḍa, hāge māḍabēḍa?"
  },
  {
    english: "What is the time now?",
    kannada: "ಈಗ ಎಷ್ಟು ಗಂಟೆ ಆಯ್ತು?",
    incorrectOptions: ["ಟೈಮ್ ಯಾವಾಗ?", "ಈಗ ಯಾವಾಗ?", "ಗಂಟೆ ಏನು?", "ಟೈಮ್ ಎಲ್ಲಿ?"],
    romanKannana: "īga eṣṭu gaṇṭe āytu?"
  },
  {
    english: "Can you fill my water bottle?",
    kannada: "ನನ್ನ ನೀರಿನ ಬಾಟಲಿ ತುಂಬಿಸುತ್ತೀಯಾ?",
    incorrectOptions: ["ನೀರಿನ ಬಾಟಲಿ ಎಲ್ಲಿದೆ?", "ನನಗೆ ನೀರು ಕೊಡು.", "ಬಾಟಲಿ ತುಂಬಿಸು", "ನನ್ನ ಬಾಟಲಿ."],
    romanKannada: "nanna nīrina bāṭali tumbisuttīyā?"
  },
  {
    english: "I will come, wait.",
    kannada: "ಬರುತ್ತೀನಿ, ಸ್ವಲ್ಪ ತಡಿ.",
    incorrectOptions: ["ನಾನು ಬರಲ್ಲ.", "ನಾನು ಈಗ ಹೋಗ್ತೀನಿ.", "ಸ್ವಲ್ಪ ತಡಿ.", "ನೀನು ಹೋಗು."],
    romanKannada: "baruttīni, svalpa taḍi."
  },
  {
    english: "Appa/Amma, are you done with your work?",
    kannada: "ಅಪ್ಪಾ/ಅಮ್ಮಾ, ನಿನ್ನ ಕೆಲಸ ಮುಗಿತಾ?",
    incorrectOptions: ["ಕೆಲಸ ಯಾವಾಗ?", "ನೀನು ಕೆಲಸ ಮಾಡು.", "ಕೆಲಸ ಆಯ್ತಾ?", "ಅಮ್ಮಾ ಎಲ್ಲಿದ್ದೀರಾ?"],
    romanKannada: "appā/ammā, ninna kelasa mugitā?"
  },
  {
    english: "Is it morning time in India? Shall we call Vijayamma?",
    kannada: "ಭಾರತದಲ್ಲಿ ಈಗ ಬೆಳಿಗ್ಗೆ ನಾ? ವಿಜಯಮ್ಮನಿಗೆ ಫೋನ್ ಮಾಡೋಣವೆ?",
    incorrectOptions: ["ಭಾರತದಲ್ಲಿ ಈಗ ರಾತ್ರಿ ನಾ?", "ವಿಜಯಮ್ಮ ಎಲ್ಲಿದೆ?", "ಫೋನ್ ಮಾಡು", "ಭಾರತದಲ್ಲಿ ಈಗ ಸಂಜೆ ನಾ?"],
    romanKannada: "bhāratadalli īga beḷigge nā? vijayammānige phōn māḍōṇave?"
  },
  {
    english: "I like to play in the bathtub for some more time.",
    kannada: "ನಾನು ಇನ್ನೂ ಸ್ವಲ್ಪ ಹೊತ್ತು ಬಾತ್‌ಟಬ್‌ನಲ್ಲಿ ಆಡ್ತೀನಿ.",
    incorrectOptions: ["ನಾನು ಬಾತ್‌ಟಬ್‌ನಲ್ಲಿ ಆಟ ಆಡಲ್ಲ.", "ಸ್ವಲ್ಪ ಹೊತ್ತು ಆಡ್ತೀನಿ.", "ಬಾತ್‌ಟಬ್ ಎಲ್ಲಿದೆ?", "ನಾನು ಈಗ ಸ್ನಾನ ಮಾಡ್ತೀನಿ."],
    romanKannana: "nānu innū svalpa hottu bāth‌ṭabnalli āḍtīni."
  },
  {
    english: "My markers are not working. Can you buy me a new set?",
    kannada: "ನನ್ನ ಮಾರ್ಕರ್‌ಗಳು ಬರೀತಿಲ್ಲ. ಹೊಸತು ತಂದು ಕೊಡ್ತಿಯಾ?",
    incorrectOptions: ["ಮಾರ್ಕರ್‌ಗಳು ಎಲ್ಲಿದೆ?", "ನನಗೆ ಹೊಸತು ಬೇಕು.", "ಬರೀತಿದೆ", "ಕೊಂಡು ಕೊಡು."],
    romanKannana: "nanna mārkar’gaḷu barītilla. hosatu tandu koḍtiyā?"
  },
  {
    english: "I always feel like eating pizza.",
    kannada: "ನನಗೆ ಯಾವಾಗಲೂ ಪಿಜ್ಜಾ ತಿನ್ನಬೇಕು ಆನ್ನಿಸುತ್ತದೆ.",
    incorrectOptions: ["ನನಗೆ ಪಿಜ್ಜಾ ಇಷ್ಟ ಇಲ್ಲ.", "ನಾನು ಪಿಜ್ಜಾ ತಿಂದೆ.", "ಯಾವಾಗಲೂ ತಿನ್ನಬೇಕು.", "ಪಿಜ್ಜಾ ಬೇಡ."],
    romanKannada: "nanage yāvāgalū pijā tinnabēku ānnisuttade."
  },
  {
    english: "Check my height.",
    kannada: "ನಾನು ಎಷ್ಟು ಎತ್ತರ ನೋಡು.",
    incorrectOptions: ["ನನ್ನ ಎತ್ತರ ಎಷ್ಟು?", "ನೋಡು", "ನಾನು ಎತ್ತರ ಇದ್ದೀನಿ", "ಎತ್ತರ ನೋಡು."],
    romanKannada: "nānu eṣṭu ettara nōḍu."
  },
  {
    english: "Appa is in a call.",
    kannada: "ಅಪ್ಪಾ ಕರೆ ಮಾಡ್ತಾ ಇದ್ದಾರೆ.",
    incorrectOptions: ["ಅಪ್ಪಾ ಎಲ್ಲಿದ್ದೀರಾ?", "ಅಪ್ಪಾ ಕೆಲಸ ಮಾಡ್ತಾ ಇದ್ದಾರೆ.", "ಕರೆ ಮಾಡ್ತಾ ಇದ್ದಾರೆ.", "ಅಮ್ಮಾ ಕರೆ ಮಾಡ್ತಾ ಇದ್ದಾರೆ."],
    romanKannada: "appā kare māḍtā iddāre."
  },
  {
    english: "What can I build with Lego? Give me some idea.",
    kannada: "ಲೆಗೋದಿಂದ ನಾನು ಏನು ಕಟ್ಟಬಹುದು? ನನಗೆ ಉಪಾಯ ಹೇಳು.",
    incorrectOptions: ["ಲೆಗೋ ಎಲ್ಲಿದೆ?", "ನಾನು ಏನು ಕಟ್ಟಲಿ?", "ನನಗೆ ಉಪಾಯ ಬೇಕು.", "ಲೆಗೋ ಬೇಡ."],
    romanKannana: "legōdinda nānu ēnu kaṭṭabahudu? nanage upāya hēḷu."
  },
  {
    english: "Can we go to the park?",
    kannada: "ನಾವು ಪಾರ್ಕ್‌ಗೆ ಹೋಗೋಣವಾ?",
    incorrectOptions: ["ಪಾರ್ಕ್ ಎಲ್ಲಿದೆ?", "ನಾವು ಹೋಗೋಣವಾ?", "ನಾವು ಪಾರ್ಕ್‌ಗೆ ಹೋಗಲ್ಲ?", "ಹೋಗೋಣವಾ?"],
    romanKannada: "nāvu pārk'ge hōgōṇavā?"
  },
  {
    english: "What shall I do now? It’s boring.",
    kannada: "ನಾನು ಏನು ಮಾಡಲಿ? ಬೋರ್ ಆಗುತ್ತಿದೆ.",
    incorrectOptions: ["ನನಗೆ ಬೋರ್ ಆಗಿದೆ.", "ನಾನು ಏನು ಮಾಡಲಿ?", "ಖುಷಿಯಾಗಿದೆ.", "ಆಟ ಆಡು."],
    romanKannada: "nānu ēnu māḍali? bōr āguttide."
  },
  {
    english: "Can we do one origami craft?",
    kannada: "ನಾವೊಂದು ಒರಿಗಾಮಿ ಕ್ರಾಫ್ಟ್ ಮಾಡೋಣವೇ?",
    incorrectOptions: ["ಒರಿಗಾಮಿ ಕ್ರಾಫ್ಟ್ ಎಲ್ಲಿದೆ?", "ನಾವು ಮಾಡೋಣವಾ?", "ಕ್ರಾಫ್ಟ್ ಮಾಡು", "ಒರಿಗಾಮಿ ಬೇಡ."],
    romanKannada: "nāvondu origāmi krāphṭ māḍōṇave?"
  },
  {
    english: "What should I do now?",
    kannada: "ನಾನು ಈಗ ಏನು ಮಾಡ್ಲಿ?",
    incorrectOptions: ["ನಾನು ಏನು ಮಾಡಲಿ?", "ಈಗ ಏನು?", "ನಾನು ಈಗ ಮಾಡಲ್ಲ?", "ಏನು ಮಾಡು?"],
    romanKannada: "nānu īga ēnu māḍli?"
  },
  {
    english: "Should I write this?",
    kannada: "ನಾನು ಇದನ್ನು ಬರೆಯಬೇಕಾ?",
    incorrectOptions: ["ನಾನು ಇದನ್ನು ಬರೆದೆ?", "ನಾನು ಇದನ್ನು ಓದಿದೆ?", "ನಾನು ಬರೆಯಬೇಕು.", "ಬರೆಯಬೇಡ."],
    romanKannana: "nānu idannu bareyabēkā?"
  },
  {
    english: "I want water.",
    kannada: "ನನಗೆ ನೀರು ಬೇಕು",
    incorrectOptions: ["ನನಗೆ ಊಟ ಬೇಕು", "ನನಗೆ ಹಾಲು ಬೇಕು", "ನನಗೆ ನೀರು ಬೇಡ", "ನೀರು ಎಲ್ಲಿದೆ?"],
    romanKannada: "nanage nīru bēku"
  },
  {
    english: "I had gone outside.",
    kannada: "ನಾನು ಹೊರಗೆ ಹೋಗಿದ್ದೆ",
    incorrectOptions: ["ನಾನು ಹೊರಗೆ ಹೋಗಲ್ಲ", "ನಾನು ಒಳಗೆ ಹೋಗಿದ್ದೆ", "ನಾನು ಮನೆಯಲ್ಲಿ ಇದ್ದೆ", "ನಾನು ಹೊರಗೆ ಹೋಗ್ತೀನಿ"],
    romanKannana: "nānu horage hōgiddē"
  },
  {
    english: "I ate sweet food for Dasara festival.",
    kannada: "ನಾನು ದಸರಾ ಹಬ್ಬಕ್ಕೆ ಸಿಹಿಊಟ ಮಾಡಿದೆ",
    incorrectOptions: ["ನಾನು ದಸರಾ ಹಬ್ಬಕ್ಕೆ ಸಿಹಿ ಊಟ ಮಾಡಲ್ಲ", "ನಾನು ದಸರಾ ಹಬ್ಬಕ್ಕೆ ಸಿಹಿ ತಿಂಡಿ ಮಾಡಿದೆ", "ಹಬ್ಬ ಯಾವಾಗ?", "ಊಟ ಮಾಡಿದೆ"],
    romanKannada: "nānu dasarā habbakke sihiūṭa māḍide"
  },
  {
    english: "Appa, do I have class today?",
    kannada: "ಅಪ್ಪ ನನ್ನ ಕ್ಲಾಸ್ ಇದೆಯಾ ಇವತ್ತು",
    incorrectOptions: ["ಅಪ್ಪಾ, ಕ್ಲಾಸ್ ಯಾವಾಗ?", "ಇವತ್ತು ಕ್ಲಾಸ್ ಇಲ್ಲ?", "ಅಪ್ಪಾ, ನೀನು ಕ್ಲಾಸ್ ಹೋಗು", "ಕ್ಲಾಸ್ ಇದೆಯಾ?"],
    romanKannana: "appā nanna klās ideyā ivattu"
  },
  {
    english: "I will sleep.",
    kannada: "ನಾನು ಮಲಗುತ್ತೇನೆ",
    incorrectOptions: ["ನಾನು ಎದ್ದೆ", "ನಾನು ಆಡ್ತೀನಿ", "ನಾನು ಓದ್ತೀನಿ", "ನಾನು ಮಲಗಲ್ಲ"],
    romanKannada: "nānu malaguttēne"
  },
  {
    english: "It rained today.",
    kannada: "ಇವತ್ತು ಮಳೆ ಬಂದಿತ್ತು",
    incorrectOptions: ["ಇವತ್ತು ಮಳೆ ಬರಲ್ಲ", "ಇವತ್ತು ಬಿಸಿಲು ಇತ್ತು", "ಇವತ್ತು ಚಳಿ ಇತ್ತು", "ಮಳೆ ಯಾವಾಗ?"],
    romanKannada: "ivattu maḷe bandittu"
  },
  {
    english: "I drew a picture.",
    kannada: "ನಾನು ಚಿತ್ರ ಬಿಡಿಸಿದೆ",
    incorrectOptions: ["ನಾನು ಚಿತ್ರ ಬಿಡಿಸಲ್ಲ", "ನಾನು ಚಿತ್ರ ನೋಡಿದೆ", "ನಾನು ಚಿತ್ರ ಬರೆದೆ", "ಚಿತ್ರ ಎಲ್ಲಿದೆ?"],
    romanKannada: "nānu citra biḍiside"
  },
  {
    english: "Tomorrow is Thursday, Kannada class is there.",
    kannada: "ನಾಳೆ ಗುರುವಾರ ಕನ್ನಡ ತರಗತಿ ಇದೆ.",
    incorrectOptions: ["ನಾಳೆ ಕನ್ನಡ ತರಗತಿ ಇಲ್ಲ", "ಇವತ್ತು ಕನ್ನಡ ತರಗತಿ ಇದೆ", "ಗುರುವಾರ ಯಾವಾಗ?", "ತರಗತಿ ಇದೆ"],
    romanKannada: "nāḷe guruvāra kannaḍa taragati ide."
  },
  {
    english: "I went to the temple.",
    kannada: "ನಾನು ದೇವಸ್ಥಾನಕ್ಕೆ ಹೋಗಿದ್ದೆ",
    incorrectOptions: ["ನಾನು ದೇವಸ್ಥಾನಕ್ಕೆ ಹೋಗಲ್ಲ", "ನಾನು ದೇವಸ್ಥಾನದಲ್ಲಿ ಇದ್ದೆ", "ದೇವಸ್ಥಾನ ಎಲ್ಲಿದೆ?", "ನಾನು ಮನೆಗೆ ಹೋಗಿದ್ದೆ"],
    romanKannana: "nānu dēvasthānakke hōgiddē"
  },
  {
    english: "I bought new clothes.",
    kannada: "ನಾನು ಹೊಸ ಬಟ್ಟೆ ಖರೀದಿಸಿದೆ",
    incorrectOptions: ["ನಾನು ಹಳೆ ಬಟ್ಟೆ ಖರೀದಿಸಿದೆ", "ನಾನು ಹೊಸ ಬಟ್ಟೆ ಮಾರಿದೆ", "ಬಟ್ಟೆ ಎಲ್ಲಿದೆ?", "ನಾನು ಖರೀದಿಸಿದೆ"],
    romanKannada: "nānu hosa baṭṭe kharīdiside"
  },
  {
    english: "I ate Kesari Bath made for the festival.",
    kannada: "ನಾನು ಹಬ್ಬಕ್ಕೆ ಮಾಡಿದ ಕೇಸರಿಬಾತ್ ತಿಂದೆ",
    incorrectOptions: ["ನಾನು ಹಬ್ಬಕ್ಕೆ ಕೇಸರಿಬಾತ್ ಮಾಡಲ್ಲ", "ನಾನು ಹಬ್ಬಕ್ಕೆ ಕೇಸರಿಬಾತ್ ತಿಂದಿಲ್ಲ", "ಹಬ್ಬ ಯಾವಾಗ?", "ಕೇಸರಿಬಾತ್ ತಿನ್ನು"],
    romanKannada: "nānu habbakke māḍida kēsariāth tinde"
  },
  {
    english: "I spoke with grandma.",
    kannada: "ನಾನು ಅಜ್ಜಿಯ ಹತ್ತಿರ ಮಾತಾಡಿದೆ",
    incorrectOptions: ["ನಾನು ಅಜ್ಜಿಯ ಹತ್ತಿರ ಮಾತಾಡಲ್ಲ", "ನಾನು ಅಜ್ಜಿಯ ಹತ್ತಿರ ನೋಡಿದೆ", "ಅಜ್ಜಿ ಎಲ್ಲಿದೆ?", "ನಾನು ಮಾತಾಡಿದೆ"],
    romanKannada: "nānu ajjīya hattira mātāḍide"
  },
  {
    english: "I drank milk.",
    kannada: "ನಾನು ಹಾಲು ಕುಡಿದೆ",
    incorrectOptions: ["ನಾನು ನೀರು ಕುಡಿದೆ", "ನಾನು ಹಾಲು ಕುಡಿಯಲ್ಲ", "ನಾನು ಹಾಲು ತಿಂದೆ", "ಹಾಲು ಎಲ್ಲಿದೆ?"],
    romanKannada: "nānu hālu kuḍide"
  },
  {
    english: "I like dosa.",
    kannada: "ನನಗೆ ದೋಸೆ ಇಷ್ಟ",
    incorrectOptions: ["ನನಗೆ ದೋಸೆ ಇಷ್ಟ ಇಲ್ಲ", "ನನಗೆ ಇಡ್ಲಿ ಇಷ್ಟ", "ದೋಸೆ ಎಲ್ಲಿದೆ?", "ನನಗೆ ತಿಂಡಿ ಇಷ್ಟ"],
    romanKannada: "nanage dōse iṣṭa"
  },
  {
    english: "It's cold outside.",
    kannada: "ಹೊರಗಡೆ ಚಳಿ ಇದೆ",
    incorrectOptions: ["ಹೊರಗಡೆ ಬಿಸಿಲು ಇದೆ", "ಹೊರಗಡೆ ಸೆಕೆ ಇದೆ", "ಒಳಗಡೆ ಚಳಿ ಇದೆ", "ಚಳಿ ಇಲ್ಲ"],
    romanKannana: "horagaḍe caḷi ide"
  },
  {
    english: "Do not trouble/irritate me",
    kannada: "ನನಗೆ ಕಿರಿಕಿರಿ ಮಾಡಬೇಡ",
    incorrectOptions: ["ನನಗೆ ಸಹಾಯ ಮಾಡು", "ನನಗೆ ಸಂತೋಷ ಮಾಡು", "ನನಗೆ ಕಿರಿಕಿರಿ ಮಾಡು", "ನನಗೆ ಬೇಡ"],
    romanKannada: "nanage kirikiri māḍabēḍa"
  },
  {
    english: "I read a book.",
    kannada: "ನಾನು ಪುಸ್ತಕ ಓದುತ್ತೇನೆ",
    incorrectOptions: ["ನಾನು ಪುಸ್ತಕ ಓದಿಲ್ಲ", "ನಾನು ಪುಸ್ತಕ ಬರೆಯುತ್ತೇನೆ", "ನಾನು ಟಿವಿ ನೋಡುತ್ತೇನೆ", "ಪುಸ್ತಕ ಎಲ್ಲಿದೆ?"],
    romanKannana: "nānu pustaka ōduttēne"
  },
  {
    english: "School was good today.",
    kannada: "ಇವತ್ತು ಶಾಲೆ ಚೆನ್ನಾಗಿತ್ತು",
    incorrectOptions: ["ಇವತ್ತು ಶಾಲೆ ಚೆನ್ನಾಗಿರಲಿಲ್ಲ", "ಶಾಲೆ ಯಾವಾಗ?", "ಇವತ್ತು ಮನೆ ಚೆನ್ನಾಗಿತ್ತು", "ಶಾಲೆ ಇಲ್ಲ"],
    romanKannada: "ivattu śāle cennāgittu"
  },
  {
    english: "Read Kannada.",
    kannada: "ಕನ್ನಡ ಓದು",
    incorrectOptions: ["ಕನ್ನಡ ಬರೆಯು", "ಕನ್ನಡ ಮಾತಾಡು", "ಇಂಗ್ಲಿಷ್ ಓದು", "ನೋಡು"],
    romanKannada: "kannaḍa ōdu"
  },
  {
    english: "There is an exam tomorrow.",
    kannada: "ನಾಳೆ ಪರೀಕ್ಷೆ ಇದೆಯಂತೆ",
    incorrectOptions: ["ನಾಳೆ ಪರೀಕ್ಷೆ ಇಲ್ಲ", "ಇವತ್ತು ಪರೀಕ್ಷೆ ಇದೆ", "ಪರೀಕ್ಷೆ ಯಾವಾಗ?", "ನಾಳೆ ಶಾಲೆ ಇದೆ"],
    romanKannada: "nāḷe parīkṣe ideyante"
  },
  {
    english: "Dhruthi, take a bath.",
    kannada: "ಧೃತಿ ಸ್ನಾನಮಾಡು",
    incorrectOptions: ["ಧೃತಿ ಊಟ ಮಾಡು", "ಧೃತಿ ಆಟ ಆಡು", "ಧೃತಿ ಮಲಗು", "ಧೃತಿ ಸ್ನಾನ ಮಾಡಲ್ಲ"],
    romanKannada: "dhṛti snānamāḍu"
  },
  {
    english: "Amma, can you give me the phone?",
    kannada: "ಅಮ್ಮಾ ಪೋನ್ ಕೊಡುತ್ತೀಯಾ",
    incorrectOptions: ["ಅಪ್ಪಾ ಪೋನ್ ಕೊಡುತ್ತೀಯಾ", "ಪೋನ್ ಎಲ್ಲಿದೆ?", "ನನಗೆ ಪೋನ್ ಬೇಡ", "ಪೋನ್ ಕೊಡು"],
    romanKannada: "ammā phōn koḍuttīyā"
  },
  {
    english: "I will go to school.",
    kannada: "ಶಾಲೆಗೆ ಹೋಗುತ್ತೇನೆ",
    incorrectOptions: ["ಶಾಲೆಗೆ ಹೋಗಲ್ಲ", "ಮನೆಗೆ ಹೋಗುತ್ತೇನೆ", "ಶಾಲೆ ಎಲ್ಲಿದೆ?", "ನಾನು ಹೋಗುತ್ತೇನೆ"],
    romanKannada: "śālege hōguttēne"
  },
  {
    english: "Can you tie my hair?",
    kannada: "ನನ್ನ ಕೂದಲು ಕಟ್ಟುತ್ತೀಯಾ",
    incorrectOptions: ["ನನ್ನ ಕೂದಲು ಬಿಡು", "ನನ್ನ ಕೂದಲು ಬಾಚು", "ಕೂದಲು ಎಲ್ಲಿದೆ?", "ನನ್ನ ಕೂದಲು ಬೇಕು"],
    romanKannada: "nanna kūdalu kaṭṭuttīyā"
  },
  {
    english: "Come on",
    kannada: "ಬನ್ನಿ",
    incorrectOptions: ["ನೀನು ಎಲ್ಲಿದ್ದೀಯಾ?", "ಏನು ಮಾಡ್ತಿದ್ದೀಯಾ?", "ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ?", "ಎಲ್ಲಿಗೆ ಹೋಗ್ತಾ ಇದ್ದೀರಾ?"],
    romanKannada: "banni"
  },
  {
    english: "Forgive me",
    kannada: "ಕ್ಷಮಿಸಿ",
    incorrectOptions: ["ನೀನು ಎಲ್ಲಿದ್ದೀಯಾ?", "ಏನು ಮಾಡ್ತಿದ್ದೀಯಾ?", "ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ?", "ಎಲ್ಲಿಗೆ ಹೋಗ್ತಾ ಇದ್ದೀರಾ?"],
    romanKannada: "kshamisi"
  },
  {
    english: "Are you coming with me?",
    kannada: "ನನ್ನ ಜೊತೆ ಬರ್ತೀರಾ?",
    incorrectOptions: ["ನೀನು ಎಲ್ಲಿದ್ದೀಯಾ?", "ಏನು ಮಾಡ್ತಿದ್ದೀಯಾ?", "ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ?", "ಎಲ್ಲಿಗೆ ಹೋಗ್ತಾ ಇದ್ದೀರಾ?"],
    romanKannada: "nanna jothe barthira?"
  },
  {
    english: "I don’t have time",
    kannada: "ನನಗೆ ಸಮಯ ಇಲ್ಲ",
    incorrectOptions: ["ನೀನು ಎಲ್ಲಿದ್ದೀಯಾ?", "ಏನು ಮಾಡ್ತಿದ್ದೀಯಾ?", "ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ?", "ಎಲ್ಲಿಗೆ ಹೋಗ್ತಾ ಇದ್ದೀರಾ?"],
    romanKannada: "nanage samaya illa"
  },
  {
    english: "What do you think?",
    kannada: "ನಿಮ್ಮ ಅಭಿಪ್ರಾಯ ಏನು?",
    incorrectOptions: ["ನೀನು ಎಲ್ಲಿದ್ದೀಯಾ?", "ಏನು ಮಾಡ್ತಿದ್ದೀಯಾ?", "ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ?", "ಎಲ್ಲಿಗೆ ಹೋಗ್ತಾ ಇದ್ದೀರಾ?"],
    romanKannada: "nimma abhipraya enu?"
  },
  {
    english: "It doesn’t matter.",
    kannada: "ಪರವಾಗಿಲ್ಲ",
    incorrectOptions: ["ನೀನು ಎಲ್ಲಿದ್ದೀಯಾ?", "ಏನು ಮಾಡ್ತಿದ್ದೀಯಾ?", "ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ?", "ಎಲ್ಲಿಗೆ ಹೋಗ್ತಾ ಇದ್ದೀರಾ?"],
    romanKannada: "parvagilla"
  },
  {
    english: "What are your hobbies?",
    kannada: "ನಿಮ್ಮ ಹವ್ಯಾಸಗಳು ಯಾವುವು?",
    incorrectOptions: ["ನೀನು ಎಲ್ಲಿದ್ದೀಯಾ?", "ಏನು ಮಾಡ್ತಿದ್ದೀಯಾ?", "ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ?", "ಎಲ್ಲಿಗೆ ಹೋಗ್ತಾ ಇದ್ದೀರಾ?"],
    romanKannada: "nimma havyasagalu yavuvu?"
  },
  {
    english: "What do you need?",
    kannada: "ನಿಮಗೆ ಏನು ಬೇಕು?",
    incorrectOptions: ["ನೀನು ಎಲ್ಲಿದ್ದೀಯಾ?", "ಏನು ಮಾಡ್ತಿದ್ದೀಯಾ?", "ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ?", "ಎಲ್ಲಿಗೆ ಹೋಗ್ತಾ ಇದ್ದೀರಾ?"],
    romanKannada: "nimage enu beku?"
  },
  {
    english: "Absolutely not.",
    kannada: "ಖಂಡಿತ ಇಲ್ಲ",
    incorrectOptions: ["ನೀನು ಎಲ್ಲಿದ್ದೀಯಾ?", "ಏನು ಮಾಡ್ತಿದ್ದೀಯಾ?", "ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ?", "ಎಲ್ಲಿಗೆ ಹೋಗ್ತಾ ಇದ್ದೀರಾ?"],
    romanKannada: "khanditha illa"
  },
  {
    english: "I admire you",
    kannada: "ನಾನು ನಿಮ್ಮನ್ನು ಮೆಚ್ಚುತ್ತೇನೆ",
    incorrectOptions: ["ನೀನು ಎಲ್ಲಿದ್ದೀಯಾ?", "ಏನು ಮಾಡ್ತಿದ್ದೀಯಾ?", "ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ?", "ಎಲ್ಲಿಗೆ ಹೋಗ್ತಾ ಇದ್ದೀರಾ?"],
    romanKannada: "nanu nimmanu mechuttene"
  },
  {
    english: "Is all good?",
    kannada: "ಎಲ್ಲಾ ಚೆನ್ನಾಗಿದೆಯಾ?",
    incorrectOptions: ["ನೀನು ಎಲ್ಲಿದ್ದೀಯಾ?", "ಏನು ಮಾಡ್ತಿದ್ದೀಯಾ?", "ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ?", "ಎಲ್ಲಿಗೆ ಹೋಗ್ತಾ ಇದ್ದೀರಾ?"],
    romanKannada: "ella chennagiddeya?"
  },
  {
    english: "I knew it.",
    kannada: "ನನಗೆ ಗೊತ್ತಿತ್ತು",
    incorrectOptions: ["ನೀನು ಎಲ್ಲಿದ್ದೀಯಾ?", "ಏನು ಮಾಡ್ತಿದ್ದೀಯಾ?", "ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ?", "ಎಲ್ಲಿಗೆ ಹೋಗ್ತಾ ಇದ್ದೀರಾ?"],
    romanKannada: "nanage gothithu"
  },
  {
    english: "It’s ok",
    kannada: "ಸರಿ ಇದೆ",
    incorrectOptions: ["ನೀನು ಎಲ್ಲಿದ್ದೀಯಾ?", "ಏನು ಮಾಡ್ತಿದ್ದೀಯಾ?", "ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ?", "ಎಲ್ಲಿಗೆ ಹೋಗ್ತಾ ಇದ್ದೀರಾ?"],
    romanKannada: "sari ide"
  },
  {
    english: "I decline!",
    kannada: "ನನಗೆ ಬೇಡ",
    incorrectOptions: ["ನೀನು ಎಲ್ಲಿದ್ದೀಯಾ?", "ಏನು ಮಾಡ್ತಿದ್ದೀಯಾ?", "ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ?", "ಎಲ್ಲಿಗೆ ಹೋಗ್ತಾ ಇದ್ದೀರಾ?"],
    romanKannada: "nanage beda"
  },
  {
    english: "What is your job?",
    kannada: "ನಿಮ್ಮ ಕೆಲಸ ಏನು?",
    incorrectOptions: ["ನೀನು ಎಲ್ಲಿದ್ದೀಯಾ?", "ಏನು ಮಾಡ್ತಿದ್ದೀಯಾ?", "ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ?", "ಎಲ್ಲಿಗೆ ಹೋಗ್ತಾ ಇದ್ದೀರಾ?"],
    romanKannada: "nimma kelasa enu?"
  },
  {
    english: "Come with me",
    kannada: "ನನ್ನ ಜೊತೆ ಬನ್ನಿ",
    incorrectOptions: ["ನೀನು ಎಲ್ಲಿದ್ದೀಯಾ?", "ಏನು ಮಾಡ್ತಿದ್ದೀಯಾ?", "ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ?", "ಎಲ್ಲಿಗೆ ಹೋಗ್ತಾ ಇದ್ದೀರಾ?"],
    romanKannada: "nanna jothe banni"
  },
  {
    english: "I do not understand",
    kannada: "ನನಗೆ ಅರ್ಥವಾಗುತ್ತಿಲ್ಲ",
    incorrectOptions: ["ನೀನು ಎಲ್ಲಿದ್ದೀಯಾ?", "ಏನು ಮಾಡ್ತಿದ್ದೀಯಾ?", "ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ?", "ಎಲ್ಲಿಗೆ ಹೋಗ್ತಾ ಇದ್ದೀರಾ?"],
    romanKannada: "nanage arthavaguttilla"
  },
  {
    english: "I agree.",
    kannada: "ನಾನು ಒಪ್ಪುತ್ತೇನೆ",
    incorrectOptions: ["ನೀನು ಎಲ್ಲಿದ್ದೀಯಾ?", "ಏನು ಮಾಡ್ತಿದ್ದೀಯಾ?", "ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ?", "ಎಲ್ಲಿಗೆ ಹೋಗ್ತಾ ಇದ್ದೀರಾ?"],
    romanKannada: "nanu opputtene"
  },
  {
    english: "When is the train leaving?",
    kannada: "ರೈಲು ಯಾವಾಗ ಹೊರಡುತ್ತದೆ?",
    incorrectOptions: ["ನೀನು ಎಲ್ಲಿದ್ದೀಯಾ?", "ಏನು ಮಾಡ್ತಿದ್ದೀಯಾ?", "ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ?", "ಎಲ್ಲಿಗೆ ಹೋಗ್ತಾ ಇದ್ದೀರಾ?"],
    romanKannada: "railu yavaga horaduttade?"
  },
  {
    english: "I love you.",
    kannada: "ನಾನು ನಿನ್ನನ್ನು ಪ್ರೀತಿಸುತ್ತೇನೆ",
    incorrectOptions: ["ನೀನು ಎಲ್ಲಿದ್ದೀಯಾ?", "ಏನು ಮಾಡ್ತಿದ್ದೀಯಾ?", "ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ?", "ಎಲ್ಲಿಗೆ ಹೋಗ್ತಾ ಇದ್ದೀರಾ?"],
    romanKannada: "nanu ninnanu preetisuttene"
  },
  {
    english: "Stop making such a noise",
    kannada: "ಗಲಾಟೆ ಮಾಡಬೇಡ",
    incorrectOptions: ["ನೀನು ಎಲ್ಲಿದ್ದೀಯಾ?", "ಏನು ಮಾಡ್ತಿದ್ದೀಯಾ?", "ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ?", "ಎಲ್ಲಿಗೆ ಹೋಗ್ತಾ ಇದ್ದೀರಾ?"],
    romanKannada: "galate madabeda"
  },
  {
    english: "Do you need anything?",
    kannada: "ನಿಮಗೆ ಏನಾದರೂ ಬೇಕಾ?",
    incorrectOptions: ["ನೀನು ಎಲ್ಲಿದ್ದೀಯಾ?", "ಏನು ಮಾಡ್ತಿದ್ದೀಯಾ?", "ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ?", "ಎಲ್ಲಿಗೆ ಹೋಗ್ತಾ ಇದ್ದೀರಾ?"],
    romanKannada: "nimage enadaru beka?"
  },
  {
    english: "Don’t move!",
    kannada: "ಕದಲಬೇಡ!",
    incorrectOptions: ["ನೀನು ಎಲ್ಲಿದ್ದೀಯಾ?", "ಏನು ಮಾಡ್ತಿದ್ದೀಯಾ?", "ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ?", "ಎಲ್ಲಿಗೆ ಹೋಗ್ತಾ ಇದ್ದೀರಾ?"],
    romanKannada: "kadala beda!"
  },
  {
    english: "Do me a favor",
    kannada: "ನನಗೊಂದು ಸಹಾಯ ಮಾಡು",
    incorrectOptions: ["ನೀನು ಎಲ್ಲಿದ್ದೀಯಾ?", "ಏನು ಮಾಡ್ತಿದ್ದೀಯಾ?", "ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ?", "ಎಲ್ಲಿಗೆ ಹೋಗ್ತಾ ಇದ್ದೀರಾ?"],
    romanKannada: "nanagondu sahaya madu"
  },
  {
    english: "I’m sorry.",
    kannada: "ಕ್ಷಮಿಸಿ",
    incorrectOptions: ["ನೀನು ಎಲ್ಲಿದ್ದೀಯಾ?", "ಏನು ಮಾಡ್ತಿದ್ದೀಯಾ?", "ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ?", "ಎಲ್ಲಿಗೆ ಹೋಗ್ತಾ ಇದ್ದೀರಾ?"],
    romanKannada: "kshamisi"
  },
  {
    english: "I got it.",
    kannada: "ನನಗೆ ಅರ್ಥವಾಯಿತು",
    incorrectOptions: ["ನೀನು ಎಲ್ಲಿದ್ದೀಯಾ?", "ಏನು ಮಾಡ್ತಿದ್ದೀಯಾ?", "ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ?", "ಎಲ್ಲಿಗೆ ಹೋಗ್ತಾ ಇದ್ದೀರಾ?"],
    romanKannada: "nanage arthavayithu"
  },
  {
    english: "Where are you going?",
    kannada: "ಎಲ್ಲಿಗೆ ಹೋಗ್ತಾ ಇದ್ದೀರಾ?",
    incorrectOptions: ["ನೀನು ಎಲ್ಲಿದ್ದೀಯಾ?", "ಏನು ಮಾಡ್ತಿದ್ದೀಯಾ?", "ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ?", "ಎಲ್ಲಿಗೆ ಹೋಗ್ತಾ ಇದ್ದೀರಾ?"],
    romanKannada: "ellige hogtha iddeera?"
  },
  {
    english: "I am tired.",
    kannada: "ನನಗೆ ಸುಸ್ತಾಗಿದೆ",
    incorrectOptions: ["ನೀನು ಎಲ್ಲಿದ್ದೀಯಾ?", "ಏನು ಮಾಡ್ತಿದ್ದೀಯಾ?", "ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ?", "ಎಲ್ಲಿಗೆ ಹೋಗ್ತಾ ಇದ್ದೀರಾ?"],
    romanKannada: "nanage susthagide"
  },
  {
    english: "It really takes time",
    kannada: "ಅದು ನಿಜಕ್ಕೂ ಸಮಯ ತೆಗೆದುಕೊಳ್ಳುತ್ತದೆ",
    incorrectOptions: ["ನೀನು ಎಲ್ಲಿದ್ದೀಯಾ?", "ಏನು ಮಾಡ್ತಿದ್ದೀಯಾ?", "ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ?", "ಎಲ್ಲಿಗೆ ಹೋಗ್ತಾ ಇದ್ದೀರಾ?"],
    romanKannada: "adu nijakku samaya tegedukolluttade"
  },
  {
    english: "So I do",
    kannada: "ಹಾಗೆ ಮಾಡ್ತೀನಿ",
    incorrectOptions: ["ನೀನು ಎಲ್ಲಿದ್ದೀಯಾ?", "ಏನು ಮಾಡ್ತಿದ್ದೀಯಾ?", "ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ?", "ಎಲ್ಲಿಗೆ ಹೋಗ್ತಾ ಇದ್ದೀರಾ?"],
    romanKannada: "hage madtini"
  },
  {
    english: "So so",
    kannada: "ಸುಮಾರಾಗಿ",
    incorrectOptions: ["ನೀನು ಎಲ್ಲಿದ್ದೀಯಾ?", "ಏನು ಮಾಡ್ತಿದ್ದೀಯಾ?", "ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ?", "ಎಲ್ಲಿಗೆ ಹೋಗ್ತಾ ಇದ್ದೀರಾ?"],
    romanKannada: "sumaragii"
  },
  {
    english: "Forget it",
    kannada: "ಮರೆತುಬಿಡು",
    incorrectOptions: ["ನೀನು ಎಲ್ಲಿದ್ದೀಯಾ?", "ಏನು ಮಾಡ್ತಿದ್ದೀಯಾ?", "ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ?", "ಎಲ್ಲಿಗೆ ಹೋಗ್ತಾ ಇದ್ದೀರಾ?"],
    romanKannada: "marethubidu"
  },
  {
    english: "How much is it?",
    kannada: "ಎಷ್ಟು?",
    incorrectOptions: ["ನೀನು ಎಲ್ಲಿದ್ದೀಯಾ?", "ಏನು ಮಾಡ್ತಿದ್ದೀಯಾ?", "ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ?", "ಎಲ್ಲಿಗೆ ಹೋಗ್ತಾ ಇದ್ದೀರಾ?"],
    romanKannada: "eshtu?"
  },
  {
    english: "Join me.",
    kannada: "ನನ್ನ ಜೊತೆ ಸೇರಿಕೊಳ್ಳಿ",
    incorrectOptions: ["ನೀನು ಎಲ್ಲಿದ್ದೀಯಾ?", "ಏನು ಮಾಡ್ತಿದ್ದೀಯಾ?", "ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ?", "ಎಲ್ಲಿಗೆ ಹೋಗ್ತಾ ಇದ್ದೀರಾ?"],
    romanKannada: "nanna jothe serikolli"
  },
  {
    english: "Any day will do",
    kannada: "ಯಾವ ದಿನವಾದರೂ ಸರಿ",
    incorrectOptions: ["ನೀನು ಎಲ್ಲಿದ್ದೀಯಾ?", "ಏನು ಮಾಡ್ತಿದ್ದೀಯಾ?", "ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ?", "ಎಲ್ಲಿಗೆ ಹೋಗ್ತಾ ಇದ್ದೀರಾ?"],
    romanKannada: "yava dinavadaru sari"
  },
  {
    english: "Give me a hand",
    kannada: "ಸಹಾಯ ಮಾಡಿ",
    incorrectOptions: ["ನೀನು ಎಲ್ಲಿದ್ದೀಯಾ?", "ಏನು ಮಾಡ್ತಿದ್ದೀಯಾ?", "ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ?", "ಎಲ್ಲಿಗೆ ಹೋಗ್ತಾ ಇದ್ದೀರಾ?"],
    romanKannada: "sahaya maadi"
  },
  {
    english: "Talk to you tomorrow.",
    kannada: "ನಾಳೆ ಮಾತಾಡ್ತೀನಿ",
    incorrectOptions: ["ನೀನು ಎಲ್ಲಿದ್ದೀಯಾ?", "ಏನು ಮಾಡ್ತಿದ್ದೀಯಾ?", "ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ?", "ಎಲ್ಲಿಗೆ ಹೋಗ್ತಾ ಇದ್ದೀರಾ?"],
    romanKannada: "nale matadtini"
  },
  {
    english: "They like each other.",
    kannada: "ಅವರು ಒಬ್ಬರನ್ನೊಬ್ಬರು ಇಷ್ಟಪಡುತ್ತಾರೆ",
    incorrectOptions: ["ನೀನು ಎಲ್ಲಿದ್ದೀಯಾ?", "ಏನು ಮಾಡ್ತಿದ್ದೀಯಾ?", "ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ?", "ಎಲ್ಲಿಗೆ ಹೋಗ್ತಾ ಇದ್ದೀರಾ?"],
    romanKannada: "avaru obbarannobbaru ishtapaduttare"
  },
  {
    english: "Be calm",
    kannada: "ಶಾಂತವಾಗಿರಿ",
    incorrectOptions: ["ನೀನು ಎಲ್ಲಿದ್ದೀಯಾ?", "ಏನು ಮಾಡ್ತಿದ್ದೀಯಾ?", "ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ?", "ಎಲ್ಲಿಗೆ ಹೋಗ್ತಾ ಇದ್ದೀರಾ?"],
    romanKannada: "shantavagiri"
  },
  {
    english: "Where did you get it?",
    kannada: "ನಿಮಗೆ ಎಲ್ಲಿ ಸಿಕ್ಕಿತು?",
    incorrectOptions: ["ನೀನು ಎಲ್ಲಿದ್ದೀಯಾ?", "ಏನು ಮಾಡ್ತಿದ್ದೀಯಾ?", "ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ?", "ಎಲ್ಲಿಗೆ ಹೋಗ್ತಾ ಇದ್ದೀರಾ?"],
    romanKannada: "nimage elli sikithu?"
  },
  {
    english: "Can you please repeat that?",
    kannada: "ದಯವಿಟ್ಟು ಇನ್ನೊಮ್ಮೆ ಹೇಳ್ತೀರಾ?",
    incorrectOptions: ["ನೀನು ಎಲ್ಲಿದ್ದೀಯಾ?", "ಏನು ಮಾಡ್ತಿದ್ದೀಯಾ?", "ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ?", "ಎಲ್ಲಿಗೆ ಹೋಗ್ತಾ ಇದ್ದೀರಾ?"],
    romanKannada: "dayavittu innomme helthira?"
  },
  {
    english: "Where are you?",
    kannada: "ಎಲ್ಲಿದ್ದೀರಾ?",
    incorrectOptions: ["ನೀನು ಎಲ್ಲಿದ್ದೀಯಾ?", "ಏನು ಮಾಡ್ತಿದ್ದೀಯಾ?", "ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ?", "ಎಲ್ಲಿಗೆ ಹೋಗ್ತಾ ಇದ್ದೀರಾ?"],
    romanKannada: "elliddeera?"
  },
  {
    english: "What are you doing?",
    kannada: "ಏನು ಮಾಡ್ತಾ ಇದ್ದೀರಾ?",
    incorrectOptions: ["ನೀನು ಎಲ್ಲಿದ್ದೀಯಾ?", "ಏನು ಮಾಡ್ತಿದ್ದೀಯಾ?", "ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ?", "ಎಲ್ಲಿಗೆ ಹೋಗ್ತಾ ಇದ್ದೀರಾ?"],
    romanKannada: "enu madtha iddeera?"
  },
  {
    english: "I am busy.",
    kannada: "ನನಗೆ ಕೆಲಸ ಇದೆ",
    incorrectOptions: ["ನೀನು ಎಲ್ಲಿದ್ದೀಯಾ?", "ಏನು ಮಾಡ್ತಿದ್ದೀಯಾ?", "ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ?", "ಎಲ್ಲಿಗೆ ಹೋಗ್ತಾ ಇದ್ದೀರಾ?"],
    romanKannada: "nanage kelasa ide"
  },
  {
    english: "How long will you stay?",
    kannada: "ಎಷ್ಟು ದಿನ ಇರ್ತೀರಾ?",
    incorrectOptions: ["ನೀನು ಎಲ್ಲಿದ್ದೀಯಾ?", "ಏನು ಮಾಡ್ತಿದ್ದೀಯಾ?", "ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ?", "ಎಲ್ಲಿಗೆ ಹೋಗ್ತಾ ಇದ್ದೀರಾ?"],
    romanKannada: "eshtu dina irthira?"
  },
  {
    english: "Call me back.",
    kannada: "ನನಗೆ ಮತ್ತೆ ಫೋನ್ ಮಾಡಿ",
    incorrectOptions: ["ನೀನು ಎಲ್ಲಿದ್ದೀಯಾ?", "ಏನು ಮಾಡ್ತಿದ್ದೀಯಾ?", "ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ?", "ಎಲ್ಲಿಗೆ ಹೋಗ್ತಾ ಇದ್ದೀರಾ?"],
    romanKannada: "nanage matthe phone maadi"
  },
  {
    english: "Are you kidding?",
    kannada: "ನೀವು ತಮಾಷೆ ಮಾಡ್ತಿದ್ದೀರಾ?",
    incorrectOptions: ["ನೀನು ಎಲ್ಲಿದ್ದೀಯಾ?", "ಏನು ಮಾಡ್ತಿದ್ದೀಯಾ?", "ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ?", "ಎಲ್ಲಿಗೆ ಹೋಗ್ತಾ ಇದ್ದೀರಾ?"],
    romanKannada: "neevu tamashe madthira?"
  },
  {
    english: "Allow me",
    kannada: "ನನಗೆ ಬಿಡಿ",
    incorrectOptions: ["ನೀನು ಎಲ್ಲಿದ್ದೀಯಾ?", "ಏನು ಮಾಡ್ತಿದ್ದೀಯಾ?", "ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ?", "ಎಲ್ಲಿಗೆ ಹೋಗ್ತಾ ಇದ್ದೀರಾ?"],
    romanKannada: "nanage bidi"
  },
  {
    english: "How was your weekend?",
    kannada: "ನಿಮ್ಮ ವಾರಾಂತ್ಯ ಹೇಗಿತ್ತು?",
    incorrectOptions: ["ನೀನು ಎಲ್ಲಿದ್ದೀಯಾ?", "ಏನು ಮಾಡ್ತಿದ್ದೀಯಾ?", "ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ?", "ಎಲ್ಲಿಗೆ ಹೋಗ್ತಾ ಇದ್ದೀರಾ?"],
    romanKannada: "nimma varanthya hegiithu?"
  },
  {
    english: "It’s very thoughtful of you",
    kannada: "ನಿಮ್ಮ ಯೋಚನೆ ತುಂಬಾ ಒಳ್ಳೆಯದು",
    incorrectOptions: ["ನೀನು ಎಲ್ಲಿದ್ದೀಯಾ?", "ಏನು ಮಾಡ್ತಿದ್ದೀಯಾ?", "ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ?", "ಎಲ್ಲಿಗೆ ಹೋಗ್ತಾ ಇದ್ದೀರಾ?"],
    romanKannada: "nimma yochane thumba olleyadu"
  },
  {
    english: "Let’s catch up!",
    kannada: "ಮಾತಾಡೋಣ",
    incorrectOptions: ["ನೀನು ಎಲ್ಲಿದ್ದೀಯಾ?", "ಏನು ಮಾಡ್ತಿದ್ದೀಯಾ?", "ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ?", "ಎಲ್ಲಿಗೆ ಹೋಗ್ತಾ ಇದ್ದೀರಾ?"],
    romanKannada: "mathadonna"
  },
  {
    english: "What’s your phone number?",
    kannada: "ನಿಮ್ಮ ಫೋನ್ ನಂಬರ್ ಏನು?",
    incorrectOptions: ["ನೀನು ಎಲ್ಲಿದ್ದೀಯಾ?", "ಏನು ಮಾಡ್ತಿದ್ದೀಯಾ?", "ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ?", "ಎಲ್ಲಿಗೆ ಹೋಗ್ತಾ ಇದ್ದೀರಾ?"],
    romanKannada: "nimma phone number enu?"
  },
  {
    english: "No, I don’t want",
    kannada: "ಇಲ್ಲ, ನನಗೆ ಬೇಡ",
    incorrectOptions: ["ನೀನು ಎಲ್ಲಿದ್ದೀಯಾ?", "ಏನು ಮಾಡ್ತಿದ್ದೀಯಾ?", "ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ?", "ಎಲ್ಲಿಗೆ ಹೋಗ್ತಾ ಇದ್ದೀರಾ?"],
    romanKannada: "illa, nanage beda"
  },
  {
    english: "I’m at home",
    kannada: "ನಾನು ಮನೆಯಲ್ಲಿದ್ದೇನೆ",
    incorrectOptions: ["ನೀನು ಎಲ್ಲಿದ್ದೀಯಾ?", "ಏನು ಮಾಡ್ತಿದ್ದೀಯಾ?", "ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ?", "ಎಲ್ಲಿಗೆ ಹೋಗ್ತಾ ಇದ್ದೀರಾ?"],
    romanKannada: "nanu maneyalliddeene"
  },
  {
    english: "I hope so.",
    kannada: "ಹಾಗೆ ಆಶಿಸುತ್ತೇನೆ",
    incorrectOptions: ["ನೀನು ಎಲ್ಲಿದ್ದೀಯಾ?", "ಏನು ಮಾಡ್ತಿದ್ದೀಯಾ?", "ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ?", "ಎಲ್ಲಿಗೆ ಹೋಗ್ತಾ ಇದ್ದೀರಾ?"],
    romanKannada: "hage asisuttene"
  },
  {
    english: "I’m sorry",
    kannada: "ಕ್ಷಮಿಸಿ",
    incorrectOptions: ["ನೀನು ಎಲ್ಲಿದ್ದೀಯಾ?", "ಏನು ಮಾಡ್ತಿದ್ದೀಯಾ?", "ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ?", "ಎಲ್ಲಿಗೆ ಹೋಗ್ತಾ ಇದ್ದೀರಾ?"],
    romanKannana: "kshamisi"
  },
  {
    english: "Did you get it?",
    kannada: "ನಿಮಗೆ ಅರ್ಥವಾಯಿತಾ?",
    incorrectOptions: ["ನೀನು ಎಲ್ಲಿದ್ದೀಯಾ?", "ಏನು ಮಾಡ್ತಿದ್ದೀಯಾ?", "ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ?", "ಎಲ್ಲಿಗೆ ಹೋಗ್ತಾ ಇದ್ದೀರಾ?"],
    romanKannada: "nimage arthavayitha?"
  },
  {
    english: "How are you?",
    kannada: "ನೀವು ಹೇಗಿದ್ದೀರಾ?",
    incorrectOptions: ["ನೀನು ಎಲ್ಲಿದ್ದೀಯಾ?", "ಏನು ಮಾಡ್ತಿದ್ದೀಯಾ?", "ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ?", "ಎಲ್ಲಿಗೆ ಹೋಗ್ತಾ ಇದ್ದೀರಾ?"],
    romanKannada: "neevu hegeedira?"
  },
  {
    english: "Don’t worry",
    kannada: "ಚಿಂತಿಸಬೇಡಿ",
    incorrectOptions: ["ನೀನು ಎಲ್ಲಿದ್ದೀಯಾ?", "ಏನು ಮಾಡ್ತಿದ್ದೀಯಾ?", "ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ?", "ಎಲ್ಲಿಗೆ ಹೋಗ್ತಾ ಇದ್ದೀರಾ?"],
    romanKannana: "chintisabedi"
  },
  {
    english: "Anything else?",
    kannada: "ಬೇರೆ ಏನಾದರೂ?",
    incorrectOptions: ["ನೀನು ಎಲ್ಲಿದ್ದೀಯಾ?", "ಏನು ಮಾಡ್ತಿದ್ದೀಯಾ?", "ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ?", "ಎಲ್ಲಿಗೆ ಹೋಗ್ತಾ ಇದ್ದೀರಾ?"],
    romanKannada: "bere enadaru?"
  },
  {
    english: "Have a good weekend",
    kannada: "ವಾರಾಂತ್ಯ ಚೆನ್ನಾಗಿರಲಿ",
    incorrectOptions: ["ನೀನು ಎಲ್ಲಿದ್ದೀಯಾ?", "ಏನು ಮಾಡ್ತಿದ್ದೀಯಾ?", "ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ?", "ಎಲ್ಲಿಗೆ ಹೋಗ್ತಾ ಇದ್ದೀರಾ?"],
    romanKannada: "varanthya chennagirali"
  },
  {
    english: "Where do you live?",
    kannada: "ಎಲ್ಲಿ ವಾಸವಾಗಿದ್ದೀರಾ?",
    incorrectOptions: ["ನೀನು ಎಲ್ಲಿದ್ದೀಯಾ?", "ಏನು ಮಾಡ್ತಿದ್ದೀಯಾ?", "ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ?", "ಎಲ್ಲಿಗೆ ಹೋಗ್ತಾ ಇದ್ದೀರಾ?"],
    romanKannada: "elli vasavagiddeera?"
  },
  {
    english: "God bless you",
    kannada: "ದೇವರು ಆಶೀರ್ವದಿಸಲಿ",
    incorrectOptions: ["ನೀನು ಎಲ್ಲಿದ್ದೀಯಾ?", "ಏನು ಮಾಡ್ತಿದ್ದೀಯಾ?", "ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ?", "ಎಲ್ಲಿಗೆ ಹೋಗ್ತಾ ಇದ್ದೀರಾ?"],
    romanKannada: "devaru ashirvadisali"
  },
  {
    english: "Is everything OK?",
    kannada: "ಎಲ್ಲಾ ಸರಿ ಇದೆಯಾ?",
    incorrectOptions: ["ನೀನು ಎಲ್ಲಿದ್ದೀಯಾ?", "ಏನು ಮಾಡ್ತಿದ್ದೀಯಾ?", "ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ?", "ಎಲ್ಲಿಗೆ ಹೋಗ್ತಾ ಇದ್ದೀರಾ?"],
    romanKannada: "ella sari iddeya?"
  },
  {
    english: "It’s on the tip of my tongue",
    kannada: "ನನ್ನ ನಾಲಿಗೆ ತುದಿಯಲ್ಲಿದೆ",
    incorrectOptions: ["ನೀನು ಎಲ್ಲಿದ್ದೀಯಾ?", "ಏನು ಮಾಡ್ತಿದ್ದೀಯಾ?", "ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ?", "ಎಲ್ಲಿಗೆ ಹೋಗ್ತಾ ಇದ್ದೀರಾ?"],
    romanKannada: "nanna nalige thudiyallide"
  },
  {
    english: "Do you understand me?",
    kannada: "ನಿನಗೆ ಅರ್ಥವಾಯಿತಾ?",
    incorrectOptions: ["ನೀನು ಎಲ್ಲಿದ್ದೀಯಾ?", "ಏನು ಮಾಡ್ತಿದ್ದೀಯಾ?", "ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ?", "ಎಲ್ಲಿಗೆ ಹೋಗ್ತಾ ಇದ್ದೀರಾ?"],
    romanKannada: "ninage arthavayitha?"
  },
  {
    english: "Believe me.",
    kannada: "ನನ್ನನ್ನು ನಂಬಿ",
    incorrectOptions: ["ನೀನು ಎಲ್ಲಿದ್ದೀಯಾ?", "ಏನು ಮಾಡ್ತಿದ್ದೀಯಾ?", "ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ?", "ಎಲ್ಲಿಗೆ ಹೋಗ್ತಾ ಇದ್ದೀರಾ?"],
    romanKannada: "nannanu nambi"
  },
  {
    english: "I can’t wait",
    kannada: "ನನಗೆ ಕಾಯಲು ಸಾಧ್ಯವಿಲ್ಲ",
    incorrectOptions: ["ನೀನು ಎಲ್ಲಿದ್ದೀಯಾ?", "ಏನು ಮಾಡ್ತಿದ್ದೀಯಾ?", "ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ?", "ಎಲ್ಲಿಗೆ ಹೋಗ್ತಾ ಇದ್ದೀರಾ?"],
    romanKannada: "nanage kayalu sadhyavilla"
  },
  {
    english: "I don’t agree.",
    kannada: "ನಾನು ಒಪ್ಪುವುದಿಲ್ಲ",
    incorrectOptions: ["ನೀನು ಎಲ್ಲಿದ್ದೀಯಾ?", "ಏನು ಮಾಡ್ತಿದ್ದೀಯಾ?", "ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ?", "ಎಲ್ಲಿಗೆ ಹೋಗ್ತಾ ಇದ್ದೀರಾ?"],
    romanKannada: "nanu oppuvudilla"
  },
  {
    english: "Do i have to?",
    kannada: "ನಾನು ಮಾಡಬೇಕಾ?",
    incorrectOptions: ["ನೀನು ಎಲ್ಲಿದ್ದೀಯಾ?", "ಏನು ಮಾಡ್ತಿದ್ದೀಯಾ?", "ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ?", "ಎಲ್ಲಿಗೆ ಹೋಗ್ತಾ ಇದ್ದೀರಾ?"],
    romanKannada: "nanu madabeka?"
  },
  {
    english: "How are things going?",
    kannada: "ಹೇಗಿದೆ?",
    incorrectOptions: ["ನೀನು ಎಲ್ಲಿದ್ದೀಯಾ?", "ಏನು ಮಾಡ್ತಿದ್ದೀಯಾ?", "ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ?", "ಎಲ್ಲಿಗೆ ಹೋಗ್ತಾ ಇದ್ದೀರಾ?"],
    romanKannada: "hegide?"
  },
  {
    english: "What are you talking about?",
    kannada: "ಏನು ಮಾತಾಡ್ತಾ ಇದ್ದೀರಾ?",
    incorrectOptions: ["ನೀನು ಎಲ್ಲಿದ್ದೀಯಾ?", "ಏನು ಮಾಡ್ತಿದ್ದೀಯಾ?", "ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ?", "ಎಲ್ಲಿಗೆ ಹೋಗ್ತಾ ಇದ್ದೀರಾ?"],
    romanKannada: "enu mathadtha iddeera?"
  },
  {
    english: "What did you say?",
    kannada: "ಏನು ಹೇಳಿದಿರಿ?",
    incorrectOptions: ["ನೀನು ಎಲ್ಲಿದ್ದೀಯಾ?", "ಏನು ಮಾಡ್ತಿದ್ದೀಯಾ?", "ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ?", "ಎಲ್ಲಿಗೆ ಹೋಗ್ತಾ ಇದ್ದೀರಾ?"],
    romanKannada: "enu helidiri?"
  },
  {
    english: "What’s your e-mail address?",
    kannada: "ನಿಮ್ಮ ಇ-ಮೇಲ್ ವಿಳಾಸ ಏನು?",
    incorrectOptions: ["ನೀನು ಎಲ್ಲಿದ್ದೀಯಾ?", "ಏನು ಮಾಡ್ತಿದ್ದೀಯಾ?", "ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ?", "ಎಲ್ಲಿಗೆ ಹೋಗ್ತಾ ಇದ್ದೀರಾ?"],
    romanKannada: "nimma e-mail vilasa enu?"
  },
  {
    english: "You are wasting my time.",
    kannada: "ನನ್ನ ಸಮಯ ವ್ಯರ್ಥ ಮಾಡಬೇಡ",
    incorrectOptions: ["ನೀನು ಎಲ್ಲಿದ್ದೀಯಾ?", "ಏನು ಮಾಡ್ತಿದ್ದೀಯಾ?", "ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ?", "ಎಲ್ಲಿಗೆ ಹೋಗ್ತಾ ಇದ್ದೀರಾ?"],
    romanKannada: "nanna samaya vyartha madabeda"
  },
  {
    english: "What are you up to?",
    kannada: "ಏನು ಮಾಡ್ತಾ ಇದ್ದೀರಾ?",
    incorrectOptions: ["ನೀನು ಎಲ್ಲಿದ್ದೀಯಾ?", "ಏನು ಮಾಡ್ತಿದ್ದೀಯಾ?", "ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ?", "ಎಲ್ಲಿಗೆ ಹೋಗ್ತಾ ಇದ್ದೀರಾ?"],
    romanKannada: "enu madtha iddeera?"
  },
  {
    english: "I have no idea.",
    kannada: "ನನಗೆ ಗೊತ್ತಿಲ್ಲ",
    incorrectOptions: ["ನೀನು ಎಲ್ಲಿದ್ದೀಯಾ?", "ಏನು ಮಾಡ್ತಿದ್ದೀಯಾ?", "ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ?", "ಎಲ್ಲಿಗೆ ಹೋಗ್ತಾ ಇದ್ದೀರಾ?"],
    romanKannada: "nanage gothilla"
  },
  {
    english: "Where are you from?",
    kannada: "ನೀವು ಎಲ್ಲಿಂದ ಬಂದಿದ್ದೀರಾ?",
    incorrectOptions: ["ನೀನು ಎಲ್ಲಿದ್ದೀಯಾ?", "ಏನು ಮಾಡ್ತಿದ್ದೀಯಾ?", "ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ?", "ಎಲ್ಲಿಗೆ ಹೋಗ್ತಾ ಇದ್ದೀರಾ?"],
    romanKannada: "neevu ellinda bandiddeera?"
  },
  {
    english: "Slow down",
    kannada: "ನಿಧಾನವಾಗಿ",
    incorrectOptions: ["ನೀನು ಎಲ್ಲಿದ್ದೀಯಾ?", "ಏನು ಮಾಡ್ತಿದ್ದೀಯಾ?", "ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ?", "ಎಲ್ಲಿಗೆ ಹೋಗ್ತಾ ಇದ್ದೀರಾ?"],
    romanKannada: "nidhanavagi"
  },
  {
    english: "Good afternoon",
    kannada: "ಶುಭ ಮಧ್ಯಾಹ್ನ",
    incorrectOptions: ["ನೀನು ಎಲ್ಲಿದ್ದೀಯಾ?", "ಏನು ಮಾಡ್ತಿದ್ದೀಯಾ?", "ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ?", "ಎಲ್ಲಿಗೆ ಹೋಗ್ತಾ ಇದ್ದೀರಾ?"],
    romanKannada: "shubha madhyahna"
  },
  {
    english: "Are you done?",
    kannada: "ಮುಗಿತಾ?",
    incorrectOptions: ["ನೀನು ಎಲ್ಲಿದ್ದೀಯಾ?", "ಏನು ಮಾಡ್ತಿದ್ದೀಯಾ?", "ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ?", "ಎಲ್ಲಿಗೆ ಹೋಗ್ತಾ ಇದ್ದೀರಾ?"],
    romanKannada: "mugitha?"
  },
  {
    english: "You turn.",
    kannada: "ನಿಮ್ಮ ಸರದಿ",
    incorrectOptions: ["ನೀನು ಎಲ್ಲಿದ್ದೀಯಾ?", "ಏನು ಮಾಡ್ತಿದ್ದೀಯಾ?", "ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ?", "ಎಲ್ಲಿಗೆ ಹೋಗ್ತಾ ಇದ್ದೀರಾ?"],
    romanKannada: "nimma saradi"
  },
  {
    english: "How do you feel?",
    kannada: "ನಿಮಗೆ ಹೇಗನಿಸುತ್ತಿದೆ?",
    incorrectOptions: ["ನೀನು ಎಲ್ಲಿದ್ದೀಯಾ?", "ಏನು ಮಾಡ್ತಿದ್ದೀಯಾ?", "ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ?", "ಎಲ್ಲಿಗೆ ಹೋಗ್ತಾ ಇದ್ದೀರಾ?"],
    romanKannada: "nimage heganisuttide?"
  },
  {
    english: "What’s your name?",
    kannada: "ನಿಮ್ಮ ಹೆಸರು ಏನು?",
    incorrectOptions: ["ನೀನು ಎಲ್ಲಿದ್ದೀಯಾ?", "ಏನು ಮಾಡ್ತಿದ್ದೀಯಾ?", "ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ?", "ಎಲ್ಲಿಗೆ ಹೋಗ್ತಾ ಇದ್ದೀರಾ?"],
    romanKannada: "nimma hesaru enu?"
  },
  {
    english: "What’s the weather like?",
    kannada: "ಹವಾಮಾನ ಹೇಗಿದೆ?",
    incorrectOptions: ["ನೀನು ಎಲ್ಲಿದ್ದೀಯಾ?", "ಏನು ಮಾಡ್ತಿದ್ದೀಯಾ?", "ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ?", "ಎಲ್ಲಿಗೆ ಹೋಗ್ತಾ ಇದ್ದೀರಾ?"],
    romanKannada: "havamana hegide?"
  },
  {
    english: "Not yet.",
    kannada: "ಇನ್ನೂ ಇಲ್ಲ",
    incorrectOptions: ["ನೀನು ಎಲ್ಲಿದ್ದೀಯಾ?", "ಏನು ಮಾಡ್ತಿದ್ದೀಯಾ?", "ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ?", "ಎಲ್ಲಿಗೆ ಹೋಗ್ತಾ ಇದ್ದೀರಾ?"],
    romanKannada: "innu illa"
  },
  {
    english: "Can I help you?",
    kannada: "ನಾನು ಸಹಾಯ ಮಾಡ್ಲಾ?",
    incorrectOptions: ["ನೀನು ಎಲ್ಲಿದ್ದೀಯಾ?", "ಏನು ಮಾಡ್ತಿದ್ದೀಯಾ?", "ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ?", "ಎಲ್ಲಿಗೆ ಹೋಗ್ತಾ ಇದ್ದೀರಾ?"],
    romanKannada: "nanu sahaya madla?"
  },
  {
    english: "Cheer up!",
    kannada: "ಖುಷಿಯಾಗಿರು!",
    incorrectOptions: ["ನೀನು ಎಲ್ಲಿದ್ದೀಯಾ?", "ಏನು ಮಾಡ್ತಿದ್ದೀಯಾ?", "ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ?", "ಎಲ್ಲಿಗೆ ಹೋಗ್ತಾ ಇದ್ದೀರಾ?"],
    romanKannada: "khushiyagiru!"
  },
  {
    english: "Enjoy yourself",
    kannada: "ಮಜಾ ಮಾಡಿ",
    incorrectOptions: ["ನೀನು ಎಲ್ಲಿದ್ದೀಯಾ?", "ಏನು ಮಾಡ್ತಿದ್ದೀಯಾ?", "ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ?", "ಎಲ್ಲಿಗೆ ಹೋಗ್ತಾ ಇದ್ದೀರಾ?"],
    romanKannada: "maza maadi"
  },
  {
    english: "I apologize",
    kannada: "ನಾನು ಕ್ಷಮೆಯಾಚಿಸುತ್ತೇನೆ",
    incorrectOptions: ["ನೀನು ಎಲ್ಲಿದ್ದೀಯಾ?", "ಏನು ಮಾಡ್ತಿದ್ದೀಯಾ?", "ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ?", "ಎಲ್ಲಿಗೆ ಹೋಗ್ತಾ ಇದ್ದೀರಾ?"],
    romanKannada: "nanu kshamayachisuttene"
  },
  {
    english: "A lovely day, isn’t it?",
    kannada: "ಚೆನ್ನಾದ ದಿನ ಅಲ್ವಾ?",
    incorrectOptions: ["ನೀನು ಎಲ್ಲಿದ್ದೀಯಾ?", "ಏನು ಮಾಡ್ತಿದ್ದೀಯಾ?", "ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ?", "ಎಲ್ಲಿಗೆ ಹೋಗ್ತಾ ಇದ್ದೀರಾ?"],
    romanKannada: "chennada dina alwa?"
  },
  {
    english: "See you next time",
    kannada: "ಮುಂದಿನ ಬಾರಿ ಸಿಗೋಣ",
    incorrectOptions: ["ನೀನು ಎಲ್ಲಿದ್ದೀಯಾ?", "ಏನು ಮಾಡ್ತಿದ್ದೀಯಾ?", "ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ?", "ಎಲ್ಲಿಗೆ ಹೋಗ್ತಾ ಇದ್ದೀರಾ?"],
    romanKannada: "mundina bari sigonna"
  },
  {
    english: "Shut up",
    kannada: "ಬಾಯಿ ಮುಚ್ಚು",
    incorrectOptions: ["ನೀನು ಎಲ್ಲಿದ್ದೀಯಾ?", "ಏನು ಮಾಡ್ತಿದ್ದೀಯಾ?", "ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ?", "ಎಲ್ಲಿಗೆ ಹೋಗ್ತಾ ಇದ್ದೀರಾ?"],
    romanKannana: "bayi mucchu"
  },
  {
    english: "Are you sure?",
    kannada: "ಖಚಿತವಾ?",
    incorrectOptions: ["ನೀನು ಎಲ್ಲಿದ್ದೀಯಾ?", "ಏನು ಮಾಡ್ತಿದ್ದೀಯಾ?", "ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ?", "ಎಲ್ಲಿಗೆ ಹೋಗ್ತಾ ಇದ್ದೀರಾ?"],
    romanKannada: "khachithava?"
  },
  {
    english: "Be careful!",
    kannada: "ಎಚ್ಚರಿಕೆಯಿಂದ ಇರಿ!",
    incorrectOptions: ["ನೀನು ಎಲ್ಲಿದ್ದೀಯಾ?", "ಏನು ಮಾಡ್ತಿದ್ದೀಯಾ?", "ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ?", "ಎಲ್ಲಿಗೆ ಹೋಗ್ತಾ ಇದ್ದೀರಾ?"],
    romanKannada: "eccharikeyinda iri!"
  },
  {
    english: "What do you want?",
    kannada: "ನಿಮಗೆ ಏನು ಬೇಕು?",
    incorrectOptions: ["ನೀನು ಎಲ್ಲಿದ್ದೀಯಾ?", "ಏನು ಮಾಡ್ತಿದ್ದೀಯಾ?", "ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ?", "ಎಲ್ಲಿಗೆ ಹೋಗ್ತಾ ಇದ್ದೀರಾ?"],
    romanKannada: "nimage enu beku?"
  },
  {
    english: "Don’t be so childish",
    kannada: "ಮಕ್ಕಳ ತರ ಇರಬೇಡ",
    incorrectOptions: ["ನೀನು ಎಲ್ಲಿದ್ದೀಯಾ?", "ಏನು ಮಾಡ್ತಿದ್ದೀಯಾ?", "ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ?", "ಎಲ್ಲಿಗೆ ಹೋಗ್ತಾ ಇದ್ದೀರಾ?"],
    romanKannada: "makkala thara irabeda"
  },
  {
    english: "Be quiet!",
    kannada: "ಸುಮ್ಮನಿರಿ!",
    incorrectOptions: ["ನೀನು ಎಲ್ಲಿದ್ದೀಯಾ?", "ಏನು ಮಾಡ್ತಿದ್ದೀಯಾ?", "ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ?", "ಎಲ್ಲಿಗೆ ಹೋಗ್ತಾ ಇದ್ದೀರಾ?"],
    romanKannada: "summaniri!"
  },
  {
    english: "You are going too fast",
    kannada: "ನೀವು ತುಂಬಾ ವೇಗವಾಗಿ ಹೋಗ್ತಾ ಇದ್ದೀರಾ",
    incorrectOptions: ["ನೀನು ಎಲ್ಲಿದ್ದೀಯಾ?", "ಏನು ಮಾಡ್ತಿದ್ದೀಯಾ?", "ನ ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ?", "ಎಲ್ಲಿಗೆ ಹೋಗ್ತಾ ಇದ್ದೀರಾ?"],
    romanKannada: "neevu thumba vegavagi hogtha iddeera"
  },
  {
    english: "I’m good.",
    kannada: "ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ",
    incorrectOptions: ["ನೀನು ಎಲ್ಲಿದ್ದೀಯಾ?", "ಏನು ಮಾಡ್ತಿದ್ದೀಯಾ?", "ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ?", "ಎಲ್ಲಿಗೆ ಹೋಗ್ತಾ ಇದ್ದೀರಾ?"],
    romanKannada: "nanu chennagiddeene"
  },
  {
    english: "I hate you!",
    kannada: "ನಾನು ನಿನ್ನನ್ನು ದ್ವೇಷಿಸುತ್ತೇನೆ!",
    incorrectOptions: ["ನೀನು ಎಲ್ಲಿದ್ದೀಯಾ?", "ಏನು ಮಾಡ್ತಿದ್ದೀಯಾ?", "ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ?", "ಎಲ್ಲಿಗೆ ಹೋಗ್ತಾ ಇದ್ದೀರಾ?"],
    romanKannada: "nanu ninnanu dweshisuttene!"
  },
  {
    english: "What is going on?",
    kannada: "ಏನು ನಡೀತಾ ಇದೆ?",
    incorrectOptions: ["ನೀನು ಎಲ್ಲಿದ್ದೀಯಾ?", "ಏನು ಮಾಡ್ತಿದ್ದೀಯಾ?", "ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ?", "ಎಲ್ಲಿಗೆ ಹೋಗ್ತಾ ಇದ್ದೀರಾ?"],
    romanKannada: "enu naditha ide?"
  },
  {
    english: "Thank you very much.",
    kannada: "ತುಂಬಾ ಧನ್ಯವಾದಗಳು",
    incorrectOptions: ["ನೀನು ಎಲ್ಲಿದ್ದೀಯಾ?", "ಏನು ಮಾಡ್ತಿದ್ದೀಯಾ?", "ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ?", "ಎಲ್ಲಿಗೆ ಹೋಗ್ತಾ ಇದ್ದೀರಾ?"],
    romanKannana: "thumba dhanyavadagalu"
  },
  {
    english: "How can I go to the town center?",
    kannada: "ನಗರ ಕೇಂದ್ರಕ್ಕೆ ಹೇಗೆ ಹೋಗಬೇಕು?",
    incorrectOptions: ["ನೀನು ಎಲ್ಲಿದ್ದೀಯಾ?", "ಏನು ಮಾಡ್ತಿದ್ದೀಯಾ?", "ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ?", "ಎಲ್ಲಿಗೆ ಹೋಗ್ತಾ ಇದ್ದೀರಾ?"],
    romanKannada: "nagara kendrakke hege hogabeku?"
  },
  {
    english: "I do not mean it",
    kannada: "ನನ್ನ ಉದ್ದೇಶ ಅದು ಆಗಿರಲಿಲ್ಲ",
    incorrectOptions: ["ನೀನು ಎಲ್ಲಿದ್ದೀಯಾ?", "ಏನು ಮಾಡ್ತಿದ್ದೀಯಾ?", "ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ?", "ಎಲ್ಲಿಗೆ ಹೋಗ್ತಾ ಇದ್ದೀರಾ?"],
    romanKannada: "nanna uddesha adu agirallilla"
  },
  {
    english: "Have a good trip",
    kannada: "ಪ್ರಯಾಣ ಸುಖಕರವಾಗಿರಲಿ",
    incorrectOptions: ["ನೀನು ಎಲ್ಲಿದ್ದೀಯಾ?", "ಏನು ಮಾಡ್ತಿದ್ದೀಯಾ?", "ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ?", "ಎಲ್ಲಿಗೆ ಹೋಗ್ತಾ ಇದ್ದೀರಾ?"],
    romanKannada: "prayanna sukhakaravagirali"
  },
  {
    english: "Nice to meet you.",
    kannada: "ನಿಮ್ಮನ್ನು ಭೇಟಿಯಾದದ್ದು ಸಂತೋಷವಾಯಿತು",
    incorrectOptions: ["ನೀನು ಎಲ್ಲಿದ್ದೀಯಾ?", "ಏನು ಮಾಡ್ತಿದ್ದೀಯಾ?", "ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ?", "ಎಲ್ಲಿಗೆ ಹೋಗ್ತಾ ಇದ್ದೀರಾ?"],
    romanKannada: "nimmanu bhetiyadaddu santhosavathu"
  },
  {
    english: "I would love to.",
    kannada: "ನನಗೆ ಇಷ್ಟವಾಗುತ್ತದೆ",
    incorrectOptions: ["ನೀನು ಎಲ್ಲಿದ್ದೀಯಾ?", "ಏನು ಮಾಡ್ತಿದ್ದೀಯಾ?", "ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ?", "ಎಲ್ಲಿಗೆ ಹೋಗ್ತಾ ಇದ್ದೀರಾ?"],
    romanKannada: "nanage ishtavaguttade"
  }
];

// --- Your Curated Word Data in Batches ---
const wordBatches = [
  // ಮೊದಲ ಐವತ್ತು ಕನ್ನಡ ಪದಗಳು (First 50 Kannada Words)
  [
    { english: "and", kannada: "ಮತ್ತು", romanKannada: "mattū" },
    { english: "we", kannada: "ನಾವು", romanKannada: "nāvu" },
    { english: "a", kannada: "ಒಂದು", romanKannada: "ondu" },
    { english: "out", kannada: "ಹೊರಗೆ", romanKannada: "horage" },
    { english: "in", kannada: "ಒಳಗೆ", romanKannada: "oḷage" },
    { english: "other", kannada: "ಬೇರೆ", romanKannada: "bēre" },
    { english: "is", kannada: "ಇದೆ", romanKannada: "ide" },
    { english: "were", kannada: "ಇತ್ತು", romanKannada: "ittu" },
    { english: "it", kannada: "ಇದು", romanKannada: "idu" },
    { english: "all", kannada: "ಎಲ್ಲ", romanKannada: "ella" },
    { english: "you", kannada: "ನೀನು", romanKannada: "nīnu" },
    { english: "your", kannada: "ನಿನ್ನ", romanKannada: "ninna" },
    { english: "that", kannada: "ಅದು", romanKannada: "adu" },
    { english: "when", kannada: "ಯಾವಾಗ", romanKannada: "yāvāga" },
    { english: "he", kannada: "ಅವನು", romanKannada: "avanu" },
    { english: "use", kannada: "ಬಳಸು", romanKannada: "baḷasu" },
    { english: "was", kannada: "ಇತ್ತು", romanKannada: "ittu" },
    { english: "word", kannada: "ಶಬ್ದ", romanKannada: "śabda" },
    { english: "for", kannada: "ಅದಕ್ಕೆ", romanKannada: "adakke" },
    { english: "how", kannada: "ಹೇಗೆ", romanKannada: "hēge" },
    { english: "on", kannada: "ಮೇಲೆ", romanKannada: "mēle" },
    { english: "said", kannada: "ಹೇಳು", romanKannada: "hēḷu" },
    { english: "are", kannada: "ಇದ್ದಾರೆ", romanKannada: "iddāre" },
    { english: "each", kannada: "ಪ್ರತಿ", romanKannada: "prati" },
    { english: "with", kannada: "ಒಡನೆ", romanKannada: "oḍane" },
    { english: "she", kannada: "ಅವಳು", romanKannada: "avaḷu" },
    { english: "as", kannada: "ಅಂತೆ", romanKannada: "ante" },
    { english: "which", kannada: "ಯಾವ", romanKannada: "yāva" },
    { english: "I", kannada: "ನಾನು", romanKannada: "nānu" },
    { english: "do", kannada: "ಮಾಡು", romanKannada: "māḍu" },
    { english: "his", kannada: "ಅವನ", romanKannada: "avana" },
    { english: "their", kannada: "ಅವರ", romanKannada: "avara" },
    { english: "they", kannada: "ಅವರು", romanKannada: "avaru" },
    { english: "time", kannada: "ಸಮಯ", romanKannada: "samaya" },
    { english: "be", kannada: "ಇರು", romanKannada: "iru" },
    { english: "if", kannada: "ಆದರೆ", romanKannada: "ādare" },
    { english: "at", kannada: "ನಲ್ಲಿ", romanKannada: "nalli" },
    { english: "way", kannada: "ರೀತಿ", romanKannada: "rīti" },
    { english: "from", kannada: "ಇಂದ", romanKannada: "inda" },
    { english: "many", kannada: "ಬಹಳ", romanKannada: "bahaḷa" },
    { english: "or", kannada: "ಅಥವಾ", romanKannada: "athavā" },
    { english: "then", kannada: "ಆಗ", romanKannada: "āga" },
    { english: "hot", kannada: "ಬಿಸಿ", romanKannada: "bisi" },
    { english: "write", kannada: "ಬರೆ", romanKannada: "bare" },
    { english: "but", kannada: "ಆದರೆ", romanKannada: "ādare" },
    { english: "like", kannada: "ಇಷ್ಟ", romanKannada: "iṣṭa" },
    { english: "some", kannada: "ಕೆಲವು", romanKannada: "kelavu" },
    { english: "so", kannada: "ಹಾಗಾಗಿ", romanKannada: "hāgāgi" },
    { english: "what", kannada: "ಏನು", romanKannada: "ēnu" },
    { english: "these", kannada: "ಇವು", romanKannada: "ivu" },
    { english: "there", kannada: "ಅಲ್ಲಿ", romanKannada: "alli" }
  ],
  // ಎರಡನೇ ಐವತ್ತು ಕನ್ನಡ ಪದಗಳು (Second 50 Kannada Words)
  [
    { english: "her", kannada: "ಅವಳು", romanKannada: "avaḷu" },
    { english: "side", kannada: "ಬದಿಗೆ", romanKannada: "badige" },
    { english: "long", kannada: "ಉದ್ದ", romanKannada: "udda" },
    { english: "been", kannada: "ಇದ್ದ", romanKannada: "idda" },
    { english: "make", kannada: "ಮಾಡು", romanKannada: "māḍu" },
    { english: "now", kannada: "ಈಗ", romanKannada: "īga" },
    { english: "see", kannada: "ನೋಡು", romanKannada: "nōḍu" },
    { english: "find", kannada: "ಹುಡುಕು", romanKannada: "huḍuku" },
    { english: "him", kannada: "ಅವನು", romanKannada: "avanu" },
    { english: "any", kannada: "ಯಾವುದಾದರೂ", romanKannada: "yāvudādarū" },
    { english: "two", kannada: "ಎರಡು", romanKannada: "eraḍu" },
    { english: "new", kannada: "ಹೊಸ", romanKannada: "hosa" },
    { english: "day", kannada: "ದಿನ", romanKannada: "dina" },
    { english: "work", kannada: "ಕೆಲಸ", romanKannada: "kelasa" },
    { english: "go", kannada: "ಹೋಗು", romanKannana: "hōgu" },
    { english: "part", kannada: "ಭಾಗ", romanKannada: "bhāga" },
    { english: "come", kannada: "ಬಾ", romanKannada: "bā" },
    { english: "take", kannada: "ತಗೋ", romanKannada: "tagō" },
    { english: "did", kannada: "ಮಾಡಿದ", romanKannada: "māḍida" },
    { english: "get", kannada: "ಪಡೆ", romanKannada: "paḍe" },
    { english: "my", kannada: "ನನ್ನ", romanKannada: "nanna" },
    { english: "place", kannada: "ಸ್ಥಳ", romanKannada: "sthaḷa" },
    { english: "sound", kannada: "ಶಬ್ದ", romanKannada: "śabda" },
    { english: "made", kannada: "ಮಾಡಿದ", romanKannada: "māḍida" },
    { english: "no", kannada: "ಬೇಡ", romanKannada: "bēḍa" },
    { english: "where", kannada: "ಎಲ್ಲಿ", romanKannada: "elli" },
    { english: "most", kannada: "ಹೆಚ್ಚು", romanKannada: "heccu" },
    { english: "after", kannada: "ನಂತರ", romanKannada: "nantara" },
    { english: "number", kannada: "ಸಂಖ್ಯೆ", romanKannada: "saṅkhye" },
    { english: "back", kannada: "ಹಿಂದೆ", romanKannada: "hindhe" },
    { english: "who", kannada: "ಯಾರು", romanKannada: "yāru" },
    { english: "little", kannada: "ಸ್ವಲ್ಪ", romanKannada: "svalpa" },
    { english: "over", kannada: "ಆಯಿತು", romanKannada: "āyitu" },
    { english: "only", kannada: "ಅಷ್ಟೆ", romanKannada: "aṣṭe" },
    { english: "know", kannada: "ಗೊತ್ತು", romanKannada: "gottu" },
    { english: "round", kannada: "ಸುತ್ತು", romanKannada: "suttu" },
    { english: "water", kannada: "ನೀರು", romanKannada: "nīru" },
    { english: "man", kannada: "ಮನುಷ್ಯ", romanKannada: "manuṣya" },
    { english: "than", kannada: "ಅದಕ್ಕಿಂತ", romanKannada: "adakkinta" },
    { english: "year", kannada: "ವರ್ಷ", romanKannada: "varṣa" },
    { english: "call", kannada: "ಕರೆ", romanKannada: "kare" },
    { english: "came", kannada: "ಬಂದೆ", romanKannada: "bande" },
    { english: "first", kannada: "ಮೊದಲು", romanKannada: "modalu" },
    { english: "show", kannada: "ತೋರಿಸು", romanKannada: "tōrisu" },
    { english: "people", kannada: "ಜನ", romanKannada: "jana" },
    { english: "every", kannada: "ಪ್ರತಿ", romanKannada: "prati" },
    { english: "may", kannada: "ಇರಬಹುದು", romanKannada: "irabahudu" },
    { english: "good", kannada: "ಒಳ್ಳೆಯ", romanKannada: "oḷḷeya" },
    { english: "down", kannada: "ಕೆಳಗೆ", romanKannada: "keḷage" },
    { english: "me", kannada: "ನಾನು", romanKannada: "nānu" },
    { english: "our", kannada: "ನಮ್ಮ", romanKannada: "namma" },
    { english: "under", kannada: "ಕೆಳಗೆ", romanKannada: "keḷage" },
    { english: "name", kannada: "ಹೆಸರು", romanKannada: "hesaru" },
    { english: "very", kannada: "ತುಂಬಾ", romanKannada: "tumbā" },
    { english: "through", kannada: "ಮೂಲಕ", romanKannada: "mūlaka" }
  ],
  // 3rd 50 (Third 50 Kannada Words)
  [
    { english: "just", kannada: "ಅಷ್ಟೆ", romanKannada: "aṣṭe" },
    { english: "form", kannada: "ಸ್ವರೂಪ", romanKannada: "svarūpa" },
    { english: "think", kannada: "ಯೋಚಿಸು", romanKannada: "yōcisu" },
    { english: "say", kannada: "ಹೇಳು", romanKannada: "hēḷu" },
    { english: "help", kannada: "ಸಹಾಯ", romanKannada: "sahāya" },
    { english: "low", kannada: "ನೀಚ", romanKannada: "nīca" },
    { english: "line", kannada: "ಗೆರೆ", romanKannada: "gere" },
    { english: "before", kannada: "ಮೊದಲು", romanKannada: "modalu" },
    { english: "turn", kannada: "ತಿರುಗು", romanKannada: "tirugu" },
    { english: "cause", kannada: "ಆಗು", romanKannada: "āgu" },
    { english: "same", kannada: "ಅದೇ", romanKannada: "adē" },
    { english: "differ", kannada: "ಬೇರೆ", romanKannada: "bēre" },
    { english: "move", kannada: "ಚಲಿಸು", romanKannada: "calisu" },
    { english: "boy", kannada: "ಹುಡುಗ", romanKannada: "huḍuga" },
    { english: "old", kannada: "ಹಳೆ", romanKannada: "haḷe" },
    { english: "too", kannada: "ಅವನೂ", romanKannada: "avanū" },
    { english: "sentence", kannada: "ವಾಕ್ಯ", romanKannada: "vākya" },
    { english: "set", kannada: "ಹಚ್ಚು", romanKannada: "haccu" },
    { english: "three", kannada: "ಮೂರು", romanKannada: "mūru" },
    { english: "want", kannada: "ಬೇಕು", romanKannada: "bēku" },
    { english: "air", kannada: "ಗಾಳಿ", romanKannada: "gāḷi" },
    { english: "well", kannada: "ಬಾವಿ", romanKannada: "bāvi" },
    { english: "also", kannada: "ಅದೂ", romanKannada: "adū" },
    { english: "play", kannada: "ಆಡು", romanKannada: "āḍu" },
    { english: "small", kannada: "ಸಣ್ಣ", romanKannada: "saṇṇa" },
    { english: "end", kannada: "ತುದಿ", romanKannada: "tudi" },
    { english: "put", kannada: "ಇಡು", romanKannada: "iḍu" },
    { english: "home", kannada: "ಮನೆ", romanKannada: "mane" },
    { english: "read", kannada: "ಓದು", romanKannada: "ōdu" },
    { english: "hand", kannada: "ಕೈ", romanKannada: "kai" },
    { english: "large", kannada: "ದೊಡ್ಡ", romanKannada: "doḍḍa" },
    { english: "add", kannada: "ಕೂಡು", romanKannada: "kūḍu" },
    { english: "land", kannada: "ನೆಲ", romanKannada: "nela" },
    { english: "here", kannada: "ಇಲ್ಲಿ", romanKannada: "illi" },
    { english: "must", kannada: "ಖಂಡಿತ", romanKannada: "khaṇḍita" },
    { english: "big", kannada: "ದೊಡ್ಡ", romanKannada: "doḍḍa" },
    { english: "high", kannada: "ಎತ್ತರ", romanKannada: "ettara" },
    { english: "such", kannada: "ಹಾಗೆ", romanKannada: "hāge" },
    { english: "follow", kannada: "ಅನುಸರಿಸು", romanKannada: "anusarisu" },
    { english: "act", kannada: "ನಟನೆ", romanKannada: "naṭane" },
    { english: "why", kannada: "ಏಕೆ", romanKannada: "ēke" },
    { english: "ask", kannada: "ಕೇಳು", romanKannada: "kēḷu" },
    { english: "men", kannada: "ಗಂಡಸರು", romanKannada: "gaṇḍasaru" },
    { english: "change", kannada: "ಬದಲಿಸು", romanKannada: "badalisu" },
    { english: "went", kannada: "ಹೋದರು", romanKannada: "hōdaru" },
    { english: "light", kannada: "ಬೆಳಕು", romanKannada: "beḷaku" },
    { english: "kind", kannada: "ತರ", romanKannada: "tara" },
    { english: "off", kannada: "ನಂಚು", romanKannada: "nañcu" },
    { english: "need", kannada: "ಅವಶ್ಯ", romanKannada: "avaśya" },
    { english: "house", kannada: "ಮನೆ", romanKannada: "mane" }
  ]
];

// --- New Kannada Question Data ---
const kannadaQuestionsData = [
  { kannada: "ಯಾರು?", romanKannada: "yāru?", english: "Who?", incorrectOptions: ["What?", "When?", "Where?"] },
  { kannada: "ಏನು?", romanKannada: "ēnu?", english: "What?", incorrectOptions: ["Who?", "Why?", "How?"] },
  { kannada: "ಯಾಕೆ?", romanKannada: "yāke?", english: "Why?", incorrectOptions: ["What?", "Where?", "How?"] },
  { kannada: "ಹೇಗೆ?", romanKannada: "hēge?", english: "How?", incorrectOptions: ["Why?", "When?", "Who?"] },
  { kannada: "ಎಲ್ಲಿ?", romanKannada: "elli?", english: "Where?", incorrectOptions: ["When?", "Why?", "What?"] },
  { kannada: "ಎಷ್ಟು?", romanKannada: "eṣṭu?", english: "How much?", incorrectOptions: ["How?", "How many?", "What?"] },
  { kannada: "ಯಾರದ್ದು?", romanKannada: "yāraddu?", english: "Whose?", incorrectOptions: ["Who?", "Which?", "Why?"] },
  { kannada: "ಯಾವುದು?", romanKannada: "yāvudu?", english: "Which?", incorrectOptions: ["What?", "Who?", "Why?"] },
  { kannada: "ಯಾವ?", romanKannada: "yāva?", english: "Which (one)?", incorrectOptions: ["Who?", "What?", "When?"] },
  { kannada: "ಯಾವಾಗ?", romanKannada: "yāvāga?", english: "When?", incorrectOptions: ["Where?", "How?", "Why?"] },
  { kannada: "ಸರಿಯಾ?", romanKannada: "sariyā?", english: "Is it right?", incorrectOptions: ["Is it wrong?", "Is it good?", "Is it bad?"] },
  { kannada: "ತಪ್ಪಾ?", romanKannada: "tappā?", english: "Is it wrong?", incorrectOptions: ["Is it right?", "Is it good?", "Is it okay?"] },
  { kannada: "ಇದಾ?", romanKannada: "idā?", english: "This one?", incorrectOptions: ["That one?", "Which one?", "Any one?"] },
  { kannada: "ಅದಾ?", romanKannada: "adā?", english: "That one?", incorrectOptions: ["This one?", "Which one?", "Some one?"] },
  { kannada: "ಆಯಿತಾ?", romanKannada: "āyitā?", english: "Is it done?", incorrectOptions: ["Is it starting?", "Is it finished?", "Is it ready?"] },
  { kannada: "ಮಾಡ್ತಾ ಇದ್ದೀರಾ?", romanKannada: "māḍtā iddīrā?", english: "Are you doing?", incorrectOptions: ["Are you coming?", "Are you going?", "Are you eating?"] },
  { kannada: "ಓಡ್ತಾ ಇದ್ದೀರಾ?", romanKannada: "ōḍtā iddīrā?", english: "Are you running?", incorrectOptions: ["Are you walking?", "Are you sitting?", "Are you eating?"] },
  { kannada: "ಮಳೆ ಬರುತ್ತಾ?", romanKannada: "maḷe baruttā?", english: "Does it rain?", incorrectOptions: ["Does it snow?", "Is it hot?", "Is it cold?"] },
  { kannada: "ಹಿಮ ಬೀಳುತ್ತಾ?", romanKannada: "hima bīḷuttā?", english: "Does snow fall?", incorrectOptions: ["Does it rain?", "Is it windy?", "Is it sunny?"] },
  { kannada: "ಹಾಡುತ್ತೀಯಾ?", romanKannada: "hāḍuttīyā?", english: "Will you sing?", incorrectOptions: ["Will you dance?", "Will you play?", "Will you read?"] },
  { kannada: "ಓಡುತ್ತೀಯಾ?", romanKannada: "ōḍuttīyā?", english: "Will you run?", incorrectOptions: ["Will you walk?", "Will you jump?", "Will you eat?"] },
  { kannada: "ನೋಡಿದೀಯಾ?", romanKannada: "nōḍidīyā?", english: "Have you seen it?", incorrectOptions: ["Have you heard it?", "Have you done it?", "Have you eaten it?"] },
  { kannada: "ಬೇಕಾ?", romanKannada: "bēkā?", english: "Do you want it?", incorrectOptions: ["Do you need it?", "Do you have it?", "Do you like it?"] },
  { kannada: "ಬೇಡವಾ?", romanKannada: "bēḍavā?", english: "Do you not want it?", incorrectOptions: ["Do you want it?", "Do you need it?", "Do you like it?"] },
  { kannada: "ಹೌದಾ?", romanKannada: "haudā?", english: "Is that so?", incorrectOptions: ["Is that false?", "Is that right?", "Is that wrong?"] },
  { kannada: "ಅಲ್ವಾ?", romanKannada: "alvā?", english: "Is that not so?", incorrectOptions: ["Is that so?", "Is it right?", "Is it wrong?"] },
];

// --- New Minimal Learning Sentences Data ---
const minimalLearningSentences = [
  // Pronouns & Basic Verbs (Present Tense)
  { english: "I eat.", kannada: "ನಾನು ತಿನ್ನುತ್ತೇನೆ.", incorrectOptions: ["ನಾನು ಓದುತ್ತೇನೆ.", "ನಾನು ಕುಡಿಯುತ್ತೇನೆ.", "ನಾನು ಹೋಗುತ್ತೇನೆ."], romanKannada: "nānu tinnuttēne." },
  { english: "You (formal) go.", kannada: "ನೀವು ಹೋಗುತ್ತೀರಾ.", incorrectOptions: ["ನೀನು ಹೋಗುತ್ತೀಯಾ.", "ನೀವು ಬರುತ್ತೀರಾ.", "ನೀವು ತಿನ್ನುತ್ತೀರಾ."], romanKannada: "nīvu hōguttīrā." },
  { english: "You (informal) come.", kannada: "ನೀನು ಬರುತ್ತೀಯಾ.", incorrectOptions: ["ನೀನು ಹೋಗುತ್ತೀಯಾ.", "ನೀನು ತಿನ್ನುತ್ತೀಯಾ.", "ನೀನು ಓದುತ್ತೀಯಾ."], romanKannada: "nīnu baruttīyā." },
  { english: "He drinks water.", kannada: "ಅವನು ನೀರು ಕುಡಿಯುತ್ತಾನೆ.", incorrectOptions: ["ಅವಳು ನೀರು ಕುಡಿಯುತ್ತಾಳೆ.", "ಅವನು ಹಾಲು ಕುಡಿಯುತ್ತಾನೆ.", "ಅವನು ನೀರು ಕುಡಿಯಲಿಲ್ಲ."], romanKannada: "avanu nīru kuḍiyuttāne." },
  { english: "She learns Kannada.", kannada: "ಅವಳು ಕನ್ನಡ ಕಲಿಯುತ್ತಾಳೆ.", incorrectOptions: ["ಅವನು ಕನ್ನಡ ಕಲಿಯುತ್ತಾನೆ.", "ಅವಳು ಇಂಗ್ಲಿಷ್ ಕಲಿಯುತ್ತಾಳೆ.", "ಅವಳು ಕನ್ನಡ ಕಲಿಸಿದಳು."], romanKannada: "avaḷu kannaḍa kaliyuttāḷe." },
  { english: "It runs.", kannada: "ಅದು ಓಡುತ್ತದೆ.", incorrectOptions: ["ಅದು ನಡೆಯುತ್ತದೆ.", "ಅದು ಕುಳಿತುಕೊಳ್ಳುತ್ತದೆ.", "ಅದು ಮಲಗುತ್ತದೆ."], romanKannada: "adu ōḍuttade." },
  { english: "We read books.", kannada: "ನಾವು ಪುಸ್ತಕಗಳನ್ನು ಓದುತ್ತೇವೆ.", incorrectOptions: ["ನಾವು ಪುಸ್ತಕಗಳನ್ನು ಬರೆಯುತ್ತೇವೆ.", "ನಾವು ಪಾಠಗಳನ್ನು ಓದುತ್ತೇವೆ.", "ನಾವು ಪುಸ್ತಕಗಳನ್ನು ತಿಂದೆವು."], romanKannada: "nāvu pustakagaḷannu ōduttēve." },
  { english: "They sleep.", kannada: "ಅವರು ಮಲಗುತ್ತಾರೆ.", incorrectOptions: ["ಅವರು ಏಳುತ್ತಾರೆ.", "ಅವರು ತಿನ್ನುತ್ತಾರೆ.", "ಅವರು ಆಡುತ್ತಾರೆ."], romanKannada: "avaru malaguttāre." },

  // Past Tense
  { english: "I ate food.", kannada: "ನಾನು ಊಟ ತಿಂದೆ.", incorrectOptions: ["ನಾನು ಊಟ ತಿನ್ನುತ್ತೇನೆ.", "ನಾನು ನೀರು ತಿಂದೆ.", "ನಾನು ತಿನ್ನಲಿಲ್ಲ."], romanKannana: "nānu ūṭa tinde." },
  { english: "You (formal) came yesterday.", kannada: "ನೀವು ನಿನ್ನೆ ಬಂದಿರಿ.", incorrectOptions: ["ನೀನು ನಿನ್ನೆ ಬಂದೆ.", "ನೀವು ನಾಳೆ ಬರ್ತೀರಾ.", "ನೀವು ಇಂದು ಬಂದಿರಿ."], romanKannana: "nīvu ninne bandiri." },
  { english: "He spoke.", kannada: "ಅವನು ಮಾತನಾಡಿದ.", incorrectOptions: ["ಅವಳು ಮಾತನಾಡಿದಳು.", "ಅವನು ಮಾತನಾಡುತ್ತಾನೆ.", "ಅವನು ಕೇಳಿದ."], romanKannada: "avanu mātanaḍida." },
  { english: "She wrote a letter.", kannada: "ಅವಳು ಪತ್ರ ಬರೆದಳು.", incorrectOptions: ["ಅವನು ಪತ್ರ ಬರೆದನು.", "ಅವಳು ಪುಸ್ತಕ ಬರೆದಳು.", "ಅವಳು ಪತ್ರ ಓದಿದಳು."], romanKannada: "avaḷu patra baredaḷu." },
  { english: "We played.", kannada: "ನಾವು ಆಡಿದೆವು.", incorrectOptions: ["ನಾವು ಓದಿದೆವು.", "ನಾವು ಮಾತನಾಡಿದೆವು.", "ನಾವು ಆಡುತ್ತೇವೆ."], romanKannada: "nāvu āḍidevu." },

  // Future Tense
  { english: "I will go tomorrow.", kannada: "ನಾನು ನಾಳೆ ಹೋಗುತ್ತೇನೆ.", incorrectOptions: ["ನಾನು ಇಂದು ಹೋಗುತ್ತೇನೆ.", "ನಾನು ನಾಳೆ ಬಂದೆ.", "ನಾನು ನಾಳೆ ಹೋಗಲಿಲ್ಲ."], romanKannana: "nānu nāḷe hōguttēne." },
  { english: "You (informal) will study.", kannada: "ನೀನು ಓದುತ್ತೀಯಾ.", incorrectOptions: ["ನೀನು ಓದಿದೆ.", "ನೀನು ಆಡುತ್ತೀಯಾ.", "ನೀನು ಓದು."], romanKannada: "nīnu ōduttīyā." },
  { english: "They will come.", kannada: "ಅವರು ಬರುತ್ತಾರೆ.", incorrectOptions: ["ಅವರು ಬಂದರು.", "ಅವರು ಹೋಗುತ್ತಾರೆ.", "ಅವರು ತಿನ್ನುತ್ತಾರೆ."], romanKannada: "avaru baruttāre." },

  // Numbers (simple usage)
  { english: "One book.", kannada: "ಒಂದು ಪುಸ್ತಕ.", incorrectOptions: ["ಎರಡು ಪುಸ್ತಕ.", "ಒಂದು ಪೆನ್.", "ಹಲವು ಪುಸ್ತಕ."], romanKannada: "ondu pustaka." },
  { english: "Two girls.", kannada: "ಎರಡು ಹುಡುಗಿಯರು.", incorrectOptions: ["ಮೂರು ಹುಡುಗಿಯರು.", "ಒಂದು ಹುಡುಗಿ.", "ಎರಡು ಹುಡುಗರು."], romanKannada: "eraḍu huḍugiyaru." },
  { english: "Three flowers.", kannada: "ಮೂರು ಹೂಗಳು.", incorrectOptions: ["ನಾಲ್ಕು ಹೂಗಳು.", "ಎರಡು ಹೂಗಳು.", "ಮೂರು ಎಲೆಗಳು."], romanKannada: "mūru hūgaḷu." },

  // Prepositions (simple usage)
  { english: "The book is on the table.", kannada: "ಪುಸ್ತಕ ಮೇಜಿನ ಮೇಲೆ ಇದೆ.", incorrectOptions: ["ಪುಸ್ತಕ ಮೇಜಿನ ಕೆಳಗೆ ಇದೆ.", "ಪುಸ್ತಕ ಮೇಜಿನ ಒಳಗೆ ಇದೆ.", "ಪುಸ್ತಕ ಮೇಜಿನ ಹತ್ತಿರ ಇದೆ."], romanKannada: "pustaka mējina mēle ide." },
  { english: "The cat is under the chair.", kannada: "ಬೆಕ್ಕು ಕುರ್ಚಿಯ ಕೆಳಗೆ ಇದೆ.", incorrectOptions: ["ಬೆಕ್ಕು ಕುರ್ಚಿಯ ಮೇಲೆ ಇದೆ.", "ಬೆಕ್ಕು ಕುರ್ಚಿಯ ಒಳಗೆ ಇದೆ.", "ಬೆಕ್ಕು ಕುರ್ಚಿಯ ಹಿಂದೆ ಇದೆ."], romanKannada: "bekku kurciya keḷage ide." },
  { english: "I am in the house.", kannada: "ನಾನು ಮನೆಯಲ್ಲಿ ಇದ್ದೇನೆ.", incorrectOptions: ["ನಾನು ಹೊರಗೆ ಇದ್ದೇನೆ.", "ನಾನು ಶಾಲೆಗೆ ಹೋಗುತ್ತೇನೆ.", "ನಾನು ಮಲಗುತ್ತೇನೆ."], romanKannada: "nānu maneyalli iddēne." },
  { english: "Come with me.", kannada: "ನನ್ನ ಜೊತೆ ಬಾ.", incorrectOptions: ["ನಿನ್ನ ಜೊತೆ ಬಾ.", "ನನ್ನ ಜೊತೆ ಹೋಗು.", "ನನ್ನ ಜೊತೆ ನಿಲ್ಲು."], romanKannada: "nanna jote bā." },
  { english: "He came from Bangalore.", kannada: "ಅವನು ಬೆಂಗಳೂರಿನಿಂದ ಬಂದ.", incorrectOptions: ["ಅವನು ಬೆಂಗಳೂರಿಗೆ ಹೋದ.", "ಅವನು ಬೆಂಗಳೂರಿನಲ್ಲಿ ಇದ್ದಾನೆ.", "ಅವನು ಬೆಂಗಳೂರಿನಿಂದ ಬಂದಿಲ್ಲ."], romanKannada: "avanu beṅgaḷūrininda banda." },
  { english: "Go to school.", kannada: "ಶಾಲೆಗೆ ಹೋಗು.", incorrectOptions: ["ಶಾಲೆಗೆ ಬನ್ನಿ.", "ಮನೆಗೆ ಹೋಗು.", "ಕೆಲಸಕ್ಕೆ ಹೋಗು."], romanKannada: "śālege hōgu." }
];


// Pool of all possible English answers for generating distractors in Word and Kannada Question quizzes
const allPossibleEnglishAnswers = Array.from(new Set([
    ...allSentences.map(s => s.english),
    ...wordBatches.flat().map(w => w.english),
    ...kannadaQuestionsData.map(q => q.english),
    ...minimalLearningSentences.map(s => s.english),
    "Is that so?", "Is it wrong?", "Is it good?", "Is it bad?", "Is it okay?", // Additional common English question meanings
    "Is it starting?", "Is it finished?", "Is it ready?", "Are you coming?", "Are you going?", "Are you eating?",
    "Are you walking?", "Are you sitting?", "Are you eating?", "Does it snow?", "Is it hot?", "Is it cold?",
    "Is it windy?", "Is it sunny?", "Will you dance?", "Will you play?", "Will you read?", "Will you jump?", "Will you eat?",
    "Have you heard it?", "Have you done it?", "Have you eaten it?", "Do you need it?", "Do you have it?", "Do you like it?",
    "Is that false?", "Is that right?", "Is that not so?",
    // Common verbs, adjectives, and nouns to expand distractor pool
    "run", "walk", "sing", "dance", "play", "sleep", "read", "write", "learn", "teach", "come", "go", "do",
    "book", "water", "food", "house", "car", "phone", "time", "day", "night", "morning", "evening",
    "good", "bad", "big", "small", "happy", "sad", "tired", "hungry", "thirsty", "busy", "free",
    "yes", "no", "okay", "please", "thank you", "sorry", "hello", "goodbye",
    "on", "in", "under", "over", "with", "from", "to", "at", "before", "after", "here", "there", "this", "that", "any", "some"
]));


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
const generateOptions = (quizType, correctAnswer, allIncorrectOptionsForKannada, allPossibleEnglishAnswersPool = []) => {
  if (quizType === 'sentence' || quizType === 'minimalLearning') {
    // For sentence and minimal learning, prompt is English, options are Kannada
    const uniqueIncorrectOptions = allIncorrectOptionsForKannada.filter(
      option => option !== correctAnswer
    );

    let chosenIncorrect = [];
    if (uniqueIncorrectOptions.length >= 3) {
      chosenIncorrect = shuffleArray(uniqueIncorrectOptions).slice(0, 3);
    } else {
      chosenIncorrect = [...uniqueIncorrectOptions];
      // Fallback: If not enough unique incorrect options, add generic Kannada placeholders
      while (chosenIncorrect.length < 3) {
        chosenIncorrect.push(`[ಆಯ್ಕೆ ${chosenIncorrect.length + 1}]`); // Kannada for "Option"
      }
    }
    const options = shuffleArray([correctAnswer, ...chosenIncorrect]);
    return options;
  } else { // quizType === 'word' || quizType === 'kannadaQuestion'
    // For word and Kannada question, prompt is Kannada, options are English
    const incorrectEnglishOptions = allPossibleEnglishAnswersPool.filter(
      word => word !== correctAnswer
    );

    // Ensure we pick 3 unique incorrect options
    const chosenIncorrect = shuffleArray(incorrectEnglishOptions).slice(0, 3);
    
    // Fallback if not enough unique incorrect options are available globally
    while (chosenIncorrect.length < 3 && allPossibleEnglishAnswersPool.length > 1) {
        const randomWord = allPossibleEnglishAnswersPool[Math.floor(Math.random() * allPossibleEnglishAnswersPool.length)];
        if (randomWord !== correctAnswer && !chosenIncorrect.includes(randomWord)) {
            chosenIncorrect.push(randomWord);
        }
    }
    // If still less than 3, add generic placeholders
    while (chosenIncorrect.length < 3) {
      chosenIncorrect.push(`[Meaning ${chosenIncorrect.length + 1}]`);
    }

    const options = shuffleArray([correctAnswer, ...chosenIncorrect]);
    return options;
  }
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
  const [currentWordBatchIndex, setCurrentWordBatchIndex] = useState(0);
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
      let actualNumQuestions = numQuestions; // Default, might be overridden for specific quiz types

      if (quizType === 'sentence') {
        questionsSource = allSentences;
      } else if (quizType === 'word') {
        // Use selectedWordBatchForStart for fetching questions when starting the quiz
        questionsSource = wordBatches[selectedWordBatchForStart] || [];
        actualNumQuestions = questionsSource.length; // Fixed to batch size
      } else if (quizType === 'kannadaQuestion') {
        questionsSource = kannadaQuestionsData;
        actualNumQuestions = questionsSource.length; // Fixed to data length
      } else if (quizType === 'minimalLearning') {
        questionsSource = minimalLearningSentences;
        actualNumQuestions = questionsSource.length; // Fixed to data length
      }

      setSessionQuestions(getRandomQuestions(questionsSource, actualNumQuestions));
      setCurrentQuestionIndex(0); // Reset question index for new quiz/batch
      setScore(0); // Reset score for new quiz/batch
      setSelectedOption(null); // Reset selected option
    }
  }, [quizStarted, quizFinished, quizType, numQuestions, selectedWordBatchForStart]); // Changed dependency to selectedWordBatchForStart

  // Memoize options for the current question
  const options = useMemo(() => {
    if (currentQuestion) {
      if (quizType === 'sentence' || quizType === 'minimalLearning') {
        return generateOptions(quizType, currentQuestion.kannada, currentQuestion.incorrectOptions);
      } else { // quizType === 'word' || quizType === 'kannadaQuestion'
        return generateOptions(quizType, currentQuestion.english, [], allPossibleEnglishAnswers); // Pass allPossibleEnglishAnswers for distractors
      }
    }
    return [];
  }, [currentQuestion, quizType, allPossibleEnglishAnswers]); // allPossibleEnglishAnswers is a new dependency for relevant quiz types


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

    let maxQuestions;
    if (quizType === 'sentence') {
      maxQuestions = allSentences.length;
    } else if (quizType === 'word') {
      // Use selectedWordBatchForStart for the maxQuestions here
      maxQuestions = wordBatches[selectedWordBatchForStart].length;
    } else if (quizType === 'kannadaQuestion') {
        maxQuestions = kannadaQuestionsData.length;
    } else if (quizType === 'minimalLearning') {
        maxQuestions = minimalLearningSentences.length;
    }

    // Set numQuestions to fixed batch/data length for Word, Kannada Question, and Minimal Learning quizzes
    let adjustedNumQuestions = numQuestions;
    if (quizType === 'word' || quizType === 'kannadaQuestion' || quizType === 'minimalLearning') {
        adjustedNumQuestions = maxQuestions;
    }

    if (adjustedNumQuestions > 0 && adjustedNumQuestions <= maxQuestions) {
      setNumQuestions(adjustedNumQuestions); // Update numQuestions state
      setQuizStarted(true);
      setQuizFinished(false);
      setQuizStartTime(Date.now());
      // sessionQuestions will be set by the useEffect now
    } else {
      alert(`Please enter a number between 1 and ${maxQuestions} for the number of questions.`);
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
          const percentage = (score / sessionQuestions.length) * 100;
          if (percentage >= 80) {
            if (selectedWordBatchForStart < wordBatches.length - 1) { // Check selected batch, not currentWordBatchIndex
              // Unlock next batch and proceed
              setUnlockedWordBatches(prev => {
                if (!prev.includes(selectedWordBatchForStart + 1)) { // Use selectedWordBatchForStart
                  return [...prev, selectedWordBatchForStart + 1];
                }
                return prev;
              });
              alert(`Congratulations! You scored ${percentage.toFixed(0)}%. Batch ${selectedWordBatchForStart + 1} completed! Moving to the next batch.`);
              setSelectedWordBatchForStart(prevIndex => prevIndex + 1); // Move to next batch to be loaded
              setQuizStarted(false); // Go back to start screen to show results and new batch selection
              setQuizFinished(true); // Show results for current batch
            } else {
              setQuizFinished(true); // All batches completed
              alert(`Congratulations! You scored ${percentage.toFixed(0)}%. You have completed all available word batches!`);
            }
          } else {
            alert(`You scored ${percentage.toFixed(0)}%. You need at least 80% to unlock the next batch. Please repeat this batch to improve.`);
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
    setNumQuestions(50); // Reset to default
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedOption(null);
    setQuizFinished(false);
    setSessionQuestions([]);
    setStudentName('');
    setQuizStartTime(null);
    setQuizDuration('');
    setCurrentWordBatchIndex(0); // Reset word batch index used for initial selection styling
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
      setCurrentWordBatchIndex(index); // Also update this for visual feedback
      setNumQuestions(wordBatches[index].length); // Set numQuestions to batch size
    } else {
      alert("This batch is locked. Please complete the previous batches with at least 80% score to unlock it.");
    }
  };

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

          <div className="quiz-type-selection">
            <label className={`quiz-type-label ${quizType === 'sentence' ? 'selected' : ''}`}>
              <input
                type="radio"
                value="sentence"
                checked={quizType === 'sentence'}
                onChange={() => { playButtonClick(); setQuizType('sentence'); setNumQuestions(50); setSelectedWordBatchForStart(0); }}
              />
              ವಾಕ್ಯ ರಸಪ್ರಶ್ನೆ (Sentence Quiz)
            </label>
            <label className={`quiz-type-label ${quizType === 'word' ? 'selected' : ''}`}>
              <input
                type="radio"
                value="word"
                checked={quizType === 'word'}
                onChange={() => { playButtonClick(); setQuizType('word'); setNumQuestions(wordBatches[selectedWordBatchForStart].length); }}
              />
              ಪದ ರಸಪ್ರಶ್ನೆ (Word Quiz)
            </label>
            <label className={`quiz-type-label ${quizType === 'kannadaQuestion' ? 'selected' : ''}`}>
              <input
                type="radio"
                value="kannadaQuestion"
                checked={quizType === 'kannadaQuestion'}
                onChange={() => { playButtonClick(); setQuizType('kannadaQuestion'); setNumQuestions(kannadaQuestionsData.length); setSelectedWordBatchForStart(0); }}
              />
              ಕನ್ನಡ ಪ್ರಶ್ನೆ (Kannada Question Quiz)
            </label>
            <label className={`quiz-type-label ${quizType === 'minimalLearning' ? 'selected' : ''}`}>
              <input
                type="radio"
                value="minimalLearning"
                checked={quizType === 'minimalLearning'}
                onChange={() => { playButtonClick(); setQuizType('minimalLearning'); setNumQuestions(minimalLearningSentences.length); setSelectedWordBatchForStart(0); }}
              />
              ಕನ್ನಡ ಪಾಠ (Kannada Lesson Quiz)
            </label>
          </div>

          {quizType === 'sentence' && (
            <>
              <p>Choose how many questions you want to practice:</p>
              <div className="input-group">
                <input
                  type="number"
                  min="1"
                  max={allSentences.length}
                  value={numQuestions}
                  onChange={(e) => setNumQuestions(Math.min(Number(e.target.value), allSentences.length))}
                  className="num-questions-input"
                />
                <span className="available-sentences">(Available: {allSentences.length} sentences)</span>
              </div>
              <button onClick={handleStartQuiz} className="start-button">Start Sentence Quiz</button>
            </>
          )}

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
                    Batch {index + 1} {unlockedWordBatches.includes(index) ? '' : '🔒'}
                  </button>
                ))}
              </div>
              <p className="batch-info">Total words available across all batches: {wordBatches.flat().length}</p>
              <button onClick={handleStartQuiz} className="start-button" disabled={!unlockedWordBatches.includes(selectedWordBatchForStart)}>
                Start Word Quiz (Batch {selectedWordBatchForStart + 1})
              </button>
            </>
          )}

          {(quizType === 'kannadaQuestion' || quizType === 'minimalLearning') && (
            <>
                <p>This quiz type has a fixed number of questions for learning.</p>
                <div className="input-group">
                    <input
                        type="number"
                        value={numQuestions} // This will display the fixed number
                        readOnly // Make it read-only
                        className="num-questions-input"
                    />
                    <span className="available-sentences">
                        (Available: {quizType === 'kannadaQuestion' ? kannadaQuestionsData.length : minimalLearningSentences.length} questions)
                    </span>
                </div>
                <button onClick={handleStartQuiz} className="start-button">
                    Start {quizType === 'kannadaQuestion' ? "Kannada Question Quiz" : "Kannada Lesson Quiz"}
                </button>
            </>
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
                <p className="kannada-word-question">{currentQuestion.kannada} ({currentQuestion.romanKannada})</p> {/* Added space here */}
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
            For Word Quiz: ensure the selected batch is green (unlocked) to play. Score 80% to unlock next batch.
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
