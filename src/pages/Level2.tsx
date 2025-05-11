
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useGame } from '@/contexts/GameContext';
import { Logo } from '@/components/Logo';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Footer } from '@/components/Footer';
import { useToast } from '@/hooks/use-toast';
import { Check, X } from 'lucide-react';

const Level2 = () => {
  const navigate = useNavigate();
  const { setLevel } = useGame();
  const { toast } = useToast();
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [shakingPlatform, setShakingPlatform] = useState(false);
  const [lastSelectedPanel, setLastSelectedPanel] = useState<{row: number, col: number} | null>(null);
  const [previousSelections, setPreviousSelections] = useState<Array<{row: number, col: number, safe: boolean}>>([]);
  const [bridgeHistory, setBridgeHistory] = useState<boolean[][][]>([]);
  
  // Glass bridge configuration - 7 steps with left/right panels
  const totalSteps = 7;
  const [bridge, setBridge] = useState<boolean[][]>([]);
  
  // Generate a new bridge solution
  const generateBridgeSolution = () => {
    const result: boolean[][] = [];
    for (let i = 0; i < totalSteps; i++) {
      // For each step, create left and right panel
      // true = safe, false = breaks
      const leftSafe = Math.random() >= 0.5;
      result.push([leftSafe, !leftSafe]);
    }
    return result;
  };
  
  // Initialize the bridge when the game starts
  useEffect(() => {
    if (gameStarted && !bridge.length) {
      const newBridge = generateBridgeSolution();
      setBridge(newBridge);
      setBridgeHistory([newBridge]);
    }
  }, [gameStarted]);
  
  // Timer effect
  useEffect(() => {
    if (gameStarted && !gameOver && !gameWon) {
      const timerInterval = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timerInterval);
            handleGameOver();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
      
      return () => clearInterval(timerInterval);
    }
  }, [gameStarted, gameOver, gameWon]);
  
  // Start the game
  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
    setGameWon(false);
    setCurrentStep(0);
    setTimeLeft(60);
    setLastSelectedPanel(null);
    setPreviousSelections([]);
    // Generate a new bridge solution for each game
    const newBridge = generateBridgeSolution();
    setBridge(newBridge);
    setBridgeHistory([newBridge]);
  };
  
  // Step on a glass panel
  const stepOnPanel = (panelIndex: number) => {
    if (gameOver || gameWon || !bridge.length) return;
    
    const isSafe = bridge[currentStep][panelIndex];
    setLastSelectedPanel({row: currentStep, col: panelIndex});
    
    // Store this selection in history
    setPreviousSelections(prev => [...prev, {
      row: currentStep,
      col: panelIndex,
      safe: isSafe
    }]);
    
    if (isSafe) {
      // Safe panel
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      
      // Check if reached the end
      if (nextStep >= totalSteps) {
        setGameWon(true);
        setLevel(3);
        toast({
          title: "Level Completed!",
          description: "You've crossed the glass bridge!",
        });
      } else {
        // Generate a new bridge pattern for the next round
        const newBridge = [...bridge];
        for (let i = nextStep; i < totalSteps; i++) {
          const leftSafe = Math.random() >= 0.5;
          newBridge[i] = [leftSafe, !leftSafe];
        }
        setBridge(newBridge);
        setBridgeHistory(prev => [...prev, newBridge]);
      }
    } else {
      // Unsafe panel - break glass and game over
      setShakingPlatform(true);
      setTimeout(() => {
        handleGameOver();
      }, 500);
    }
  };
  
  // Handle game over
  const handleGameOver = () => {
    setGameOver(true);
    toast({
      title: "Game Over!",
      description: "The glass broke! You fell through the glass bridge.",
      variant: "destructive",
    });
  };
  
  // Restart the game
  const restartGame = () => {
    startGame();
  };
  
  // Continue to next level
  const continueToNextLevel = () => {
    navigate('/level3');
  };
  
  // Render a panel with status
  const renderPanel = (rowIndex: number, colIndex: number) => {
    const isCurrentRow = rowIndex === currentStep;
    const isCompletedRow = rowIndex < currentStep;
    
    // Find if this panel was selected
    const wasSelected = previousSelections.find(
      sel => sel.row === rowIndex && sel.col === colIndex
    );
    
    // Use current bridge for current step, but use historical data for completed steps
    const bridgeData = rowIndex < currentStep && bridgeHistory.length > rowIndex 
      ? bridgeHistory[rowIndex] 
      : bridge;
    
    const isSafe = bridgeData[rowIndex]?.[colIndex];
    
    // Determine background color based on status
    let bgColor = "bg-gray-600"; // Default unvisited
    let hoverEffect = "";
    
    if (wasSelected) {
      bgColor = wasSelected.safe ? "bg-green-500" : "bg-red-600"; // Selected panel
    } else if (isCurrentRow) {
      bgColor = "bg-blue-500"; // Current row panels
      hoverEffect = "hover:bg-blue-400 transition-colors duration-200";
    } else if (isCompletedRow) {
      bgColor = "bg-gray-700"; // Past rows
    }
    
    return (
      <div 
        key={`${rowIndex}-${colIndex}`}
        className={`w-full h-16 ${bgColor} rounded-md flex items-center justify-center ${hoverEffect} ${isCurrentRow ? 'cursor-pointer transform hover:-translate-y-1 transition-transform' : ''} shadow-md`}
        onClick={() => isCurrentRow ? stepOnPanel(colIndex) : null}
      >
        {wasSelected && wasSelected.safe && <Check className="text-white" size={24} />}
        {wasSelected && !wasSelected.safe && <X className="text-white" size={24} />}
      </div>
    );
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-900 to-black text-white">
      <header className="p-4 md:p-6 flex justify-between items-center border-b border-squid-red">
        <Logo />
        <div className="flex items-center space-x-4">
          <div className="bg-gray-800 px-3 py-1 rounded text-white">
            Level: 2/5
          </div>
          <div className="bg-gray-800 px-3 py-1 rounded text-white">
            Player 456
          </div>
          <ThemeToggle />
        </div>
      </header>
      
      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center text-gradient">Level 2: Glass Bridge</h1>
        
        {!gameStarted ? (
          <div className="text-center max-w-lg mx-auto">
            <div className="bg-black/40 p-6 rounded-lg backdrop-blur-sm shadow-lg border border-gray-700">
              <p className="mb-6">
                Choose the correct panel to cross the glass bridge. One is made of tempered glass, the other will break!
                Make it across before the time runs out.
              </p>
              <p className="mb-6 text-yellow-300">
                Warning: The pattern changes after each step to increase difficulty!
              </p>
              <Button 
                onClick={startGame} 
                className="bg-squid-red hover:bg-red-600 text-white text-lg py-6 px-8 rounded-md transform hover:scale-105 transition-transform"
              >
                Start Challenge
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="mb-6 flex items-center justify-between w-full max-w-md">
              <div className="bg-gray-800 px-4 py-2 rounded text-white font-mono">
                Step: {currentStep}/{totalSteps}
              </div>
              <div className="bg-gray-800 px-4 py-2 rounded text-white font-mono">
                Time: {timeLeft}s
              </div>
            </div>
            
            <div 
              className={`relative p-4 border-2 border-squid-red rounded-lg backdrop-blur-sm bg-black/30 ${shakingPlatform ? 'animate-shake' : ''}`} 
              onAnimationEnd={() => setShakingPlatform(false)}
            >
              <div className="grid grid-cols-2 gap-4" style={{width: "400px"}}>
                {bridge.length > 0 && Array.from({ length: totalSteps }).map((_, rowIndex) => (
                  <React.Fragment key={rowIndex}>
                    {[0, 1].map((colIndex) => renderPanel(rowIndex, colIndex))}
                  </React.Fragment>
                ))}
              </div>
              
              {/* Bridge supports */}
              <div className="absolute left-0 top-0 h-full w-8 -ml-8 bg-gray-800 rounded-l"></div>
              <div className="absolute right-0 top-0 h-full w-8 -mr-8 bg-gray-800 rounded-r"></div>
              
              {(gameOver || gameWon) && (
                <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-6 rounded-lg backdrop-blur-md">
                  {gameWon ? (
                    <>
                      <h2 className="text-2xl font-bold text-white mb-4">Challenge Complete!</h2>
                      <p className="text-white text-center mb-6">
                        You've successfully crossed the glass bridge.
                      </p>
                      <Button 
                        onClick={continueToNextLevel} 
                        className="bg-squid-red hover:bg-red-600 text-white transform hover:scale-105 transition-transform"
                      >
                        Continue to Level 3
                      </Button>
                    </>
                  ) : (
                    <>
                      <h2 className="text-2xl font-bold text-white mb-4">Game Over</h2>
                      <p className="text-white text-center mb-6">
                        The glass panel broke! You fell.
                      </p>
                      <Button 
                        onClick={restartGame} 
                        className="bg-squid-red hover:bg-red-600 text-white transform hover:scale-105 transition-transform"
                      >
                        Try Again
                      </Button>
                    </>
                  )}
                </div>
              )}
            </div>
            
            <p className="mt-6 text-sm text-center max-w-md text-gray-300">
              Choose carefully. The bridge pattern changes after each step to make it more challenging.
              <br />There's no way back once you step forward.
            </p>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default Level2;
