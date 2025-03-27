import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ChevronLeft, 
  ChevronRight, 
  Book, 
  Palette, 
  RefreshCw, 
  Lightbulb,
  CircleCheck,
  Eye
} from 'lucide-react';

interface ColorCombination {
  name: string;
  description: string;
  example: string[];
  theory: string;
}

const COLOR_COMBINATIONS: ColorCombination[] = [
  {
    name: 'Monochromatic',
    description: 'Various shades and tints of a single color',
    example: ['#3498DB', '#2980B9', '#1B4F72', '#85C1E9', '#EBF5FB'],
    theory: 'Monochromatic color schemes use a single hue with variations in saturation and brightness, creating a cohesive and harmonious look.'
  },
  {
    name: 'Analogous',
    description: 'Colors that are adjacent to each other on the color wheel',
    example: ['#E74C3C', '#F39C12', '#F1C40F', '#D35400', '#C0392B'],
    theory: 'Analogous color schemes use colors that are next to each other on the color wheel. These create a sense of harmony and cohesion.'
  },
  {
    name: 'Complementary',
    description: 'Colors that are opposite each other on the color wheel',
    example: ['#3498DB', '#E67E22', '#5DADE2', '#F5B041', '#2874A6'],
    theory: 'Complementary colors are directly opposite on the color wheel, creating maximum contrast and visual impact. They make each other appear brighter and more vibrant.'
  },
  {
    name: 'Triadic',
    description: 'Three colors evenly spaced on the color wheel',
    example: ['#3498DB', '#E74C3C', '#2ECC71', '#85C1E9', '#F5B7B1'],
    theory: 'Triadic color schemes use three colors evenly spaced around the color wheel. They tend to be vibrant, even when using paler or unsaturated versions of the hues.'
  },
  {
    name: 'Split-Complementary',
    description: 'A base color plus the two colors adjacent to its complement',
    example: ['#3498DB', '#F1C40F', '#E74C3C', '#85C1E9', '#F9E79F'],
    theory: 'Split-complementary schemes use a base color and the two colors adjacent to its complement. This provides high contrast but with less tension than a complementary scheme.'
  },
  {
    name: 'Tetradic (Rectangle)',
    description: 'Four colors arranged into two complementary pairs',
    example: ['#3498DB', '#F39C12', '#9B59B6', '#2ECC71'],
    theory: 'Tetradic color schemes consist of four colors arranged in two complementary pairs. This offers rich color possibilities but requires careful balancing to avoid overwhelming designs.'
  }
];

interface ColorTheoryTutorialProps {
  onColorSelect?: (color: string) => void;
}

const ColorTheoryTutorial: React.FC<ColorTheoryTutorialProps> = ({ onColorSelect }) => {
  const [activeTab, setActiveTab] = useState('learn');
  const [currentPage, setCurrentPage] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  
  // Define the quiz questions
  const quizQuestions = [
    {
      question: "Which color scheme uses a single hue with variations in brightness and saturation?",
      options: ["Analogous", "Monochromatic", "Complementary", "Triadic"],
      answer: "Monochromatic"
    },
    {
      question: "Colors opposite to each other on the color wheel create what type of scheme?",
      options: ["Analogous", "Monochromatic", "Complementary", "Split-Complementary"],
      answer: "Complementary"
    },
    {
      question: "Which scheme uses three colors evenly spaced on the color wheel?",
      options: ["Triadic", "Tetradic", "Analogous", "Monochromatic"],
      answer: "Triadic"
    }
  ];
  
  // Handle color selection
  const handleColorSelect = (color: string) => {
    if (onColorSelect) {
      onColorSelect(color);
    }
  };
  
  // Handle quiz answer selection
  const handleAnswerSelect = (questionIndex: number, answer: string) => {
    setQuizAnswers(prev => ({
      ...prev,
      [questionIndex]: answer
    }));
  };
  
  // Handle quiz submission
  const handleQuizSubmit = () => {
    setQuizSubmitted(true);
  };
  
  // Calculate quiz score
  const calculateScore = () => {
    let correctAnswers = 0;
    quizQuestions.forEach((question, index) => {
      if (quizAnswers[index] === question.answer) {
        correctAnswers += 1;
      }
    });
    return correctAnswers;
  };
  
  // Go to next page
  const nextPage = () => {
    if (currentPage < COLOR_COMBINATIONS.length - 1) {
      setCurrentPage(prev => prev + 1);
    }
  };
  
  // Go to previous page
  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
    }
  };
  
  return (
    <Card className="w-full mb-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Book className="h-5 w-5" />
          Color Theory Mini-Tutorial
        </CardTitle>
        <CardDescription>
          Learn about different color combinations and how to use them effectively
        </CardDescription>
      </CardHeader>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="px-6">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="learn">Learn</TabsTrigger>
            <TabsTrigger value="explore">Explore</TabsTrigger>
            <TabsTrigger value="quiz">Quiz</TabsTrigger>
          </TabsList>
        </div>
        
        <CardContent className="p-6">
          {/* Learn Tab */}
          <TabsContent value="learn" className="mt-0 space-y-4">
            <div className="relative">
              <div className="flex flex-col space-y-4">
                <h3 className="text-lg font-medium">{COLOR_COMBINATIONS[currentPage].name}</h3>
                <p className="text-sm text-muted-foreground">{COLOR_COMBINATIONS[currentPage].description}</p>
                
                <div className="flex h-12 rounded-md overflow-hidden">
                  {COLOR_COMBINATIONS[currentPage].example.map((color, index) => (
                    <div 
                      key={index} 
                      className="flex-1 h-full cursor-pointer hover:transform hover:scale-y-110 transition-transform"
                      style={{ backgroundColor: color }}
                      onClick={() => handleColorSelect(color)}
                      title={`Select ${color}`}
                    />
                  ))}
                </div>
                
                <div className="p-4 bg-secondary/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="h-4 w-4 text-primary" />
                    <h4 className="font-medium">The Theory</h4>
                  </div>
                  <p className="text-sm">{COLOR_COMBINATIONS[currentPage].theory}</p>
                </div>
              </div>
              
              <div className="flex justify-between mt-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={prevPage}
                  disabled={currentPage === 0}
                  className="flex items-center gap-1"
                >
                  <ChevronLeft className="h-4 w-4" /> Previous
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={nextPage}
                  disabled={currentPage === COLOR_COMBINATIONS.length - 1}
                  className="flex items-center gap-1"
                >
                  Next <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </TabsContent>
          
          {/* Explore Tab */}
          <TabsContent value="explore" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {COLOR_COMBINATIONS.map((combination, index) => (
                <div key={index} className="p-3 border rounded-lg hover:border-primary transition-colors">
                  <h3 className="font-medium">{combination.name}</h3>
                  <p className="text-xs text-muted-foreground mb-2">{combination.description}</p>
                  <div className="flex h-8 rounded-md overflow-hidden mb-2">
                    {combination.example.map((color, colorIndex) => (
                      <div 
                        key={colorIndex} 
                        className="flex-1 h-full cursor-pointer hover:transform hover:scale-y-110 transition-transform"
                        style={{ backgroundColor: color }}
                        onClick={() => handleColorSelect(color)}
                        title={`Select ${color}`}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          
          {/* Quiz Tab */}
          <TabsContent value="quiz" className="mt-0">
            <div className="space-y-6">
              {quizSubmitted ? (
                <div className="space-y-4">
                  <div className="p-4 bg-primary/10 rounded-lg text-center">
                    <div className="flex justify-center mb-2">
                      <CircleCheck className="h-12 w-12 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Quiz Complete!</h3>
                    <p className="text-lg">
                      You scored {calculateScore()} out of {quizQuestions.length}
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      {calculateScore() === quizQuestions.length 
                        ? "Perfect score! You're a color theory expert!" 
                        : "Review the Learn section to improve your knowledge."}
                    </p>
                  </div>
                  
                  <Button 
                    className="w-full flex items-center justify-center gap-2"
                    onClick={() => {
                      setQuizSubmitted(false);
                      setQuizAnswers({});
                    }}
                  >
                    <RefreshCw className="h-4 w-4" />
                    Retake Quiz
                  </Button>
                </div>
              ) : (
                <>
                  {quizQuestions.map((question, index) => (
                    <div key={index} className="space-y-3">
                      <h3 className="font-medium">Question {index + 1}:</h3>
                      <p>{question.question}</p>
                      <div className="grid grid-cols-2 gap-2">
                        {question.options.map((option, optionIndex) => (
                          <Badge
                            key={optionIndex}
                            variant={quizAnswers[index] === option ? "default" : "outline"}
                            className="px-3 py-1.5 cursor-pointer text-center"
                            onClick={() => handleAnswerSelect(index, option)}
                          >
                            {option}
                          </Badge>
                        ))}
                      </div>
                      {index < quizQuestions.length - 1 && <Separator className="my-2" />}
                    </div>
                  ))}
                  
                  <Button 
                    className="w-full"
                    onClick={handleQuizSubmit}
                    disabled={Object.keys(quizAnswers).length < quizQuestions.length}
                  >
                    Submit Answers
                  </Button>
                </>
              )}
            </div>
          </TabsContent>
        </CardContent>
        
        <CardFooter className="justify-between px-6 py-4 border-t">
          <p className="text-xs text-muted-foreground">Click on any color to select it for your palette</p>
          <Button variant="ghost" size="sm" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            <span className="hidden md:inline">View Color Wheel</span>
          </Button>
        </CardFooter>
      </Tabs>
    </Card>
  );
};

export default ColorTheoryTutorial;