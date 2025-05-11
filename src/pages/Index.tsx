
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useGame } from '@/contexts/GameContext';
import { Logo } from '@/components/Logo';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Footer } from '@/components/Footer';

const Index = () => {
  const navigate = useNavigate();
  const { level, playerNumber, resetGame } = useGame();

  const handleStartGame = () => {
    if (level > 1) {
      navigate(`/level${level}`);
    } else {
      navigate('/level1');
    }
  };

  const handleNewGame = () => {
    resetGame();
    navigate('/level1');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="p-4 md:p-6 flex justify-between items-center">
        <Logo />
        <ThemeToggle />
      </header>
      
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Welcome, Player {playerNumber}</h1>
        <p className="text-xl md:text-2xl mb-8">Prepare for the next game.</p>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <Button 
            onClick={handleStartGame} 
            className="bg-squid-red hover:bg-red-600 text-white text-lg py-6 px-8 rounded-md"
          >
            {level > 1 ? 'Continue Game' : 'Start Game'}
          </Button>
          
          {level > 1 && (
            <Button 
              onClick={handleNewGame} 
              variant="outline" 
              className="text-lg py-6 px-8 rounded-md"
            >
              New Game
            </Button>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
