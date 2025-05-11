
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useGame } from '@/contexts/GameContext';
import { Logo } from '@/components/Logo';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Footer } from '@/components/Footer';
import { useToast } from '@/hooks/use-toast';

// Type definitions
type Player = {
  x: number;
  y: number;
  isAlive: boolean;
};

type Guard = {
  x: number;
  y: number;
  direction: 'up' | 'down' | 'left' | 'right';
  isLooking: boolean;
};

const Level5 = () => {
  const navigate = useNavigate();
  const { setLevel } = useGame();
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<number | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  
  // Game state
  const [player, setPlayer] = useState<Player>({ x: 50, y: 400, isAlive: true });
  const [guard, setGuard] = useState<Guard>({ 
    x: 300, 
    y: 150, 
    direction: 'down', 
    isLooking: false
  });
  const [timeLeft, setTimeLeft] = useState(60);
  const [redLightGreenLight, setRedLightGreenLight] = useState<'red' | 'green'>('green');
  const [finishLine] = useState({ x: 550, y: 50, width: 30, height: 100 });
  const [isMoving, setIsMoving] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  
  // Key state
  const [keys, setKeys] = useState({
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false
  });
  
  // Constants
  const PLAYER_SPEED = 3;
  const GAME_TICK = 30; // ms
  const RED_LIGHT_MIN_TIME = 2000; // ms
  const RED_LIGHT_MAX_TIME = 5000; // ms
  const GREEN_LIGHT_MIN_TIME = 3000; // ms
  const GREEN_LIGHT_MAX_TIME = 7000; // ms
  
  // Start the game
  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
    setGameWon(false);
    setTimeLeft(60);
    setPlayer({ x: 50, y: 400, isAlive: true });
    setRedLightGreenLight('green');
    
    // Add a countdown before game starts
    setCountdown(3);
  };
  
  // Handle countdown
  useEffect(() => {
    if (countdown !== null && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setCountdown(null);
    }
  }, [countdown]);
  
  // Handle keydown
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!gameStarted || gameOver || gameWon || countdown !== null) return;
      
      if (e.key in keys) {
        setKeys(prev => ({ ...prev, [e.key]: true }));
        setIsMoving(true);
      }
    };
    
    // Handle keyup
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key in keys) {
        setKeys(prev => ({ ...prev, [e.key]: false }));
        // Check if any keys still pressed
        setIsMoving(prev => {
          const anyKeyStillPressed = Object.entries(keys).some(([key, pressed]) => {
            if (key !== e.key) return pressed;
            return false;
          });
          return anyKeyStillPressed;
        });
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameStarted, gameOver, gameWon, keys, countdown]);
  
  // Timer
  useEffect(() => {
    if (gameStarted && !gameOver && !gameWon && countdown === null) {
      const timerInterval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerInterval);
            handleGameOver();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(timerInterval);
    }
  }, [gameStarted, gameOver, gameWon, countdown]);
  
  // Red light, green light cycle
  useEffect(() => {
    if (gameStarted && !gameOver && !gameWon && countdown === null) {
      const initialTimeout = setTimeout(() => {
        toggleLight();
      }, 5000); // First change after 5 seconds
      
      return () => clearTimeout(initialTimeout);
    }
  }, [gameStarted, countdown]);
  
  const toggleLight = () => {
    if (gameOver || gameWon) return;
    
    setRedLightGreenLight(prev => {
      const next = prev === 'green' ? 'red' : 'green';
      
      // Set guard looking
      setGuard(prev => ({
        ...prev,
        isLooking: next === 'red'
      }));
      
      // Schedule next toggle
      const nextTimeout = next === 'green' 
        ? Math.floor(Math.random() * (GREEN_LIGHT_MAX_TIME - GREEN_LIGHT_MIN_TIME) + GREEN_LIGHT_MIN_TIME)
        : Math.floor(Math.random() * (RED_LIGHT_MAX_TIME - RED_LIGHT_MIN_TIME) + RED_LIGHT_MIN_TIME);
        
      setTimeout(toggleLight, nextTimeout);
      
      return next;
    });
  };
  
  // Game loop
  useEffect(() => {
    if (!gameStarted || gameOver || gameWon || countdown !== null) {
      if (gameLoopRef.current !== null) {
        cancelAnimationFrame(gameLoopRef.current);
        gameLoopRef.current = null;
      }
      return;
    }
    
    let prevTime = 0;
    let movementDetected = false;
    
    const gameLoop = (timestamp: number) => {
      if (!prevTime) prevTime = timestamp;
      const elapsed = timestamp - prevTime;
      
      if (elapsed > GAME_TICK) {
        prevTime = timestamp;
        
        // Update player position
        setPlayer(prev => {
          movementDetected = false;
          
          // Calculate new position
          let newX = prev.x;
          let newY = prev.y;
          
          if (keys.ArrowRight) {
            newX += PLAYER_SPEED;
            movementDetected = true;
          }
          if (keys.ArrowLeft) {
            newX -= PLAYER_SPEED;
            movementDetected = true;
          }
          if (keys.ArrowUp) {
            newY -= PLAYER_SPEED;
            movementDetected = true;
          }
          if (keys.ArrowDown) {
            newY += PLAYER_SPEED;
            movementDetected = true;
          }
          
          // Check boundaries
          newX = Math.max(20, Math.min(580, newX));
          newY = Math.max(20, Math.min(580, newY));
          
          // Check if we're moving during red light
          if (redLightGreenLight === 'red' && movementDetected) {
            setTimeout(() => handleGameOver(), 100);
            return { ...prev, isAlive: false };
          }
          
          // Check if reached finish line
          if (
            newX > finishLine.x && 
            newX < finishLine.x + finishLine.width && 
            newY > finishLine.y && 
            newY < finishLine.y + finishLine.height
          ) {
            setTimeout(() => handleGameWon(), 100);
          }
          
          return {
            x: newX,
            y: newY,
            isAlive: prev.isAlive
          };
        });
        
        // Draw game
        drawGame();
      }
      
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };
    
    gameLoopRef.current = requestAnimationFrame(gameLoop);
    
    return () => {
      if (gameLoopRef.current !== null) {
        cancelAnimationFrame(gameLoopRef.current);
        gameLoopRef.current = null;
      }
    };
  }, [gameStarted, gameOver, gameWon, keys, redLightGreenLight, countdown]);
  
  // Initialize canvas
  useEffect(() => {
    if (gameStarted && canvasRef.current) {
      drawGame();
    }
  }, [gameStarted]);
  
  // Draw the game
  const drawGame = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background - more detailed field with grid lines
    if (redLightGreenLight === 'red') {
      ctx.fillStyle = '#ffebee';
    } else {
      ctx.fillStyle = '#e8f5e9';
    }
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid lines
    ctx.strokeStyle = redLightGreenLight === 'red' ? '#ffcdd2' : '#c8e6c9';
    ctx.lineWidth = 1;
    
    // Horizontal lines
    for (let y = 0; y < canvas.height; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
    
    // Vertical lines
    for (let x = 0; x < canvas.width; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    
    // Draw finish line - more visible and attractive
    const gradient = ctx.createLinearGradient(finishLine.x, 0, finishLine.x + finishLine.width, 0);
    gradient.addColorStop(0, '#4caf50');
    gradient.addColorStop(1, '#2e7d32');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(finishLine.x, finishLine.y, finishLine.width, finishLine.height);
    
    // Add finish line details
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(finishLine.x, finishLine.y, finishLine.width, finishLine.height);
    
    // Finish flag pattern
    const flagSize = 10;
    for (let y = finishLine.y; y < finishLine.y + finishLine.height; y += flagSize * 2) {
      for (let x = finishLine.x; x < finishLine.x + finishLine.width; x += flagSize * 2) {
        ctx.fillStyle = '#fff';
        ctx.fillRect(x, y, flagSize, flagSize);
        ctx.fillRect(x + flagSize, y + flagSize, flagSize, flagSize);
      }
    }
    
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('FINISH', finishLine.x + finishLine.width / 2, finishLine.y + finishLine.height / 2 + 5);
    
    // Draw guard - more detailed
    // Guard body
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.arc(guard.x, guard.y, 20, 0, Math.PI * 2);
    ctx.fill();
    
    // Guard mask
    ctx.fillStyle = '#111';
    ctx.beginPath();
    ctx.arc(guard.x, guard.y, 15, Math.PI * 0.8, Math.PI * 2.2);
    ctx.fill();
    
    // Guard eye/vision indicator
    ctx.fillStyle = guard.isLooking ? '#ff1744' : '#2e7d32';
    ctx.beginPath();
    ctx.arc(guard.x, guard.y, 10, 0, Math.PI * 2);
    ctx.fill();
    
    // Vision cone during red light
    if (guard.isLooking) {
      const gradient = ctx.createRadialGradient(guard.x, guard.y, 10, guard.x, guard.y, 300);
      gradient.addColorStop(0, 'rgba(255, 0, 0, 0.2)');
      gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.moveTo(guard.x, guard.y);
      ctx.arc(guard.x, guard.y, 300, Math.PI * 1.75, Math.PI * 0.25);
      ctx.closePath();
      ctx.fill();
    }
    
    // Draw player - more detailed with animations
    if (player.isAlive) {
      // Player shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.beginPath();
      ctx.ellipse(player.x, player.y + 15, 12, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Player body
      const bodyGradient = ctx.createRadialGradient(player.x, player.y, 0, player.x, player.y, 15);
      bodyGradient.addColorStop(0, '#64b5f6');
      bodyGradient.addColorStop(1, '#1976d2');
      
      ctx.fillStyle = bodyGradient;
      ctx.beginPath();
      ctx.arc(player.x, player.y, 15, 0, Math.PI * 2);
      ctx.fill();
      
      // Player number
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 10px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('456', player.x, player.y + 4);
    } else if (gameOver) {
      // Dead player
      ctx.fillStyle = '#ff0000';
      ctx.beginPath();
      ctx.arc(player.x, player.y, 15, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(player.x - 8, player.y - 8);
      ctx.lineTo(player.x + 8, player.y + 8);
      ctx.moveTo(player.x + 8, player.y - 8);
      ctx.lineTo(player.x - 8, player.y + 8);
      ctx.stroke();
    }
    
    // Draw status with more style
    const statusY = 40;
    const statusWidth = 200;
    const statusHeight = 40;
    const statusX = (canvas.width - statusWidth) / 2;
    
    // Status background
    ctx.fillStyle = redLightGreenLight === 'red' ? 'rgba(211, 47, 47, 0.9)' : 'rgba(56, 142, 60, 0.9)';
    ctx.beginPath();
    ctx.roundRect(statusX, statusY, statusWidth, statusHeight, 10);
    ctx.fill();
    
    // Status border
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(statusX, statusY, statusWidth, statusHeight, 10);
    ctx.stroke();
    
    // Status text
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(
      redLightGreenLight === 'red' ? 'RED LIGHT! STOP!' : 'GREEN LIGHT! GO!', 
      canvas.width / 2, 
      statusY + statusHeight / 2 + 6
    );
    
    // Draw countdown if active
    if (countdown !== null) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 72px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(
        countdown > 0 ? countdown.toString() : 'GO!', 
        canvas.width / 2, 
        canvas.height / 2
      );
    }
  };
  
  // Handle game over
  const handleGameOver = () => {
    setGameOver(true);
    setPlayer(prev => ({ ...prev, isAlive: false }));
    toast({
      title: "Game Over!",
      description: "You moved during red light!",
      variant: "destructive",
    });
    
    // Clean up game loop
    if (gameLoopRef.current !== null) {
      cancelAnimationFrame(gameLoopRef.current);
      gameLoopRef.current = null;
    }
  };
  
  // Handle game won
  const handleGameWon = () => {
    setGameWon(true);
    setLevel(6);
    toast({
      title: "Level Completed!",
      description: "You've reached the finish line!",
    });
    
    // Clean up game loop
    if (gameLoopRef.current !== null) {
      cancelAnimationFrame(gameLoopRef.current);
      gameLoopRef.current = null;
    }
    
    setTimeout(() => {
      navigate('/congrats');
    }, 3000);
  };
  
  // Restart game
  const restartGame = () => {
    startGame();
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-900 to-black text-white">
      <header className="p-4 md:p-6 flex justify-between items-center border-b border-squid-red">
        <Logo />
        <div className="flex items-center space-x-4">
          <div className="bg-gray-800 px-3 py-1 rounded text-white">
            Level: 5/5
          </div>
          <div className="bg-gray-800 px-3 py-1 rounded text-white">
            Player 456
          </div>
          <ThemeToggle />
        </div>
      </header>
      
      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center text-gradient">Level 5: Red Light, Green Light</h1>
        
        {!gameStarted ? (
          <div className="text-center max-w-lg mx-auto">
            <div className="bg-black/40 p-6 rounded-lg backdrop-blur-sm shadow-lg border border-gray-700">
              <p className="mb-6">
                Move only during green light. If you move during red light, you'll be eliminated.
                Reach the finish line at the top of the screen to win.
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
            <div className="mb-4 flex items-center justify-between w-full max-w-md">
              <div className="bg-gray-800 px-4 py-2 rounded text-white font-mono flex items-center">
                <span className="mr-2">Time:</span> 
                <span className={timeLeft < 15 ? "text-red-400" : timeLeft < 30 ? "text-yellow-400" : "text-green-400"}>
                  {timeLeft}s
                </span>
              </div>
              
              <div className="bg-gray-800 px-4 py-2 rounded text-white font-mono flex items-center">
                <span className="mr-2">Status:</span> 
                <span 
                  className={`${redLightGreenLight === 'red' ? 'text-red-400' : 'text-green-400'} ${countdown === null ? 'animate-pulse' : ''}`}
                >
                  {redLightGreenLight === 'red' ? 'RED LIGHT' : 'GREEN LIGHT'}
                </span>
              </div>
            </div>
            
            <div className="relative border-4 border-squid-red rounded-lg overflow-hidden shadow-2xl">
              <canvas ref={canvasRef} width={600} height={600} className="bg-card" />
              
              {(gameOver || gameWon) && (
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-6">
                  {gameWon ? (
                    <>
                      <h2 className="text-2xl font-bold text-white mb-4">Challenge Complete!</h2>
                      <p className="text-white text-center mb-6">
                        You've successfully reached the finish line!
                      </p>
                      <div className="animate-pulse">
                        <p className="text-white text-center">
                          Moving to congratulations screen...
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <h2 className="text-2xl font-bold text-red-500 mb-4">Game Over</h2>
                      <p className="text-white text-center mb-6">
                        You moved during red light!
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
            
            <div className="mt-6 text-center max-w-md bg-black/40 p-4 rounded backdrop-blur-sm border border-gray-700">
              <p className="text-sm">
                Use <span className="bg-gray-800 px-2 py-1 rounded font-mono">↑ ↓ ← →</span> arrow keys to move your character.
              </p>
              <p className="text-sm mt-2 text-red-400">
                <strong>STOP IMMEDIATELY</strong> when you see red light!
              </p>
            </div>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default Level5;
