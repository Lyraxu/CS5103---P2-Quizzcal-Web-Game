const { createApp } = Vue;

createApp({
  data() {
    return {
      originalPhrase: "",
      maskedPhrase: "",
      correctNumber: null,
      guessedLetters: [],
      phraseGuess: "",
      numberGuess: null,
      score: 26, // Starting score
      scores: [], // Session scoreboard
      gameOver: false,
      resultMessage: "",
      sortKey: "score", // Default sort key
      alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""), // Alphabet for letter buttons
    };
  },
  computed: {
    // Generate the spaced version of the masked phrase
    spacedMaskedPhrase() {
      return this.maskedPhrase.split("").join(" ");
    },
    // Sort scores based on selected sort key
    sortedScores() {
      return [...this.scores].sort((a, b) => {
        if (this.sortKey === "score") return b.score - a.score;
        if (this.sortKey === "number") return a.number - b.number;
        if (this.sortKey === "phrase") return a.phrase.localeCompare(b.phrase);
      });
    },
  },
  methods: {
    // Fetch a new fact from the API or fallback data
    async fetchFact() {
      try {
        const response = await fetch("http://numbersapi.com/random/math?json");
        const data = await response.json();
        this.setupGame(data);
      } catch (error) {
        console.error("Fetching from API failed. Using local data.");
        this.setupGame({ text: "The Loneliest Number", number: 1 });
      }
    },
    // Initialize the game
    setupGame(data) {
      this.originalPhrase = data.text.toUpperCase();
      this.correctNumber = data.number;
      this.maskedPhrase = this.originalPhrase.replace(/[A-Z]/g, "_");
      this.guessedLetters = [];
      this.phraseGuess = "";
      this.numberGuess = null;
      this.score = 26;
      this.gameOver = false;
      this.resultMessage = "";
    },
    // Handle letter guesses
    guessLetter(letter) {
      this.guessedLetters.push(letter);
      if (this.originalPhrase.includes(letter)) {
        this.revealLetters(letter);
      } else {
        this.score--; // Deduct score for incorrect guesses
      }
    },
    // Reveal letters in the phrase
    revealLetters(letter) {
      this.maskedPhrase = this.maskedPhrase
        .split("")
        .map((char, i) => (this.originalPhrase[i] === letter ? letter : char))
        .join("");
    },
    // Submit the phrase and number guesses
    submitAnswer() {
      this.gameOver = true;
      const phraseCorrect =
        this.phraseGuess.toUpperCase() === this.originalPhrase;
      const numberCorrect = parseInt(this.numberGuess) === this.correctNumber;

      if (phraseCorrect && numberCorrect) {
        this.score += 4;
        this.resultMessage = "Congratulations! You guessed both correctly!";
      } else if (phraseCorrect || numberCorrect) {
        this.score = Math.floor(this.score / 2);
        this.resultMessage = phraseCorrect
          ? "You guessed the phrase correctly, but not the number."
          : "You guessed the number correctly, but not the phrase.";
      } else {
        this.score = 0;
        this.resultMessage = "Sorry, you guessed both incorrectly.";
      }

      // Add to scoreboard
      this.scores.push({
        score: this.score,
        number: this.correctNumber,
        phrase: this.originalPhrase,
      });
    },
    // Start a new game
    startNewGame() {
      this.fetchFact();
    },
    // Sort scores
    sortScores() {
      // Automatically re-sorted via computed property
    },
  },
  mounted() {
    this.fetchFact();
  },
}).mount("#app");
