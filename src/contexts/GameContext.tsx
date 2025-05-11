
import React, { createContext, useContext, useState, useEffect } from "react";

type GameProviderProps = {
  children: React.ReactNode;
};

type GameContextType = {
  level: number;
  playerNumber: string;
  setLevel: (level: number) => void;
  resetGame: () => void;
};

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: GameProviderProps) {
  const [level, setLevel] = useState<number>(1);
  const [playerNumber, setPlayerNumber] = useState<string>("456");

  // Load game progress from localStorage on initial render
  useEffect(() => {
    const savedLevel = localStorage.getItem("gameLevel");
    if (savedLevel) {
      setLevel(parseInt(savedLevel, 10));
    }
  }, []);

  // Save game progress when level changes
  useEffect(() => {
    localStorage.setItem("gameLevel", level.toString());
  }, [level]);

  const resetGame = () => {
    setLevel(1);
    localStorage.setItem("gameLevel", "1");
  };

  return (
    <GameContext.Provider value={{ level, playerNumber, setLevel, resetGame }}>
      {children}
    </GameContext.Provider>
  );
}

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
};
