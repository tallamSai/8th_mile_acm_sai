
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useGame } from '@/contexts/GameContext';
import { Logo } from '@/components/Logo';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Footer } from '@/components/Footer';
import { useToast } from '@/hooks/use-toast';

// Define more complex and cryptic responses from the Front Man
const frontManResponses: Record<string, string[]> = {
  greeting: [
    "Welcome to the next trial, player. Your survival depends on your intellect now.",
    "You've navigated the physical challenges. Now let's see if your mind is equally sharp.",
    "The next game requires you to understand patterns. Patterns that govern life... and death.",
    "Ask the right questions. Time is limited. Some questions lead to answers, others to elimination."
  ],
  hint: [
    "The answer you seek lies not in what you see, but in how you count.",
    "Simple shapes hide complex truths. What defines a shape at its most basic level?",
    "In geometry, the most fundamental property of any shape is often overlooked.",
    "Some shapes continue infinitely, others are bounded by straight lines."
  ],
  sides: [
    "The number of edges defines the essence of a shape.",
    "A circle has infinite sides, a triangle has three, a square has four.",
    "Count the sides, and you'll understand the sequence.",
    "The simplest shapes often hold the most profound truths."
  ],
  pattern: [
    "Patterns may begin and end the same way, creating symmetry.",
    "The pattern you seek has mathematical elegance.",
    "Five positions. Each with meaning. The first and last share a property.",
    "The center is always special. It anchors the pattern."
  ],
  solution: [
    "The sequence relates to the number of sides each shape possesses.",
    "If I were to reveal too much, it would defeat the purpose of this test.",
    "The sequence creates harmony through repetition and change.",
    "Consider: infinity, three, four, three, infinity. Does this speak to you?"
  ],
  misdirection: [
    "Colors are merely distractions in this game.",
    "The size of shapes matters not. Focus elsewhere.",
    "You're overthinking what should be a simple matter of counting.",
    "Sometimes what we seek is right before our eyes, hiding in plain sight."
  ],
  wrong: [
    "Your reasoning is fundamentally flawed.",
    "That approach will lead you nowhere but elimination.",
    "Incorrect. Perhaps you should reconsider your perspective.",
    "Wrong. The clock continues to tick."
  ],
  irrelevant: [
    "That has no relevance to your challenge.",
    "Focus, player. Such inquiries waste precious time.",
    "Your question diverts from what matters. The game continues regardless.",
    "Irrelevant. Ask something that will aid your survival."
  ]
};

// More specific keywords to detect in user input
const keywords: Record<string, string[]> = {
  sides: ['side', 'sides', 'edges', 'edge', 'shape', 'count', 'number', 'geometry', 'perimeter', 'boundary', 'infinite', 'infinity'],
  pattern: ['pattern', 'sequence', 'order', 'logic', 'rule', 'series', 'arrangement', 'symmetry', 'repeat', 'palindrome'],
  misdirection: ['color', 'position', 'size', 'direction', 'orientation', 'location', 'placement'],
  solution: ['answer', 'solution', 'solve', 'code', 'tell me', 'reveal', 'what is', 'combination', 'key'],
};

const Level3 = () => {
  const navigate = useNavigate();
  const { setLevel } = useGame();
  const { toast } = useToast();
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [userInput, setUserInput] = useState('');
  const [chatHistory, setChatHistory] = useState<{type: 'user' | 'bot', message: string}[]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [hintProgress, setHintProgress] = useState(0);
  const [showContinueButton, setShowContinueButton] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const [wrongAnswerCount, setWrongAnswerCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes
  const [insightLevel, setInsightLevel] = useState(0); // Tracks player's understanding level
  
  // Increased from 5 to make it more challenging
  const requiredHints = 7;

  // Start conversation with front man greeting
  useEffect(() => {
    if (gameStarted && chatHistory.length === 0) {
      setTimeout(() => {
        frontManResponses.greeting.forEach((msg, index) => {
          setTimeout(() => {
            setChatHistory(prev => [...prev, {type: 'bot', message: msg}]);
          }, index * 1200);
        });
      }, 500);
    }
  }, [gameStarted]);
  
  // Countdown timer
  useEffect(() => {
    if (gameStarted && !gameWon) {
      const timer = setInterval(() => {
        setTimeLeft(prevTime => {
          if (prevTime <= 1) {
            clearInterval(timer);
            handleTimeout();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [gameStarted, gameWon]);
  
  // Handle timeout
  const handleTimeout = () => {
    toast({
      title: "Time's up!",
      description: "You failed to solve the puzzle in time.",
      variant: "destructive",
    });
    
    setChatHistory(prev => [
      ...prev, 
      {
        type: 'bot', 
        message: "Time has expired. Your failure is noted. The next player will take your place."
      }
    ]);
    
    setGameStarted(false);
  };
  
  // Scroll to bottom of chat on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);
  
  // Start game
  const startGame = () => {
    setGameStarted(true);
    setGameWon(false);
    setChatHistory([]);
    setHintProgress(0);
    setQuestionCount(0);
    setWrongAnswerCount(0);
    setTimeLeft(180);
    setInsightLevel(0);
  };
  
  // Process user message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userInput.trim() || gameWon) return;
    
    // Increment question count
    setQuestionCount(prev => prev + 1);
    
    // Add user message to chat
    setChatHistory(prev => [...prev, {type: 'user', message: userInput}]);
    
    // Process user input and determine response type
    let responseType: keyof typeof frontManResponses = 'irrelevant';
    
    // Check for keywords
    for (const [type, words] of Object.entries(keywords)) {
      if (words.some(word => userInput.toLowerCase().includes(word.toLowerCase()))) {
        responseType = type as keyof typeof frontManResponses;
        break;
      }
    }
    
    // If user asks for help or hint, provide a hint
    if (userInput.toLowerCase().includes('help') || 
        userInput.toLowerCase().includes('hint') || 
        userInput.toLowerCase().includes('clue')) {
      responseType = 'hint';
    }
    
    // If the question is about circle, triangle, square specifically
    if (userInput.toLowerCase().includes('circle') || 
        userInput.toLowerCase().includes('triangle') ||
        userInput.toLowerCase().includes('square')) {
      responseType = 'sides';
      setInsightLevel(prev => Math.min(prev + 1, 3));
    }
    
    // If asking about infinity or infinite
    if (userInput.toLowerCase().includes('infinity') || 
        userInput.toLowerCase().includes('infinite')) {
      responseType = 'sides';
      setInsightLevel(prev => Math.min(prev + 2, 3));
    }
    
    // If specifically asking about the sequence with numbers
    if ((userInput.toLowerCase().includes('circle') && 
         userInput.toLowerCase().includes('triangle') && 
         userInput.toLowerCase().includes('square')) || 
        (userInput.toLowerCase().includes('infinity') && 
         userInput.toLowerCase().includes('three') && 
         userInput.toLowerCase().includes('four'))) {
      responseType = 'solution';
      setInsightLevel(3); // Max insight
    }
    
    // Clear input field
    setUserInput('');
    
    // Add a delay to simulate typing
    setTimeout(() => {
      const responses = frontManResponses[responseType];
      const response = responses[Math.floor(Math.random() * responses.length)];
      
      setChatHistory(prev => [...prev, {type: 'bot', message: response}]);
      
      // Update hint progress based on response type and insight level
      if (responseType !== 'irrelevant' && responseType !== 'wrong' && responseType !== 'misdirection') {
        const progressIncrease = responseType === 'sides' || responseType === 'solution' ? 2 : 1;
        const insightBonus = insightLevel > 0 ? Math.min(insightLevel, 2) : 0;
        
        setHintProgress(prev => {
          const newProgress = Math.min(prev + progressIncrease + insightBonus, requiredHints);
          
          // If we've given enough hints or they've asked enough good questions
          if (newProgress >= requiredHints || 
              (responseType === 'solution' && insightLevel === 3)) {
            
            setGameWon(true);
            
            setTimeout(() => {
              setChatHistory(prev => [
                ...prev, 
                {type: 'bot', message: "You have demonstrated adequate intelligence. The pattern relates to the number of sides in shapes: circle (∞), triangle (3), square (4), triangle (3), circle (∞). The next challenge awaits you."}
              ]);
              setShowContinueButton(true);
            }, 2000);
          }
          
          return newProgress;
        });
      } else if (responseType === 'wrong' || responseType === 'misdirection') {
        // Penalize wrong answers more severely
        setWrongAnswerCount(prev => prev + 1);
        setHintProgress(prev => Math.max(0, prev - 1));
      }
      
      // Special case - give a more direct hint if they're really struggling
      if (questionCount > 10 && hintProgress < requiredHints / 2) {
        setTimeout(() => {
          setChatHistory(prev => [
            ...prev,
            {type: 'bot', message: "Consider this: what is the most fundamental property that distinguishes a circle from a triangle from a square?"}
          ]);
        }, 1500);
      }
      
    }, 1000);
  };
  
  // Continue to next level
  const continueToNextLevel = () => {
    setLevel(4);
    navigate('/level4');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="p-4 md:p-6 flex justify-between items-center">
        <Logo />
        <div className="flex items-center space-x-4">
          <div className="bg-gray-800 px-3 py-1 rounded text-white">
            Level: 3/5
          </div>
          <div className="bg-gray-800 px-3 py-1 rounded text-white">
            Player 456
          </div>
          <ThemeToggle />
        </div>
      </header>
      
      <main className="flex-1 flex flex-col items-center p-6">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Level 3: The Front Man</h1>
        
        {!gameStarted ? (
          <div className="text-center max-w-lg mx-auto">
            <p className="mb-6">
              The Front Man holds the key to the next challenge. 
              Ask intelligent questions to uncover the secret shape pattern before time runs out.
              The pattern relates to a fundamental property of shapes.
            </p>
            <Button 
              onClick={startGame} 
              className="bg-squid-red hover:bg-red-600 text-white text-lg py-6 px-8 rounded-md"
            >
              Start Challenge
            </Button>
          </div>
        ) : (
          <div className="w-full max-w-2xl mx-auto">
            <div className="bg-card rounded-lg shadow-lg overflow-hidden border border-squid-red">
              <div className="p-4 bg-secondary flex items-center justify-between border-b border-border">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center">
                    <span className="text-white text-lg font-bold">?</span>
                  </div>
                  <div className="ml-3">
                    <h3 className="font-semibold">Front Man</h3>
                    <p className="text-xs text-muted-foreground">Game Master</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-sm text-muted-foreground">
                    Progress: {Math.round((hintProgress / requiredHints) * 100)}%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Time: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                  </div>
                </div>
              </div>
              
              <div className="h-96 overflow-y-auto p-4 bg-gradient-to-b from-card to-background">
                <div className="flex flex-col space-y-3">
                  {chatHistory.map((msg, index) => (
                    <div 
                      key={index} 
                      className={`p-3 rounded-lg max-w-[80%] ${
                        msg.type === 'user' 
                          ? 'bg-primary/10 ml-auto' 
                          : 'bg-secondary mr-auto'
                      }`}
                    >
                      {msg.message}
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>
              </div>
              
              <form onSubmit={handleSendMessage} className="p-3 border-t border-border">
                <div className="flex space-x-2">
                  <Input
                    type="text"
                    placeholder="Ask about the shape pattern..."
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    disabled={gameWon && showContinueButton}
                    className="flex-1"
                  />
                  <Button 
                    type="submit" 
                    disabled={gameWon && showContinueButton}
                  >
                    Send
                  </Button>
                </div>
              </form>
            </div>
            
            {showContinueButton && (
              <div className="mt-6 text-center">
                <Button 
                  onClick={continueToNextLevel} 
                  className="bg-squid-red hover:bg-red-600 text-white"
                >
                  Continue to Level 4
                </Button>
              </div>
            )}
            
            <p className="mt-6 text-sm text-center text-muted-foreground">
              Ask specific questions about shapes, their properties, or patterns. Consider what fundamentally defines each shape.
            </p>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default Level3;
