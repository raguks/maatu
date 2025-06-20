// AksharaData.js - Data for Kannada Letter Identification Quizzes

// Helper function to generate incorrect transliteration options
// It tries to pick diverse options to avoid easily guessing
const generateIncorrectTransliterations = (correctTransliteration, allPossibleTransliterations, count = 3) => {
  const incorrectCandidates = allPossibleTransliterations.filter(
    (item) => item !== correctTransliteration && !item.startsWith('[') // Exclude placeholders
  );

  // Shuffle and pick `count` unique incorrect options
  let chosenIncorrect = [];
  const shuffledCandidates = [...incorrectCandidates].sort(() => 0.5 - Math.random());

  for (let i = 0; i < shuffledCandidates.length && chosenIncorrect.length < count; i++) {
    if (!chosenIncorrect.includes(shuffledCandidates[i])) {
      chosenIncorrect.push(shuffledCandidates[i]);
    }
  }

  // Fallback: If not enough unique incorrect options from the pool,
  // add generic placeholders to ensure `count` incorrect options.
  while (chosenIncorrect.length < count) {
    chosenIncorrect.push(`translit${chosenIncorrect.length + 1}`); // Generic placeholder
  }
  return chosenIncorrect;
};


// --- 1. Vowels (Svaragalu - ಸ್ವರಗಳು) ---
const varnamaleSvaras = [
  { kannada: "ಅ", romanKannada: "a" },
  { kannada: "ಆ", romanKannada: "aa" },
  { kannada: "ಇ", romanKannada: "i" },
  { kannada: "ಈ", romanKannada: "ee" },
  { kannada: "ಉ", romanKannada: "u" },
  { kannada: "ಊ", romanKannada: "oo" },
  { kannada: "ಋ", romanKannada: "ru" },
  { kannada: "ೠ", romanKannada: "ruu" }, // Long ru
  { kannada: "ಎ", romanKannada: "e" },
  { kannada: "ಏ", romanKannada: "ē" },
  { kannada: "ಐ", romanKannada: "ai" },
  { kannada: "ಒ", romanKannada: "o" },
  { kannada: "ಓ", romanKannada: "ō" },
  { kannada: "ಔ", romanKannada: "au" },
  { kannada: "ಅಂ", romanKannada: "am" }, // Anusvara
  { kannada: "ಅಃ", romanKannada: "aha" }  // Visarga
];

// --- 2. Consonants (Vyanjanagalu - ವ್ಯಂಜನಗಳು) ---
const varnamaleVyanjanas = [
  { kannada: "ಕ", romanKannada: "ka" }, { kannada: "ಖ", romanKannada: "kha" }, { kannada: "ಗ", romanKannada: "ga" }, { kannada: "ಘ", romanKannada: "gha" }, { kannada: "ಙ", romanKannada: "nga" },
  { kannada: "ಚ", romanKannada: "cha" }, { kannada: "ಛ", romanKannada: "chha" }, { kannada: "ಜ", romanKannada: "ja" }, { kannada: "ಝ", romanKannada: "jha" }, { kannada: "ಞ", romanKannada: "nya" },
  { kannada: "ಟ", romanKannada: "ṭa" }, { kannada: "ಠ", romanKannada: "ṭha" }, { kannada: "ಡ", romanKannada: "ḍa" }, { kannada: "ಢ", romanKannada: "ḍha" }, { kannada: "ಣ", romanKannada: "ṇa" },
  { kannada: "ತ", romanKannada: "ta" }, { kannada: "ಥ", romanKannada: "tha" }, { kannada: "ದ", romanKannada: "da" }, { kannada: "ಧ", romanKannada: "dha" }, { kannada: "ನ", romanKannada: "na" },
  { kannada: "ಪ", romanKannada: "pa" }, { kannada: "ಫ", romanKannada: "pha" }, { kannada: "ಬ", romanKannada: "ba" }, { kannada: "ಭ", romanKannada: "bha" }, { kannada: "ಮ", romanKannada: "ma" },
  { kannada: "ಯ", romanKannada: "ya" }, { kannada: "ರ", romanKannada: "ra" }, { kannada: "ಱ", romanKannada: "ṟa" }, // Retroflex R
  { kannada: "ಲ", romanKannada: "la" }, { kannada: "ವ", romanKannada: "va" }, { kannada: "ಶ", romanKannada: "sha" }, { kannada: "ಷ", romanKannada: "ṣa" }, { kannada: "ಸ", romanKannada: "sa" },
  { kannada: "ಹ", romanKannada: "ha" }, { kannada: "ಳ", romanKannada: "ḷa" }, { kannada: "ೞ", romanKannada: "ḻa" } // Hard L, very rare, often replaced by ಳ
];

// Combine all individual Varnamale (alphabets)
export const varnamale = (() => {
  const allTransliterations = [...varnamaleSvaras, ...varnamaleVyanjanas].map(item => item.romanKannada);
  return [...varnamaleSvaras, ...varnamaleVyanjanas].map(item => ({
    ...item,
    incorrectOptions: generateIncorrectTransliterations(item.romanKannada, allTransliterations)
  }));
})();


// --- 3. Kaagunita (Vowel-extended Consonants - ಕಾಗುಣಿತ) ---
const vowels = [
  { char: "", translit: "" }, // For the base consonant form
  { char: "ಾ", translit: "ā" },
  { char: "ಿ", translit: "i" },
  { char: "ೀ", translit: "ī" },
  { char: "ು", translit: "u" },
  { char: "ೂ", translit: "ū" },
  { char: "ೃ", translit: "ṛ" },
  { char: "ೄ", translit: "ṝ" }, // Long r
  { char: "ೆ", translit: "e" },
  { char: "ೇ", translit: "ē" },
  { char: "ೈ", translit: "ai" },
  { char: "ೊ", translit: "o" },
  { char: "ೋ", translit: "ō" },
  { char: "ೌ", translit: "au" },
  { char: "ಂ", translit: "am" },
  { char: "ಃ", translit: "aḥ" }
];

export const kaagunita = (() => {
  const kaagunitaForms = [];
  const allTransliterations = [];

  // Generate all kaagunita forms and collect all possible transliterations
  varnamaleVyanjanas.forEach(consonant => {
    vowels.forEach(vowel => {
      const kannada = consonant.kannada + vowel.char;
      const romanKannada = consonant.romanKannada.slice(0, -1) + vowel.translit; // Remove base 'a' and add new vowel translit
      allTransliterations.push(romanKannada);
      kaagunitaForms.push({ kannada, romanKannada });
    });
  });

  // Now, add incorrect options for each kaagunita form
  return kaagunitaForms.map(form => ({
    ...form,
    incorrectOptions: generateIncorrectTransliterations(form.romanKannada, allTransliterations)
  }));
})();


// --- 4. Ottakshara (Compound Consonants - ಒತ್ತಕ್ಷರ) ---
// A curated list of common Ottaksharas
export const ottakshara = (() => {
  const ottaksharaList = [
    { kannada: "ಕ್ಕ", romanKannada: "kka" },
    { kannada: "ಗ್ಗ", romanKannada: "gga" },
    { kannada: "ಚ್ಚ", romanKannada: "chcha" },
    { kannada: "ಜ್ಜ", romanKannada: "jja" },
    { kannada: "ಟ್ಟ", romanKannada: "ṭṭa" },
    { kannada: "ಡ್ಡೆ", romanKannada: "ḍḍe" }, // Example with vowel sign
    { kannada: "ಣ್ಣ", romanKannada: "ṇṇa" },
    { kannada: "ತ್ತ", romanKannada: "tta" },
    { kannada: "ದ್ದ", romanKannada: "dda" },
    { kannada: "ನ್ನ", romanKannada: "nna" },
    { kannada: "ಪ್ಪ", romanKannada: "ppa" },
    { kannada: "ಬ್ಬ", romanKannada: "bba" },
    { kannada: "ಮ್ಮ", romanKannada: "mma" },
    { kannada: "ಯ್ಯ", romanKannada: "yya" },
    { kannada: "ಲ್ಲ", romanKannada: "lla" },
    { kannada: "ವ್ವ", romanKannada: "vva" },
    { kannada: "ಶ್ಶ", romanKannada: "shsha" },
    { kannada: "ಸ್ಸ", romanKannada: "ssa" },
    { kannada: "ಳ್ಳ", romanKannada: "ḷḷa" },
    { kannada: "ಕ್ಷ", romanKannada: "kṣa" }, // Special conjunct
    { kannada: "ಜ್ಞ", romanKannada: "jñya" } // Special conjunct
  ];

  const allTransliterations = ottaksharaList.map(item => item.romanKannada);

  return ottaksharaList.map(item => ({
    ...item,
    incorrectOptions: generateIncorrectTransliterations(item.romanKannada, allTransliterations)
  }));
})();

// Consolidate all possible transliterations for broader incorrect option selection
export const allPossibleLetterTransliterations = [
    ...varnamale.map(item => item.romanKannada),
    ...kaagunita.map(item => item.romanKannada),
    ...ottakshara.map(item => item.romanKannada),
    // Add common ITRANS variations to increase distractor pool quality
    "k", "ka", "kā", "ki", "kī", "ku", "kū", "kr", "krr", "ke", "kē", "kai", "ko", "kō", "kau", "kam", "kaH",
    "g", "ga", "ch", "ja", "t", "d", "n", "p", "b", "m", "y", "r", "l", "v", "s", "h",
    "a", "aa", "i", "ii", "u", "uu", "e", "E", "ai", "o", "O", "au", "am", "aH",
    "ta", "tha", "da", "dha", "na", "pa", "pha", "ba", "bha", "ma",
    "ya", "ra", "la", "va", "sha", "ṣa", "sa", "ha", "ḷa",
    "ksha", "jna", "kra", "nka", "ppa", "jja", "ddu", "tta", "nn", "mm", "vv"
];

// --- New: Ottakshara Words Data (Added here for simplicity, could be in QuizData.js) ---
export const ottaksharaWordsData = [
  { english: "dog (f.)", kannada: "ನಾಯಿ", romanKannada: "nāyi", incorrectOptions: ["cat", "bird", "fish"] },
  { english: "sun", kannada: "ಸೂರ್ಯ", romanKannada: "sūrya", incorrectOptions: ["moon", "star", "sky"] },
  { english: "teacher", kannada: "ಶಿಕ್ಷಕ", romanKannada: "śikṣaka", incorrectOptions: ["student", "doctor", "engineer"] },
  { english: "fruit", kannada: "ಹಣ್ಣು", romanKannada: "haṇṇu", incorrectOptions: ["vegetable", "flower", "tree"] },
  { english: "door", kannada: "ಬಾಗಿಲು", romanKannada: "bāgilu", incorrectOptions: ["window", "wall", "roof"] },
  { english: "street", kannada: "ರಸ್ತೆ", romanKannada: "raste", incorrectOptions: ["road", "path", "lane"] },
  { english: "school", kannada: "ಶಾಲೆ", romanKannada: "śāle", incorrectOptions: ["college", "university", "office"] },
  { english: "child", kannada: "ಮಗು", romanKannada: "magu", incorrectOptions: ["adult", "baby", "elder"] },
  { english: "water", kannada: "ನೀರು", romanKannada: "nīru", incorrectOptions: ["milk", "juice", "tea"] },
  { english: "fire", kannada: "ಬೆಂಕಿ", romanKannada: "beṅki", incorrectOptions: ["water", "air", "earth"] },
  { english: "book", kannada: "ಪುಸ್ತಕ", romanKannada: "pustaka", incorrectOptions: ["pen", "pencil", "paper"] },
  { english: "car", kannada: "ಕಾರು", romanKannada: "kāru", incorrectOptions: ["bike", "bus", "train"] },
  { english: "house", kannada: "ಮನೆ", romanKannada: "mane", incorrectOptions: ["apartment", "building", "hut"] },
  { english: "tree", kannada: "ಮರ", romanKannada: "mara", incorrectOptions: ["plant", "bush", "flower"] },
  { english: "flower", kannada: "ಹೂವು", romanKannada: "hūvu", incorrectOptions: ["leaf", "stem", "root"] },
  { english: "food", kannada: "ಊಟ", romanKannada: "ūṭa", incorrectOptions: ["drink", "snack", "meal"] },
  { english: "hand", kannada: "ಕೈ", romanKannada: "kai", incorrectOptions: ["foot", "leg", "arm"] },
  { english: "leg", kannada: "ಕಾಲು", romanKannada: "kālu", incorrectOptions: ["hand", "arm", "foot"] },
  { english: "eye", kannada: "ಕಣ್ಣು", romanKannada: "kaṇṇu", incorrectOptions: ["ear", "nose", "mouth"] },
  { english: "ear", kannada: "ಕಿವಿ", romanKannada: "kivi", incorrectOptions: ["eye", "nose", "mouth"] },
  { english: "nose", kannada: "ಮೂಗು", romanKannada: "mūgu", incorrectOptions: ["eye", "ear", "mouth"] },
  { english: "mouth", kannada: "ಬಾಯಿ", romanKannada: "bāyi", incorrectOptions: ["eye", "ear", "nose"] },
  { english: "head", kannada: "ತಲೆ", romanKannada: "tale", incorrectOptions: ["body", "hand", "leg"] },
  { english: "hair", kannada: "ಕೂದಲು", romanKannada: "kūdalu", incorrectOptions: ["skin", "nail", "tooth"] },
  { english: "table", kannada: "ಮೇಜು", romanKannada: "mēju", incorrectOptions: ["chair", "bed", "sofa"] },
  { english: "chair", kannada: "ಕುರ್ಚಿ", romanKannada: "kurci", incorrectOptions: ["table", "bed", "sofa"] },
  { english: "bed", kannada: "ಹಾಸಿಗೆ", romanKannada: "hāsige", incorrectOptions: ["table", "chair", "sofa"] },
  { english: "sleep", kannada: "ನಿದ್ದೆ", romanKannada: "nidde", incorrectOptions: ["wake up", "eat", "drink"] },
  { english: "day", kannada: "ದಿನ", romanKannada: "dina", incorrectOptions: ["night", "morning", "evening"] },
  { english: "night", kannada: "ರಾತ್ರಿ", romanKannada: "rātri", incorrectOptions: ["day", "morning", "evening"] },
  { english: "morning", kannada: "ಬೆಳಿಗ್ಗೆ", romanKannada: "beḷigge", incorrectOptions: ["night", "evening", "afternoon"] },
  { english: "evening", kannada: "ಸಂಜೆ", romanKannada: "saṃje", incorrectOptions: ["night", "morning", "afternoon"] },
  { english: "tomorrow", kannada: "ನಾಳೆ", romanKannada: "nāḷe", incorrectOptions: ["yesterday", "today", "day after tomorrow"] },
  { english: "yesterday", kannada: "ನಿನ್ನೆ", romanKannada: "ninne", incorrectOptions: ["tomorrow", "today", "day before yesterday"] },
  { english: "today", kannada: "ಇವತ್ತು", romanKannada: "ivattu", incorrectOptions: ["tomorrow", "yesterday", "day after tomorrow"] },
  { english: "new", kannada: "ಹೊಸ", romanKannada: "hosa", incorrectOptions: ["old", "big", "small"] },
  { english: "old", kannada: "ಹಳೆಯ", romanKannada: "haḷeya", incorrectOptions: ["new", "big", "small"] },
  { english: "big", kannada: "ದೊಡ್ಡ", romanKannada: "doḍḍa", incorrectOptions: ["small", "new", "old"] },
  { english: "small", kannada: "ಚಿಕ್ಕ", romanKannada: "cikka", incorrectOptions: ["big", "new", "old"] },
  { english: "good", kannada: "ಒಳ್ಳೆಯ", romanKannada: "oḷḷeya", incorrectOptions: ["bad", "big", "small"] },
  { english: "bad", kannada: "ಕೆಟ್ಟ", romanKannada: "keṭṭa", incorrectOptions: ["good", "big", "small"] },
  { english: "happy", kannada: "ಖುಷಿ", romanKannada: "khuṣi", incorrectOptions: ["sad", "angry", "tired"] },
  { english: "sad", kannada: "ಬೇಸರ", romanKannada: "bēsara", incorrectOptions: ["happy", "angry", "tired"] },
  { english: "angry", kannada: "ಕೋಪ", romanKannada: "kōpa", incorrectOptions: ["happy", "sad", "tired"] },
  { english: "tired", kannada: "ಸುಸ್ತು", romanKannada: "sustu", incorrectOptions: ["happy", "sad", "angry"] },
  { english: "hot", kannada: "ಬಿಸಿ", romanKannada: "bisi", incorrectOptions: ["cold", "warm", "cool"] },
  { english: "cold", kannada: "ಚಳಿ", romanKannada: "caḷi", incorrectOptions: ["hot", "warm", "cool"] },
  { english: "rain", kannada: "ಮಳೆ", romanKannada: "maḷe", incorrectOptions: ["sun", "wind", "cloud"] },
  { english: "wind", kannada: "ಗಾಳಿ", romanKannada: "gāḷi", incorrectOptions: ["sun", "rain", "cloud"] },
  { english: "cloud", kannada: "ಮೋಡ", romanKannada: "mōḍa", incorrectOptions: ["sun", "rain", "wind"] },
  { english: "star", kannada: "ನಕ್ಷತ್ರ", romanKannada: "nakṣatra", incorrectOptions: ["sun", "moon", "planet"] },
  { english: "river", kannada: "ನದಿ", romanKannada: "nadi", incorrectOptions: ["lake", "sea", "ocean"] },
  { english: "mountain", kannada: "ಪರ್ವತ", romanKannada: "parvata", incorrectOptions: ["hill", "valley", "plain"] },
  { english: "road", kannada: "ರಸ್ತೆ", romanKannada: "raste", incorrectOptions: ["path", "lane", "street"] },
  { english: "village", kannada: "ಗ್ರಾಮ", romanKannada: "grāma", incorrectOptions: ["city", "town", "countryside"] },
  { english: "city", kannada: "ನಗರ", romanKannada: "nagara", incorrectOptions: ["village", "town", "countryside"] },
  { english: "country", kannada: "ದೇಶ", romanKannada: "dēśa", incorrectOptions: ["state", "city", "continent"] },
  { english: "world", kannada: "ಲೋಕ", romanKannada: "lōka", incorrectOptions: ["earth", "universe", "planet"] },
  { english: "sky", kannada: "ಆಕಾಶ", romanKannada: "ākāśa", incorrectOptions: ["earth", "cloud", "sun"] },
  { english: "earth", kannada: "ಭೂಮಿ", romanKannada: "bhūmi", incorrectOptions: ["sky", "sun", "moon"] },
  { english: "moon", kannada: "ಚಂದ್ರ", romanKannada: "candra", incorrectOptions: ["sun", "star", "planet"] },
  { english: "family", kannada: "ಕುಟುಂಬ", romanKannada: "kuṭuṃba", incorrectOptions: ["friends", "neighbors", "colleagues"] },
  { english: "friend", kannada: "ಸ್ನೇಹಿತ", romanKannada: "snēhita", incorrectOptions: ["enemy", "stranger", "acquaintance"] },
  { english: "mother", kannada: "ಅಮ್ಮ", romanKannada: "ammā", incorrectOptions: ["father", "brother", "sister"] },
  { english: "father", kannada: "ಅಪ್ಪ", romanKannada: "appā", incorrectOptions: ["mother", "brother", "sister"] },
  { english: "brother", kannada: "ಅಣ್ಣ", romanKannada: "aṇṇa", incorrectOptions: ["sister", "mother", "father"] },
  { english: "sister", kannada: "ಅಕ್ಕ", romanKannada: "akka", incorrectOptions: ["brother", "mother", "father"] },
  { english: "grandma", kannada: "ಅಜ್ಜಿ", romanKannada: "ajji", incorrectOptions: ["grandpa", "mother", "father"] },
  { english: "grandpa", kannada: "ಅಜ್ಜ", romanKannada: "ajja", incorrectOptions: ["grandma", "mother", "father"] },
  { english: "student", kannada: "ವಿದ್ಯಾರ್ಥಿ", romanKannada: "vidyārthi", incorrectOptions: ["teacher", "doctor", "engineer"] },
  { english: "doctor", kannada: "ವೈದ್ಯ", romanKannada: "vaidya", incorrectOptions: ["teacher", "student", "engineer"] },
  { english: "food", kannada: "ಆಹಾರ", romanKannada: "āhāra", incorrectOptions: ["water", "drink", "snack"] },
  { english: "milk", kannada: "ಹಾಲು", romanKannada: "hālu", incorrectOptions: ["water", "juice", "tea"] },
  { english: "tea", kannada: "ಚಹಾ", romanKannada: "cahā", incorrectOptions: ["coffee", "milk", "water"] },
  { english: "coffee", kannada: "ಕಾಫಿ", romanKannada: "kāphi", incorrectOptions: ["tea", "milk", "water"] },
  { english: "sugar", kannada: "ಸಕ್ಕರೆ", romanKannada: "sakkare", incorrectOptions: ["salt", "spice", "honey"] },
  { english: "salt", kannada: "ಉಪ್ಪು", romanKannada: "uppu", incorrectOptions: ["sugar", "spice", "honey"] },
  { english: "rice", kannada: "ಅನ್ನ", romanKannada: "anna", incorrectOptions: ["roti", "bread", "noodles"] },
  { english: "bread", kannada: "ಬ್ರೆಡ್", romanKannada: "breḍ", incorrectOptions: ["rice", "roti", "noodles"] },
  { english: "vegetable", kannada: "ತರಕಾರಿ", romanKannada: "tarakāri", incorrectOptions: ["fruit", "meat", "fish"] },
  { english: "meat", kannada: "ಮಾಂಸ", romanKannada: "māṃsa", incorrectOptions: ["vegetable", "fruit", "fish"] },
  { english: "fish", kannada: "ಮೀನು", romanKannada: "mīnu", incorrectOptions: ["meat", "chicken", "egg"] },
  { english: "egg", kannada: "ಮೊಟ್ಟೆ", romanKannada: "moṭṭe", incorrectOptions: ["chicken", "fish", "meat"] },
  { english: "chicken", kannada: "ಕೋಳಿ", romanKannada: "kōḷi", incorrectOptions: ["meat", "fish", "egg"] },
  { english: "pen", kannada: "ಪೆನ್", romanKannada: "pen", incorrectOptions: ["pencil", "book", "paper"] },
  { english: "pencil", kannada: "ಪೆನ್ಸಿಲ್", romanKannada: "pensil", incorrectOptions: ["pen", "book", "paper"] },
  { english: "paper", kannada: "ಕಾಗದ", romanKannada: "kāgada", incorrectOptions: ["book", "pen", "pencil"] },
  { english: "bag", kannada: "ಬ್ಯಾಗ್", romanKannada: "byāg", incorrectOptions: ["box", "basket", "container"] },
  { english: "box", kannada: "ಪೆಟ್ಟಿಗೆ", romanKannada: "peṭṭige", incorrectOptions: ["bag", "basket", "container"] },
  { english: "money", kannada: "ದುಡ್ಡು", romanKannada: "duḍḍu", incorrectOptions: ["gold", "silver", "diamond"] },
  { english: "time", kannada: "ಸಮಯ", romanKannada: "samaya", incorrectOptions: ["clock", "watch", "hour"] },
  { english: "happy", kannada: "ಸಂತೋಷ", romanKannada: "saṃtōṣa", incorrectOptions: ["sad", "angry", "tired"] },
  { english: "hungry", kannada: "ಹಸಿವು", romanKannada: "hasivu", incorrectOptions: ["thirsty", "sleepy", "tired"] },
  { english: "thirsty", kannada: "ನೀರಡಿಕೆ", romanKannada: "nīraḍike", incorrectOptions: ["hungry", "sleepy", "tired"] },
  { english: "sleepy", kannada: "ನಿದ್ದೆ", romanKannada: "nidde", incorrectOptions: ["hungry", "thirsty", "tired"] },
  { english: "sick", kannada: "ಅನಾರೋಗ್ಯ", romanKannada: "anārōgya", incorrectOptions: ["healthy", "fine", "good"] },
  { english: "well", kannada: "ಚೆನ್ನಾಗಿ", romanKannada: "cennāgi", incorrectOptions: ["badly", "poorly", "sick"] },
  { english: "beautiful", kannada: "ಸುಂದರ", romanKannada: "sundara", incorrectOptions: ["ugly", "big", "small"] },
  { english: "ugly", kannada: "ಕೆಟ್ಟದಾದ", romanKannada: "keṭṭadāda", incorrectOptions: ["beautiful", "big", "small"] },
  { english: "fast", kannada: "ವೇಗ", romanKannada: "vēga", incorrectOptions: ["slow", "quick", "rapid"] },
  { english: "slow", kannada: "ನಿಧಾನ", romanKannada: "nidhāna", incorrectOptions: ["fast", "quick", "rapid"] },
  { english: "clean", kannada: "ಸ್ವಚ್ಛ", romanKannada: "svaccha", incorrectOptions: ["dirty", "messy", "unclean"] },
  { english: "dirty", kannada: "ಕೊಳಕು", romanKannada: "koḷaku", incorrectOptions: ["clean", "messy", "unclean"] },
  { english: "cold", kannada: "ತಂಪು", romanKannada: "tampu", incorrectOptions: ["hot", "warm", "cool"] }
];

// Ensure the generateIncorrectTransliterations in this file uses the broader pool
// (This is handled by passing `allPossibleTransliterations` to the helper)
