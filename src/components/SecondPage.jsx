import React, { useState, useEffect } from "react";
import he from "he";

export default function SecondPage() {
  const [quizItems, setQuizItems] = useState([]);
  const [triviaData, setTriviaData] = useState(null);
  const [userAnswers, setUserAnswers] = useState([]);
  const [error, setError] = useState(null);
  const [isGameOver, setIsGameOver] = useState(false);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);

  function getData() {
    setError(null);
    return fetch("https://opentdb.com/api.php?amount=5")
      .then((res) => {
        if (res.status === 429) throw new Error("Too Many Requests");
        return res.json();
      })
      .then((data) => {
        setTriviaData(data);
      })
      .catch((err) => {
        console.error("Error fetching data:", err);
        setError(err.message);
      });
  }

  useEffect(() => {
    getData();
  }, []);

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

  function checkAnswers() {
    if (!isGameOver && userAnswers.length < quizItems.length) {
      window.alert("Please answer all questions, even if you're not sure.");
    } else {
      const correctCount = userAnswers.filter((u) => {
        const q = quizItems.find((qItem) => qItem.id === u.id);
        return u.userAnswer === q.correctAnswer;
      }).length;
      setCorrectAnswersCount(correctCount);
      setIsGameOver(true);
    }
  }

  function startNewGame() {
    setQuizItems([]);
    setTriviaData(null);
    setUserAnswers([]);
    setError(null);
    setIsGameOver(false);
    getData();
  }

  return (
    <>
      <section className="second-page">
        {!triviaData && !error ? (
          <p className="loading-trivia">Loading trivia...</p>
        ) : null}

        {error && error.includes("Too Many Requests") && (
          <div className="error-message">
            <h3>API limit reached. Click below to try again.</h3>

            <button onClick={() => window.location.reload()}>Try Again</button>
          </div>
        )}

        {quizItems.map((data, mainIndex) => (
          <section key={data.id} className={`trivia q${mainIndex + 1}`}>
            <h2 className="questions">{he.decode(data.question)}</h2>
            {data.answers.map((answer, index) => (
              <React.Fragment key={`${data.id}-answer-${index}`}>
                <input
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
      </section>
    </>
  );
}
