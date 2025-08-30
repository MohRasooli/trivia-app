import React, { useState, useEffect } from "react";
import he from "he";
import darkIcon from "../assets/images/dark-mode-icon.png";

export default function SecondPage({ darkMode, setDarkMode }) {
  // The quiz questions and answers ready to show
  const [quizItems, setQuizItems] = useState([]);

  // Raw trivia data straight from the API
  const [triviaData, setTriviaData] = useState(null);

  // All the categories we can pick from
  const [apiCategoryData, setApiCategoryData] = useState(null);

  // What the user picked for each question
  const [userAnswers, setUserAnswers] = useState([]);

  // Any errors we run into while fetching data
  const [error, setError] = useState(null);

  // Is the quiz finished?
  const [isGameOver, setIsGameOver] = useState(false);

  // User's correct answers counter
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);

  // Is the user changing settings right now in the sidebar?
  const [userChangingSettings, setUserChangingSettings] = useState(false);

  // simple localStorage state
  const [userLocalStorage, setUserLocalStorage] = useState(
    JSON.parse(localStorage.getItem("userLocalValues") || null)
  );

  // User's current category/difficulty
  const [userSettings, setUserSettings] = useState({
    category: userLocalStorage?.category ?? 0,
    difficulty: userLocalStorage?.difficulty ?? "any-difficulty",
  });

  // Sets the localStorage

  useEffect(() => {
    localStorage.setItem("userLocalValues", JSON.stringify(userLocalStorage));
  }, [userLocalStorage]);

  useEffect(() => {
    document.body.classList.toggle("dark", darkMode);
  }, [darkMode]);

  // Fetches the data from api and runs it at the startup

  function getCategoryData() {
    return fetch("https://opentdb.com/api_category.php")
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        setApiCategoryData(data.trivia_categories);
      });
  }

  function getData() {
    setError(null);

    const url = `https://opentdb.com/api.php?amount=5${
      Number(userSettings.category) !== 0
        ? `&category=${Number(userSettings.category)}`
        : ""
    }${
      userSettings.difficulty !== `any-difficulty`
        ? `&difficulty=${userSettings.difficulty}`
        : ""
    }`;

    setTimeout(() => {
      return fetch(url)
        .then((res) => {
          if (res.status === 429) throw new Error("Too Many Requests");
          if (res.status < 200 || res.status >= 300) {
            throw new Error(`Request failed with status ${res.status}`);
          }

          return res.json();
        })
        .then((data) => {
          setTriviaData(data);
        })
        .catch((err) => {
          console.error("Error fetching data:", err);
          setError(err.message);
        });
    }, 2500);
  }

  useEffect(() => {
    getCategoryData();
    getData();
  }, []);

  // Stores the data fetched from api to a local state "quizArray"

  useEffect(() => {
    if (!triviaData?.results) return;

    const quizArray = triviaData.results.map((data, index) => {
      const options = [...data.incorrect_answers];
      const randomNumber = Math.floor(Math.random() * (options.length + 1));
      options.splice(randomNumber, 0, data.correct_answer);
      return {
        question: data.question,
        answers: options,
        id: index,
        correctAnswer: data.correct_answer,
      };
    });

    setQuizItems(quizArray);
  }, [triviaData]);

  // Sets the user answers based on their selected labels for each question

  function handleAnswerChange(data, answer) {
    setUserAnswers((preVal) => {
      const foundMatch = preVal.some((e) => e.id === data.id);
      if (foundMatch) {
        return preVal.map((item) =>
          item.id === data.id ? { ...item, userAnswer: answer } : item
        );
      } else {
        return [...preVal, { id: data.id, userAnswer: answer }];
      }
    });
  }

  // Determines the default and the isGameOver state's className for labels

  function labelClassName(data, answer) {
    if (!isGameOver) {
      return "answers";
    }

    const foundMatch = userAnswers.find((u) => u.id === data.id);

    if (answer === data.correctAnswer) {
      return "correct-answer";
    }

    if (foundMatch && foundMatch.userAnswer === answer) {
      return "wrong-answer";
    }

    return "game-over";
  }

  // Checks the answer and saves it to localStorage

  function checkAnswers() {
    if (!isGameOver && userAnswers.length < quizItems.length) {
      window.alert("Please answer all questions, even if you're not sure.");
    } else {
      const correctCount = userAnswers.filter((u) => {
        const q = quizItems.find((qItem) => qItem.id === u.id);
        return u.userAnswer === q.correctAnswer;
      }).length;
      setCorrectAnswersCount(correctCount);
      setUserLocalStorage((prev) =>
        prev !== null
          ? {
              ...prev,
              correctCount: prev.correctCount + correctCount,
              totalQuestions: prev.totalQuestions + quizItems.length,
            }
          : {
              correctCount: correctCount,
              totalQuestions: quizItems.length,
            }
      );
      setIsGameOver(true);
    }
  }

  // Starts a new game after isGameOver

  function startNewGame() {
    setQuizItems([]);
    setTriviaData(null);
    setUserAnswers([]);
    setError(null);
    setUserChangingSettings(false);
    setIsGameOver(false);
    getData();
  }

  // For the game-status section where the localStorage data is shown

  function handleResetLocalHistory() {
    const result = window.confirm(
      "Are you sure you want to reset your score history?"
    );
    if (result) {
      setUserLocalStorage({
        correctCount: 0,
        totalQuestions: 0,
      });
    } else {
      return;
    }
  }

  // Code for the sidebar

  function changingSettings() {
    setUserChangingSettings((prev) => !prev);
  }

  function handleDarkMode() {
    setDarkMode((prev) => {
      const newTheme = !prev;
      setUserLocalStorage((prev) => ({
        ...prev,
        darkMode: newTheme,
      }));
      return newTheme;
    });
  }

  function handleUserSettingsChange(e) {
    e.preventDefault();
    const form = e.target;

    const selectedDifficulty = form.difficulty.value;
    const selectedCategory = form.category.value;

    setUserSettings((prev) => ({
      ...prev,
      category: Number(selectedCategory),
      difficulty: selectedDifficulty,
    }));
    setUserLocalStorage((prev) => ({
      ...prev,
      category: Number(selectedCategory),
      difficulty: selectedDifficulty,
    }));
    startNewGame();
  }

  return (
    <>
      {!error ? (
        <section className="second-page">
          {!triviaData && !error ? (
            <p className="loading-trivia">Loading trivia...</p>
          ) : null}

          {error && error.includes("Too Many Requests") && (
            <div className="error-message">
              <h3>API limit reached. Click below to try again.</h3>

              <button
                onClick={() => {
                  setError(null);
                  getData();
                }}
              >
                Try Again
              </button>
            </div>
          )}

          {userLocalStorage !== null && triviaData ? (
            <div className="user-storage-panel">
              <span
                title={`${
                  userLocalStorage.totalQuestions > 0
                    ? (userLocalStorage.correctCount /
                        userLocalStorage.totalQuestions) *
                      100
                    : 0
                }% correct`}
              >
                Correct: {userLocalStorage.correctCount}
              </span>
              <span
                title={`${
                  userLocalStorage.totalQuestions > 0
                    ? (userLocalStorage.correctCount /
                        userLocalStorage.totalQuestions) *
                      100
                    : 0
                }% correct`}
              >
                Total Questions: {userLocalStorage.totalQuestions}
              </span>
              {userLocalStorage.totalQuestions > 0 ? (
                <button
                  onClick={handleResetLocalHistory}
                  title="Reset your quiz history"
                  className="reset-ls-btn"
                >
                  ⟲
                </button>
              ) : null}
            </div>
          ) : null}

          {quizItems.map((data, mainIndex) => (
            <section key={data.id} className={`trivia q${mainIndex + 1}`}>
              <h2 className="questions">{he.decode(data.question)}</h2>
              {data.answers.map((answer, index) => (
                <React.Fragment key={`${data.id}-answer-${index}`}>
                  <input
                    disabled={isGameOver}
                    type="radio"
                    name={`q${mainIndex + 1}`}
                    id={`q${mainIndex + 1}a${index + 1}`}
                    onChange={() => handleAnswerChange(data, answer)}
                  />
                  <label
                    className={labelClassName(data, answer)}
                    key={index + 1}
                    htmlFor={`q${mainIndex + 1}a${index + 1}`}
                  >
                    {he.decode(answer)}
                  </label>
                </React.Fragment>
              ))}
              <div className="hr-line"></div>
            </section>
          ))}
          {quizItems.length === triviaData?.results?.length && (
            <section className="quiz-status">
              {isGameOver ? (
                <p className="status-game-over">{`You scored ${correctAnswersCount}/${quizItems.length} correct answers`}</p>
              ) : null}
              <button
                onClick={!isGameOver ? checkAnswers : startNewGame}
                className="check-answers"
              >
                {!isGameOver ? "Check answers" : "Play again"}
              </button>
            </section>
          )}

          {/* Side bar */}

          {triviaData ? (
            <div className={!userChangingSettings ? "sidebar" : "sidebar open"}>
              {
                <button
                  onClick={handleDarkMode}
                  title={`Switch to ${darkMode ? "Light" : "Dark"} mode`}
                  className="sidebar-settings-button sidebar-dark-mode"
                >
                  <img src={darkIcon} alt="dark-mode-icon" />
                </button>
              }
              <button
                onClick={changingSettings}
                title="Open Trivia Options"
                className="sidebar-settings-button"
              >
                ⚙️
              </button>
              <form
                onSubmit={(e) => {
                  handleUserSettingsChange(e);
                }}
                className="change-settings-form"
              >
                <span
                  title="Reset settings to default"
                  className="reset-sidebar"
                  onClick={() => {
                    setUserSettings({
                      category: 0,
                      difficulty: "any-difficulty",
                    });
                    setUserLocalStorage((prev) => ({
                      ...prev,
                      category: 0,
                      difficulty: "any-difficulty",
                    }));
                    startNewGame();
                  }}
                >
                  ⟳
                </span>

                <span
                  title="Close settings menu"
                  className="close-sidebar"
                  onClick={changingSettings}
                >
                  ×
                </span>
                <div className="settings-options">
                  <label htmlFor="difficulty">Difficulty: </label>
                  <br />
                  <select
                    name="difficulty"
                    id="difficulty"
                    value={userSettings.difficulty}
                    onChange={(e) =>
                      setUserSettings((prev) => ({
                        ...prev,
                        difficulty: e.target.value,
                      }))
                    }
                  >
                    <option value="any-difficulty">Any Difficulty</option>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
                <div className="settings-options">
                  <label htmlFor="category">Category: </label>
                  <br />
                  <select
                    name="category"
                    id="category"
                    value={Number(userSettings.category)}
                    onChange={(e) =>
                      setUserSettings((prev) => ({
                        ...prev,
                        category: Number(e.target.value),
                      }))
                    }
                  >
                    <option key="0" id="0" value={0}>
                      Any Category
                    </option>
                    {apiCategoryData.map((category) => {
                      return (
                        <option
                          key={Number(category.id)}
                          value={Number(category.id)}
                        >
                          {category.name}
                        </option>
                      );
                    })}
                  </select>
                </div>
                <button className="settings-submit-button">
                  Apply Changes
                </button>
              </form>
            </div>
          ) : null}
        </section>
      ) : (
        <div className="error-message">
          <h3>API limit reached. Click below to try again.</h3>

          <button
            onClick={() => {
              setError(null);
              getData();
            }}
          >
            Try Again
          </button>
        </div>
      )}
    </>
  );
}
