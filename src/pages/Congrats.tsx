
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useGame } from '@/contexts/GameContext';
import { Logo } from '@/components/Logo';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Footer } from '@/components/Footer';

const Congrats = () => {
  const navigate = useNavigate();
  const { resetGame } = useGame();
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    // Create confetti effect
    const confettiCount = 150;
    const container = document.querySelector('.confetti-container');
    
    if (container) {
      for (let i = 0; i < confettiCount; i++) {
        createConfetti(container as HTMLElement);
      }
      
      // Clean up confetti after animation
      setTimeout(() => {
        setShowConfetti(false);
      }, 8000);
    }
  }, []);
  
  // Create a single confetti element
  const createConfetti = (container: HTMLElement) => {
    const confetti = document.createElement('div');
    const colors = ['#FF2B4A', '#FFD700', '#4BB543', '#1E90FF', '#FF69B4'];
    
    confetti.className = 'confetti';
    confetti.style.left = Math.random() * 100 + '%';
    confetti.style.width = Math.random() * 10 + 6 + 'px';
    confetti.style.height = confetti.style.width;
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.transform = 'rotate(' + Math.random() * 360 + 'deg)';
    confetti.style.opacity = (Math.random() * 0.7 + 0.3).toString();
    confetti.style.animationDuration = Math.random() * 4 + 2 + 's';
    confetti.style.animationDelay = Math.random() * 2 + 's';
    
    container.appendChild(confetti);
    
    // Remove confetti after animation completes
    setTimeout(() => {
      confetti.remove();
    }, 6000);
  };
  
  // Play again
  const handlePlayAgain = () => {
    resetGame();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      {showConfetti && (
        <div className="confetti-container absolute inset-0 pointer-events-none" style={{
          position: 'fixed',
          width: '100%',
          height: '100%',
          zIndex: 100,
          overflow: 'hidden',
        }}>
          <style>
            {`
              .confetti {
                position: absolute;
                top: -10%;
                animation: falling linear forwards;
              }
              
              @keyframes falling {
                0% {
                  transform: translateY(0) rotate(0deg) scale(1);
                }
                
                75% {
                  opacity: 1;
                }
                
                100% {
                  opacity: 0;
                  transform: translateY(100vh) rotate(720deg) scale(0);
                }
              }
            `}
          </style>
        </div>
      )}
      
      <header className="p-4 md:p-6 flex justify-between items-center">
        <Logo />
        <ThemeToggle />
      </header>
      
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Congratulations!</h1>
          
          <div className="mb-8 flex justify-center">
            <div className="w-16 h-16 rounded-full border-4 border-squid-red animate-pulse-shadow mx-1"></div>
            <div className="w-16 h-16 border-4 border-squid-red animate-pulse-shadow mx-1" style={{ clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)" }}></div>
            <div className="w-16 h-16 border-4 border-squid-red animate-pulse-shadow mx-1"></div>
          </div>
          
          <p className="text-xl md:text-2xl mb-6">
            You've completed all the challenges and emerged as the ultimate winner!
          </p>
          
          <p className="text-lg mb-10">
            Your intelligence, reflexes, and determination have proven you worthy of this victory.
            The prize is yours!
          </p>
          
          <Button 
            onClick={handlePlayAgain} 
            className="bg-squid-red hover:bg-red-600 text-white text-lg py-6 px-8 rounded-md"
          >
            Play Again
          </Button>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Congrats;
