import { useState, useEffect } from "react";

export default function FirstPage(props) {
  return (
    <>
      <section className="starter-page">
        <h1>Quizzical</h1>
        <p>Test your brain with quick and fun trivia quizzes!</p>
        <button className="start-btn" onClick={props.startGame}>
          Start quiz
        </button>
      </section>
    </>
  );
}
