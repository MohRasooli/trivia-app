import { useState, useEffect } from "react";
import FirstPage from "./components/FirstPage";
import SecondPage from "./components/SecondPage";

export default function App() {
  // States
  const [isGameStarted, setIsGameStarted] = useState(false);

  const [darkMode, setDarkMode] = useState(
    JSON.parse(localStorage.getItem("userLocalValues"))?.darkMode ?? false
  );

  useEffect(() => {
    document.body.classList.toggle("dark", darkMode);

    const prevStorage =
      JSON.parse(localStorage.getItem("userLocalValues")) || {};
    localStorage.setItem(
      "userLocalValues",
      JSON.stringify({ ...prevStorage, darkMode })
    );
  }, [darkMode]);

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
        <SecondPage darkMode={darkMode} setDarkMode={setDarkMode} />
      )}
      <div className="signature">
        © 2025 Mohammad Rasooli
        <br />
        Version 1.3.1
      </div>
    </div>
  );
}
