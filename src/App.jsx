import { useState, useEffect } from "react";
import FirstPage from "./components/FirstPage";
import SecondPage from "./components/SecondPage";

export default function App() {
  // States
  const [isGameStarted, setIsGameStarted] = useState(false);

  // Vars

  // Fetch

  // Onclicks
  function startGame() {
    setIsGameStarted(true);
  }

  return (
    <div className="page">
      <div className="blob baby"></div>
      <div className="blob lemony"></div>

      {!isGameStarted ? (
        <FirstPage isGameStarted={isGameStarted} startGame={startGame} />
      ) : (
        <SecondPage />
      )}
      <div className="signature">
        © 2025 Mohammad Rasooli
        <br />
        Version 1.0.1
      </div>
    </div>
  );
}
