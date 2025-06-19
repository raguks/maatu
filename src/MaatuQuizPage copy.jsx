import React, { useState, useEffect, useMemo, useRef } from 'react';
import './MaatuQuizPage.css'; // Renamed CSS file

// --- Your Curated Data ---
// IMPORTANT: Ensure each entry has enough UNIQUE incorrectOptions
// to allow for selecting 3 distinct incorrect answers.
// Add all your sentences with the new 'romanKannada' field!
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
    incorrectOptions: ["ನನಗೆ ಹಸಿವಾಗಿದೆ", "ನನಗೆ ಬೇಜಾರು", "ನನಗೆ ಖುಷಿಯಾಗಿದೆ", "ನನಗೆ ನಿದ್ದೆ ಬರ್ತಿದೆ"],
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
    incorrectOptions: ["ನನಗೆ ಗೊತ್ತು", "ನ ನಾನು ಮರೆತೆ", "ನಾನು ಕಲಿತೆ", "ನಾನು ನೋಡಿದೆ"],
    romanKannada: "nanage gottilla"
  },
  {
    english: "I forgot.",
    kannada: "ನಾನು ಮರೆತೆ.",
    incorrectOptions: ["ನಾನು ನೆನಪಿದೆ", "ನಾನು ಕಲಿತೆ", "ನಾನು ನೋಡಿದೆ", "ನಾನು ತಿಳಿದುಕೊಂಡೆ"],
    romanKannada: "nānu marete."
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
    romanKannada: "nanage tinḍi koḍtīrā?"
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
    romanKannada: "nanage huṣārilla"
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
    romanKannada: "nānu atte"
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
    incorrectOptions: ["ಅವನು ಅತ್ತ (ಅವನು ಅಳುತ್ತಾ ಇದ್ದ)", "ಅವನು ಓಡಿದ (ಅವನು ಓಡುತ್ತಾ ಇದ್ದ)", "ಅವನು ಕುಡಿದ (ಅವನು ಕುಡಿಯುತ್ತಾ ಇದ್ದ)", "ಅವನು ತಿಂದ (ಅವನು ತಿನ್ನುತ್ತಾ ಇದ್ದ)"],
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
    romanKannada: "avaḷu naḍītā iddāḷe"
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
    romanKannada: "avaḷu tindaḷu"
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
    romanKannada: "avaḷu kuḍidaḷu"
  },
  {
    english: "Open the door.",
    kannada: "ಬಾಗಿಲು ತೆರೆಯಿರಿ",
    incorrectOptions: ["ಬಾಗಿಲು ಮುಚ್ಚಿ", "ಬಾಗಿಲು ಹಾಕಿ", "ಬಾಗಿಲು ಎತ್ತಿ", "ಬಾಗಿಲು ಬಿಡಿ"],
    romanKannada: "bāgilu tereyiri"
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
];

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
const generateOptions = (correctAnswer, allIncorrectOptions) => {
  // Filter out any incorrect options that happen to be the correct answer
  const uniqueIncorrectOptions = allIncorrectOptions.filter(
    option => option !== correctAnswer
  );

  let chosenIncorrect = [];
  if (uniqueIncorrectOptions.length >= 3) {
    // If enough unique incorrect options, pick 3 randomly
    chosenIncorrect = shuffleArray(uniqueIncorrectOptions).slice(0, 3);
  } else {
    // Fallback: If not enough unique incorrect options, take all available
    // and if still less than 3, add generic placeholders to reach 4 total options.
    chosenIncorrect = [...uniqueIncorrectOptions]; // Copy to be safe
    while (chosenIncorrect.length < 3) {
      // Use a generic placeholder or repeat options if necessary for 4 choices
      // Ideally, your allSentences data should have diverse incorrectOptions.
      chosenIncorrect.push(`[Option ${chosenIncorrect.length + 1}]`);
    }
  }

  const options = shuffleArray([correctAnswer, ...chosenIncorrect]);
  return options;
};

// --- React Component ---
function QuizPage() {
  const [quizStarted, setQuizStarted] = useState(false);
  const [numQuestions, setNumQuestions] = useState(10); // Default to 10 questions
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [quizFinished, setQuizFinished] = useState(false);
  const [showLearningFeedback, setShowLearningFeedback] = useState(false); // Controls display of correct answer/listen button

  // Use a separate state to store the actual questions for the current quiz session.
  // This array won't be cleared when quizFinished is true, preventing 0/0 errors.
  const [sessionQuestions, setSessionQuestions] = useState([]);

  // When the quiz starts, populate sessionQuestions
  useEffect(() => {
    if (quizStarted && !quizFinished && sessionQuestions.length === 0) {
      const actualNumQuestions = Math.min(numQuestions, allSentences.length);
      setSessionQuestions(getRandomQuestions(allSentences, actualNumQuestions));
    }
  }, [quizStarted, quizFinished, numQuestions, sessionQuestions.length]);


  const currentQuestion = sessionQuestions[currentQuestionIndex];

  // Memoize options to ensure they don't re-shuffle on every render for the current question
  const options = useMemo(() => {
    if (currentQuestion) {
      return generateOptions(currentQuestion.kannada, currentQuestion.incorrectOptions);
    }
    return [];
  }, [currentQuestion]);

  // Web Speech API setup
  const synth = window.speechSynthesis;
  const [kannadaVoice, setKannadaVoice] = useState(null);

  // Load voices asynchonously and find Kannada voice
  useEffect(() => {
    if (!synth) {
      console.warn("Web Speech API not supported in this browser.");
      return;
    }

    const loadVoices = () => {
      const voices = synth.getVoices();
      // Prioritize exact kn-IN match, then general 'kannada' in name
      const foundVoice = voices.find(voice => voice.lang === 'kn-IN' || voice.name.toLowerCase().includes('kannada'));
      if (foundVoice) {
        setKannadaVoice(foundVoice);
        console.log("Kannada voice loaded:", foundVoice.name, "Lang:", foundVoice.lang);
      } else {
        console.warn("Kannada voice not found. Using default voice if available.");
        console.log("Available voices:", voices.map(v => ({ name: v.name, lang: v.lang }))); // Log all available voices for debugging
      }
    };

    // Load voices immediately if they are already available
    if (synth.getVoices().length > 0) {
      loadVoices();
    } else {
      // Otherwise, wait for voices to be loaded
      synth.onvoiceschanged = loadVoices;
    }

    // Cleanup: remove event listener if component unmounts
    return () => {
      if (synth.onvoiceschanged) {
        synth.onvoiceschanged = null;
      }
    };
  }, [synth]); // Dependency array: run once when synth changes

  const speakKannada = (text) => {
    if (!synth) {
      console.warn("Web Speech API not supported in this browser.");
      alert("Text-to-speech is not supported in your browser.");
      return;
    }
    if (synth.speaking) {
      synth.cancel(); // Stop any ongoing speech
    }
    const utterance = new SpeechSynthesisUtterance(text);

    // Apply the found Kannada voice, or let the browser pick default if not found
    if (kannadaVoice) {
      utterance.voice = kannadaVoice;
      utterance.lang = kannadaVoice.lang; // Use the actual lang of the found voice
    } else {
      utterance.lang = 'kn-IN'; // Fallback to explicitly setting lang if voice not found
    }

    // Optional: Adjust pitch/rate if needed
    // utterance.pitch = 1;
    // utterance.rate = 1;

    try {
      synth.speak(utterance);
      console.log("Attempting to speak:", text);
    } catch (error) {
      console.error("Error speaking:", error);
      alert("Could not play audio. Check browser console for details.");
    }
  };

  const handleStartQuiz = () => {
    if (numQuestions > 0 && numQuestions <= allSentences.length) {
      setQuizStarted(true);
      setCurrentQuestionIndex(0);
      setScore(0);
      setSelectedOption(null);
      setQuizFinished(false);
      setShowLearningFeedback(false);
      // Generate and set session questions here
      setSessionQuestions(getRandomQuestions(allSentences, Math.min(numQuestions, allSentences.length)));
    } else {
      alert(`Please enter a number between 1 and ${allSentences.length} for the number of questions.`);
    }
  };

  const handleOptionSelect = (option) => {
    if (selectedOption === null) { // Allow selection only if not already picked
      setSelectedOption(option);
      setShowLearningFeedback(true); // Show feedback area after selection
    }
  };

  const handleNextQuestion = () => {
    if (selectedOption !== null) {
      // Stop any ongoing speech before moving to next question
      if (synth && synth.speaking) {
        synth.cancel();
      }

      if (selectedOption === currentQuestion.kannada) {
        setScore(prevScore => prevScore + 1);
      }

      const nextIndex = currentQuestionIndex + 1;
      if (nextIndex < sessionQuestions.length) { // Use sessionQuestions.length here
        setCurrentQuestionIndex(nextIndex);
        setSelectedOption(null); // Reset selection for next question
        setShowLearningFeedback(false); // Hide feedback for next question
      } else {
        setQuizFinished(true);
      }
    } else {
      alert("Please select an answer before proceeding.");
    }
  };

  const handleListenToLearn = () => {
    if (currentQuestion && currentQuestion.romanKannada) {
      // Use the romanKannada field for speech synthesis
      speakKannada(currentQuestion.romanKannada);
    } else if (currentQuestion) {
      // Fallback to Kannada script if romanKannada is missing (shouldn't happen if data is complete)
      console.warn("romanKannada field missing for current question, falling back to Kannada script.");
      speakKannada(currentQuestion.kannada);
    }
  };

  const resetQuiz = () => {
    // Stop any ongoing speech
    if (synth && synth.speaking) {
      synth.cancel();
    }
    setQuizStarted(false);
    setNumQuestions(10); // Reset to default
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedOption(null);
    setQuizFinished(false);
    setShowLearningFeedback(false);
    setSessionQuestions([]); // Clear session questions on reset
  };

  const getOptionClassName = (option) => {
    if (selectedOption === null) {
      return "option-button"; // Default style before selection
    }
    if (option === currentQuestion.kannada) {
      return "option-button correct"; // Correct answer styling
    }
    if (option === selectedOption && option !== currentQuestion.kannada) {
      return "option-button incorrect"; // Incorrectly selected answer styling
    }
    return "option-button"; // Other unselected options
  };

  return (
    <div className="quiz-container">
      <h1>Daily Kannada Quiz (ಮನೆಯ ಮಾತು ಕಲಿ)</h1>

      {!quizStarted && (
        <div className="quiz-settings">
          <p>Choose how many questions you want to practice:</p>
          <div className="input-group">
            <input
              type="number"
              min="1"
              // Max should be the actual length of allSentences
              max={allSentences.length}
              value={numQuestions}
              onChange={(e) => setNumQuestions(Math.min(Number(e.target.value), allSentences.length))}
              className="num-questions-input"
            />
            <span className="available-sentences">(Available: {allSentences.length} sentences)</span>
          </div>
          <button onClick={handleStartQuiz} className="start-button">Start Quiz</button>
        </div>
      )}

      {quizStarted && !quizFinished && currentQuestion && (
        <div className="quiz-content">
          <p className="question-counter">Question {currentQuestionIndex + 1} / {sessionQuestions.length}</p> {/* Use sessionQuestions.length */}
          <div className="question-box">
            <p className="english-sentence">{currentQuestion.english}</p>
          </div>

          <div className="options-grid">
            {options.map((option, index) => (
              <button
                key={index}
                className={getOptionClassName(option)}
                onClick={() => handleOptionSelect(option)}
                disabled={selectedOption !== null} // Disable after selection
              >
                {option}
              </button>
            ))}
          </div>

          {selectedOption !== null && (
            <div className="feedback-area">
              <button
                onClick={handleListenToLearn}
                className="listen-button"
              >
                Listen to Learn
              </button>
              <button onClick={handleNextQuestion} className="next-button">
                {currentQuestionIndex === sessionQuestions.length - 1 ? "Finish Quiz" : "Next Question"}
              </button>
            </div>
          )}
        </div>
      )}

      {quizFinished && (
        <div className="quiz-results">
          <h2>Quiz Finished!</h2>
          <p className="final-score">
            Your Score: {score} / {sessionQuestions.length} ({sessionQuestions.length > 0 ? ((score / sessionQuestions.length) * 100).toFixed(0) : 0}%)
          </p>
          <button onClick={resetQuiz} className="reset-button">Start New Quiz</button>
        </div>
      )}
    </div>
  );
}

export default QuizPage;
