import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useGame } from '@/contexts/GameContext';
import { Logo } from '@/components/Logo';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Footer } from '@/components/Footer';
import { useToast } from '@/hooks/use-toast';

// Define a proper interface for the path points
interface PathPoint {
  x: number;
  y: number;
  visited?: boolean;
}

const Level1 = () => {
  const navigate = useNavigate();
  const { setLevel } = useGame();
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [needlePosition, setNeedlePosition] = useState({ x: 0, y: 0 });
  const [isCutting, setIsCutting] = useState(false);
  const [dalgonaPath, setDalgonaPath] = useState<PathPoint[]>([]);
  const [progress, setProgress] = useState(0);
  const [pathTolerance, setPathTolerance] = useState(6); // Reduced for more precision
  const [lastMovementOutsidePath, setLastMovementOutsidePath] = useState(false);
  const [consecutiveOffPathTime, setConsecutiveOffPathTime] = useState(0);
  const [shapeType, setShapeType] = useState<'circle' | 'triangle' | 'square' | 'star'>('circle');

  // Initialize the game
  useEffect(() => {
    if (gameStarted && !gameOver && !gameWon) {
      // Create a new random shape for each game
      generateRandomShape();
      
      // Start timer
      const timerInterval = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timerInterval);
            setGameOver(true);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
      
      return () => clearInterval(timerInterval);
    }
  }, [gameStarted]);
  
  // Generate a random shape for the cookie
  const generateRandomShape = () => {
    // Select a random shape
    const shapes = ['circle', 'triangle', 'square', 'star'] as const;
    const randomShape = shapes[Math.floor(Math.random() * shapes.length)];
    setShapeType(randomShape);
    
    // Create the path based on shape
    const centerX = canvasRef.current!.width / 2;
    const centerY = canvasRef.current!.height / 2;
    const radius = 100;
    const numPoints = 100; // More points = more precise path
    const pathPoints: PathPoint[] = [];
    
    switch (randomShape) {
      case 'circle':
        for (let i = 0; i < numPoints; i++) {
          const angle = (i / numPoints) * Math.PI * 2;
          const x = centerX + radius * Math.cos(angle);
          const y = centerY + radius * Math.sin(angle);
          pathPoints.push({ x, y });
        }
        break;
        
      case 'triangle':
        for (let i = 0; i < numPoints; i++) {
          const segment = Math.floor(i / (numPoints / 3));
          const progress = (i % (numPoints / 3)) / (numPoints / 3);
          
          let startX, startY, endX, endY;
          
          if (segment === 0) {
            startX = centerX;
            startY = centerY - radius;
            endX = centerX + radius * Math.cos(Math.PI / 6);
            endY = centerY + radius * Math.sin(Math.PI / 6);
          } else if (segment === 1) {
            startX = centerX + radius * Math.cos(Math.PI / 6);
            startY = centerY + radius * Math.sin(Math.PI / 6);
            endX = centerX - radius * Math.cos(Math.PI / 6);
            endY = centerY + radius * Math.sin(Math.PI / 6);
          } else {
            startX = centerX - radius * Math.cos(Math.PI / 6);
            startY = centerY + radius * Math.sin(Math.PI / 6);
            endX = centerX;
            endY = centerY - radius;
          }
          
          const x = startX + (endX - startX) * progress;
          const y = startY + (endY - startY) * progress;
          pathPoints.push({ x, y });
        }
        break;
        
      case 'square':
        const side = radius * 1.5;
        const halfSide = side / 2;
        const pointsPerSide = numPoints / 4;
        
        // Top side
        for (let i = 0; i < pointsPerSide; i++) {
          const x = centerX - halfSide + (side * i / pointsPerSide);
          const y = centerY - halfSide;
          pathPoints.push({ x, y });
        }
        
        // Right side
        for (let i = 0; i < pointsPerSide; i++) {
          const x = centerX + halfSide;
          const y = centerY - halfSide + (side * i / pointsPerSide);
          pathPoints.push({ x, y });
        }
        
        // Bottom side
        for (let i = 0; i < pointsPerSide; i++) {
          const x = centerX + halfSide - (side * i / pointsPerSide);
          const y = centerY + halfSide;
          pathPoints.push({ x, y });
        }
        
        // Left side
        for (let i = 0; i < pointsPerSide; i++) {
          const x = centerX - halfSide;
          const y = centerY + halfSide - (side * i / pointsPerSide);
          pathPoints.push({ x, y });
        }
        break;
        
      case 'star':
        const outerRadius = radius;
        const innerRadius = radius * 0.4;
        const spikes = 5;
        
        for (let i = 0; i < numPoints; i++) {
          const segment = Math.floor(i / (numPoints / spikes / 2));
          const progress = (i % (numPoints / spikes / 2)) / (numPoints / spikes / 2);
          
          const angle1 = (segment / 2) * (2 * Math.PI / spikes);
          const angle2 = ((segment + 1) / 2) * (2 * Math.PI / spikes);
          
          const r1 = segment % 2 === 0 ? outerRadius : innerRadius;
          const r2 = segment % 2 === 0 ? innerRadius : outerRadius;
          
          const startX = centerX + r1 * Math.sin(angle1);
          const startY = centerY - r1 * Math.cos(angle1);
          const endX = centerX + r2 * Math.sin(angle2);
          const endY = centerY - r2 * Math.cos(angle2);
          
          const x = startX + (endX - startX) * progress;
          const y = startY + (endY - startY) * progress;
          pathPoints.push({ x, y });
        }
        break;
    }
    
    setDalgonaPath(pathPoints);
    drawCanvas();
  };
  
  // Draw the canvas
  const drawCanvas = () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw dalgona cookie
    ctx.fillStyle = '#e6bf83';
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, 120, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw the shape outline
    if (dalgonaPath.length > 0) {
      ctx.strokeStyle = '#8a6d3b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(dalgonaPath[0].x, dalgonaPath[0].y);
      for (let i = 1; i < dalgonaPath.length; i++) {
        ctx.lineTo(dalgonaPath[i].x, dalgonaPath[i].y);
      }
      ctx.closePath();
      ctx.stroke();
      
      // Draw visited points (cut path)
      ctx.strokeStyle = '#5a3921';
      ctx.lineWidth = 3;
      let lastVisitedPoint = null;
      
      for (let i = 0; i < dalgonaPath.length; i++) {
        const point = dalgonaPath[i];
        if (point.visited) {
          if (lastVisitedPoint) {
            ctx.beginPath();
            ctx.moveTo(lastVisitedPoint.x, lastVisitedPoint.y);
            ctx.lineTo(point.x, point.y);
            ctx.stroke();
          }
          lastVisitedPoint = point;
        }
      }
    }
    
    // Draw needle
    if (needlePosition.x > 0 && isCutting) {
      ctx.fillStyle = lastMovementOutsidePath ? '#ff0000' : '#555';
      ctx.beginPath();
      ctx.arc(needlePosition.x, needlePosition.y, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  };
  
  // Handle mouse movements
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (gameOver || gameWon) return;
    
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setNeedlePosition({ x, y });
    
    if (isCutting) {
      checkCuttingProgress(x, y);
      drawCanvas();
    }
  };
  
  // Handle mouse down
  const handleMouseDown = () => {
    if (gameOver || gameWon) return;
    setIsCutting(true);
  };
  
  // Handle mouse up
  const handleMouseUp = () => {
    setIsCutting(false);
    setLastMovementOutsidePath(false);
    setConsecutiveOffPathTime(0);
  };
  
  // Check if we're cutting on the path
  const checkCuttingProgress = (x: number, y: number) => {
    if (dalgonaPath.length === 0) return;
    
    // Check if needle is close to any path point
    let foundPoint = false;
    
    for (let i = 0; i < dalgonaPath.length; i++) {
      const point = dalgonaPath[i];
      const dist = Math.sqrt(Math.pow(x - point.x, 2) + Math.pow(y - point.y, 2));
      
      if (dist < pathTolerance) {
        // Mark this point as visited
        const updatedPath = [...dalgonaPath];
        updatedPath[i] = { ...point, visited: true };
        setDalgonaPath(updatedPath);
        
        // Calculate progress
        const visitedPoints = updatedPath.filter(p => p.visited).length;
        const newProgress = Math.round((visitedPoints / updatedPath.length) * 100);
        setProgress(newProgress);
        
        // Reset consecutive off-path time when on path
        setLastMovementOutsidePath(false);
        setConsecutiveOffPathTime(0);
        
        // Check if game is won (requires more precision now, 99%)
        if (newProgress >= 99) {
          setGameWon(true);
          setLevel(2);
          toast({
            title: "Level Completed!",
            description: "You've successfully completed the Dalgona challenge.",
          });
        }
        
        foundPoint = true;
        break;
      }
    }
    
    // Check if cutting too far from path
    if (!foundPoint && isCutting) {
      let onPath = false;
      for (const point of dalgonaPath) {
        const dist = Math.sqrt(Math.pow(x - point.x, 2) + Math.pow(y - point.y, 2));
        if (dist < pathTolerance + 3) { // Reduced tolerance for more precision
          onPath = true;
          break;
        }
      }
      
      // If not on path, increase consecutive time and check for failure
      if (!onPath) {
        setLastMovementOutsidePath(true);
        setConsecutiveOffPathTime(prev => {
          const newTime = prev + 1;
          // Break cookie if off path for too long or too far
          if (newTime > 5) { // Reduced tolerance - breaks faster now
            handleGameOver("You moved too far from the pattern!");
          }
          return newTime;
        });
      }
    }
  };
  
  // Handle game over
  const handleGameOver = (message: string = "You broke the cookie! Try again.") => {
    setGameOver(true);
    toast({
      title: "Game Over!",
      description: message,
      variant: "destructive",
    });
  };
  
  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
    setGameWon(false);
    setTimeLeft(60);
    setProgress(0);
    setLastMovementOutsidePath(false);
    setConsecutiveOffPathTime(0);
    setNeedlePosition({ x: 0, y: 0 });
  };
  
  const restartGame = () => {
    startGame();
  };
  
  const continueToNextLevel = () => {
    navigate('/level2');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="p-4 md:p-6 flex justify-between items-center">
        <Logo />
        <div className="flex items-center space-x-4">
          <div className="bg-gray-800 px-3 py-1 rounded text-white">
            Level: 1/5
          </div>
          <div className="bg-gray-800 px-3 py-1 rounded text-white">
            Player 456
          </div>
          <ThemeToggle />
        </div>
      </header>
      
      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Level 1: Dalgona Challenge</h1>
        
        {!gameStarted ? (
          <div className="text-center max-w-lg mx-auto">
            <p className="mb-6">Cut around the shape without breaking the cookie. Be extremely precise and gentle.</p>
            <Button 
              onClick={startGame} 
              className="bg-squid-red hover:bg-red-600 text-white text-lg py-6 px-8 rounded-md"
            >
              Start Challenge
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="mb-4 flex items-center justify-between w-full max-w-md">
              <div className="text-lg font-medium">Time: {timeLeft}s</div>
              <div className="text-lg font-medium">Progress: {progress}%</div>
            </div>
            
            <div className="relative border-4 border-secondary rounded-lg overflow-hidden">
              <canvas 
                ref={canvasRef} 
                width={400} 
                height={400} 
                className="bg-[#e6bf83] cursor-pointer"
                onMouseMove={handleMouseMove}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              />
              
              {(gameOver || gameWon) && (
                <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center p-6">
                  {gameWon ? (
                    <>
                      <h2 className="text-2xl font-bold text-white mb-4">Challenge Complete!</h2>
                      <p className="text-white text-center mb-6">
                        You've successfully completed the Dalgona challenge.
                      </p>
                      <Button 
                        onClick={continueToNextLevel} 
                        className="bg-squid-red hover:bg-red-600 text-white"
                      >
                        Continue to Level 2
                      </Button>
                    </>
                  ) : (
                    <>
                      <h2 className="text-2xl font-bold text-white mb-4">Game Over</h2>
                      <p className="text-white text-center mb-6">
                        You broke the cookie. Be more careful next time.
                      </p>
                      <Button 
                        onClick={restartGame} 
                        className="bg-squid-red hover:bg-red-600 text-white"
                      >
                        Try Again
                      </Button>
                    </>
                  )}
                </div>
              )}
            </div>
            
            <p className="mt-4 text-sm text-center max-w-md">
              Follow the outline carefully. Move slowly and stay on the line for best results. 
              If you move too far from the line, the cookie will break!
            </p>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default Level1;
