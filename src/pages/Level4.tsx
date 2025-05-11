
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useGame } from '@/contexts/GameContext';
import { Logo } from '@/components/Logo';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Footer } from '@/components/Footer';
import { useToast } from '@/hooks/use-toast';
import { Circle, Square } from 'lucide-react';

type Shape = 'circle' | 'triangle' | 'square';
// The correct sequence is circle, triangle, square, triangle, circle
const CORRECT_SEQUENCE: Shape[] = ['circle', 'triangle', 'square', 'triangle', 'circle'];

const Level4 = () => {
  const navigate = useNavigate();
  const { setLevel } = useGame();
  const { toast } = useToast();
  const [gameStarted, setGameStarted] = useState(false);
  const [selectedShapes, setSelectedShapes] = useState<Shape[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [sequenceCorrect, setSequenceCorrect] = useState(false);
  const [shakeInput, setShakeInput] = useState(false);
  const [currentHintIndex, setCurrentHintIndex] = useState(0);

  // Much more cryptic, harder hints
  const hints = [
    "Alpha and Omega are identical, forming points on a perfect loop.",
    "What has no beginning and no end? Place it at both extremes.",
    "The center is marked by four equal sides, standing alone in its symmetry.",
    "Three-sided figures guard the four-sided one, like sentinels on either side.",
    "A reflection reveals itself when viewed from either end to the middle."
  ];

  // Random Front Man messages to make it more interesting
  const frontManMessages = [
    "Life is like a game. There are winners and there are losers.",
    "Sometimes the answer is hidden in plain sight.",
    "The pattern holds the key to your survival.",
    "Those who can see beyond the obvious will prevail.",
    "In symmetry lies the solution to your predicament."
  ];
  const [frontManMessage, setFrontManMessage] = useState("");

  useEffect(() => {
    if (gameStarted) {
      // Display a random Front Man message
      const randomMessage = frontManMessages[Math.floor(Math.random() * frontManMessages.length)];
      setFrontManMessage(randomMessage);
      
      // Change message every 15 seconds
      const messageInterval = setInterval(() => {
        const newMessage = frontManMessages[Math.floor(Math.random() * frontManMessages.length)];
        setFrontManMessage(newMessage);
      }, 15000);
      
      return () => clearInterval(messageInterval);
    }
  }, [gameStarted]);

  // Start game
  const startGame = () => {
    setGameStarted(true);
    setSelectedShapes([]);
    setAttempts(0);
    setShowHint(false);
    setSequenceCorrect(false);
    setCurrentHintIndex(0);
    
    // Set initial Front Man message
    const randomMessage = frontManMessages[Math.floor(Math.random() * frontManMessages.length)];
    setFrontManMessage(randomMessage);
  };
  
  // Add shape to sequence
  const addShape = (shape: Shape) => {
    if (selectedShapes.length < 5 && !sequenceCorrect) {
      setSelectedShapes(prev => [...prev, shape]);
    }
  };
  
  // Remove last shape
  const removeLastShape = () => {
    setSelectedShapes(prev => prev.slice(0, -1));
  };
  
  // Clear sequence
  const clearSequence = () => {
    setSelectedShapes([]);
  };
  
  // Show next hint
  const showNextHint = () => {
    if (currentHintIndex < hints.length - 1) {
      setCurrentHintIndex(currentHintIndex + 1);
    } else {
      setCurrentHintIndex(0); // Loop back to first hint
    }
    setShowHint(true);
  };
  
  // Submit sequence
  const submitSequence = () => {
    if (selectedShapes.length !== 5) {
      toast({
        title: "Invalid Submission",
        description: "You must select exactly 5 shapes.",
        variant: "destructive",
      });
      return;
    }
    
    setAttempts(prev => prev + 1);
    
    // Check if sequence is correct
    const isCorrect = selectedShapes.every((shape, index) => shape === CORRECT_SEQUENCE[index]);
    
    if (isCorrect) {
      setSequenceCorrect(true);
      setLevel(5);
      toast({
        title: "Correct Pattern!",
        description: "You've unlocked the next level.",
      });
      
      setTimeout(() => {
        navigate('/level5');
      }, 3000);
    } else {
      setShakeInput(true);
      toast({
        title: "Incorrect Pattern",
        description: "That's not the right sequence. Try again.",
        variant: "destructive",
      });
      
      // Show hint after failed attempts
      if (attempts >= 1 && !showHint) {
        setShowHint(true);
      }
    }
  };
  
  // Render shape component
  const renderShape = (shape: Shape) => {
    switch (shape) {
      case 'circle':
        return <Circle className="w-10 h-10" />;
      case 'triangle':
        return (
          <div className="w-10 h-10 flex items-center justify-center">
            <svg width="40" height="40" viewBox="0 0 40 40">
              <polygon 
                points="20,4 4,36 36,36" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
              />
            </svg>
          </div>
        );
      case 'square':
        return <Square className="w-10 h-10" />;
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-900 to-black text-white">
      <header className="p-4 md:p-6 flex justify-between items-center border-b border-squid-red">
        <Logo />
        <div className="flex items-center space-x-4">
          <div className="bg-gray-800 px-3 py-1 rounded text-white">
            Level: 4/5
          </div>
          <div className="bg-gray-800 px-3 py-1 rounded text-white">
            Player 456
          </div>
          <ThemeToggle />
        </div>
      </header>
      
      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Level 4: The Sequence</h1>
        
        {!gameStarted ? (
          <div className="text-center max-w-lg mx-auto">
            <p className="mb-6">
              Enter the correct sequence of shapes to unlock the final challenge.
              Remember the clue from the Front Man.
            </p>
            <Button 
              onClick={startGame} 
              className="bg-squid-red hover:bg-red-600 text-white text-lg py-6 px-8 rounded-md transform hover:scale-105 transition-transform"
            >
              Start Challenge
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center max-w-lg mx-auto">
            <div className="text-xl md:text-2xl mb-6 text-center">
              The Front Man's puzzle awaits. Enter the correct sequence of shapes.
            </div>
            
            {frontManMessage && (
              <div className="mb-6 p-4 bg-black/50 border border-squid-red rounded-lg text-center animate-pulse">
                <p className="italic text-squid-red">"{frontManMessage}"</p>
                <p className="text-xs mt-2">- The Front Man</p>
              </div>
            )}
            
            {showHint && (
              <div className="mb-6 p-4 bg-black/50 border border-gray-700 rounded-lg text-gray-300 text-center">
                <p className="font-medium text-yellow-300">Hint #{currentHintIndex + 1}:</p>
                <p>{hints[currentHintIndex]}</p>
                {attempts > 2 && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={showNextHint}
                    className="mt-2 border-gray-600"
                  >
                    Next Hint
                  </Button>
                )}
              </div>
            )}
            
            <div 
              className={`mb-6 p-4 bg-black/40 border border-gray-700 rounded-lg flex items-center justify-center space-x-2 ${shakeInput ? 'animate-shake' : ''}`}
              onAnimationEnd={() => setShakeInput(false)}
            >
              {selectedShapes.length > 0 ? (
                selectedShapes.map((shape, index) => (
                  <div key={index} className="w-12 h-12 flex items-center justify-center">
                    {renderShape(shape)}
                  </div>
                ))
              ) : (
                <div className="text-muted-foreground">Enter the sequence...</div>
              )}
              {Array.from({ length: 5 - selectedShapes.length }).map((_, index) => (
                <div key={`empty-${index}`} className="w-12 h-12 border border-dashed border-muted-foreground rounded-md"></div>
              ))}
            </div>
            
            <div className="grid grid-cols-3 gap-4 mb-6">
              <button 
                onClick={() => addShape('circle')} 
                className="w-20 h-20 bg-blue-900/60 rounded-lg flex items-center justify-center hover:bg-blue-800/60 transition-colors transform hover:scale-105"
                disabled={selectedShapes.length >= 5 || sequenceCorrect}
              >
                <Circle className="w-14 h-14" />
              </button>
              
              <button 
                onClick={() => addShape('triangle')} 
                className="w-20 h-20 bg-blue-900/60 rounded-lg flex items-center justify-center hover:bg-blue-800/60 transition-colors transform hover:scale-105"
                disabled={selectedShapes.length >= 5 || sequenceCorrect}
              >
                <svg width="56" height="56" viewBox="0 0 56 56">
                  <polygon 
                    points="28,8 8,48 48,48" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2"
                  />
                </svg>
              </button>
              
              <button 
                onClick={() => addShape('square')} 
                className="w-20 h-20 bg-blue-900/60 rounded-lg flex items-center justify-center hover:bg-blue-800/60 transition-colors transform hover:scale-105"
                disabled={selectedShapes.length >= 5 || sequenceCorrect}
              >
                <Square className="w-14 h-14" />
              </button>
            </div>
            
            <div className="flex space-x-4">
              <Button 
                onClick={removeLastShape} 
                variant="outline" 
                disabled={selectedShapes.length === 0 || sequenceCorrect}
                className="border-gray-600 hover:bg-gray-800"
              >
                Delete
              </Button>
              
              <Button 
                onClick={clearSequence} 
                variant="outline" 
                disabled={selectedShapes.length === 0 || sequenceCorrect}
                className="border-gray-600 hover:bg-gray-800"
              >
                Clear
              </Button>
              
              <Button 
                onClick={submitSequence} 
                className="bg-squid-red hover:bg-red-600 text-white"
                disabled={selectedShapes.length !== 5 || sequenceCorrect}
              >
                Submit
              </Button>
            </div>
            
            <div className="mt-6 text-sm text-gray-400">
              Attempts: {attempts}
            </div>
            
            {sequenceCorrect && (
              <div className="mt-8 text-center animate-fade-in">
                <h3 className="text-xl font-bold text-green-500 mb-2">Pattern Accepted!</h3>
                <p>Redirecting to the final challenge...</p>
              </div>
            )}
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default Level4;
