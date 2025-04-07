import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Progress } from "@/components/ui/progress";
import { Lightbulb, Check, ArrowRight, BookOpen } from 'lucide-react';

interface TutorialStep {
  id: number;
  title: string;
  content: string;
  image?: string; // For visual examples
  colors?: string[]; // For color examples
  isInteractive?: boolean;
}

interface Tutorial {
  id: number;
  title: string;
  description: string;
  steps: TutorialStep[];
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // in minutes
}

const TUTORIALS: Tutorial[] = [
  {
    id: 1,
    title: "Complementary Colors",
    description: "Learn how colors opposite each other on the color wheel create high contrast and vibrant designs.",
    steps: [
      {
        id: 101,
        title: "What are Complementary Colors?",
        content: "Complementary colors are pairs that sit opposite each other on the color wheel. They create maximum contrast when placed side by side.",
        colors: ["#FF0000", "#00FFFF", "#0000FF", "#FFFF00", "#00FF00", "#FF00FF"]
      },
      {
        id: 102,
        title: "Common Complementary Pairs",
        content: "The most common complementary pairs are red/green, blue/orange, and yellow/purple.",
        colors: ["#FF0000", "#00FF00", "#0000FF", "#FFA500", "#FFFF00", "#800080"]
      },
      {
        id: 103,
        title: "Using Complementary Colors",
        content: "Use complementary colors to make elements stand out or to create visual tension in your design.",
        isInteractive: true
      }
    ],
    level: 'beginner',
    duration: 3
  },
  {
    id: 2,
    title: "Analogous Color Harmony",
    description: "Discover how colors adjacent to each other on the color wheel create harmonious, cohesive designs.",
    steps: [
      {
        id: 201,
        title: "What are Analogous Colors?",
        content: "Analogous colors are groups of 3-5 colors that are adjacent to each other on the color wheel, such as yellow-green, yellow, and yellow-orange.",
        colors: ["#FFCC00", "#FF9900", "#FF6600", "#FF3300", "#FF0000"]
      },
      {
        id: 202,
        title: "Creating Depth",
        content: "Use one color as the dominant color, another to support, and a third as an accent.",
        colors: ["#336699", "#3399CC", "#66CCFF"]
      },
      {
        id: 203,
        title: "Applications",
        content: "Analogous color schemes work well for creating serene and comfortable designs that aren't jarring to the eye.",
        isInteractive: true
      }
    ],
    level: 'beginner',
    duration: 4
  }
];

const ColorTheoryMiniTutorials = () => {
  const [activeTutorial, setActiveTutorial] = useState<Tutorial | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedTutorials, setCompletedTutorials] = useState<number[]>([]);

  const startTutorial = (tutorial: Tutorial) => {
    setActiveTutorial(tutorial);
    setCurrentStep(0);
  };

  const nextStep = () => {
    if (activeTutorial && currentStep < activeTutorial.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Tutorial completed
      if (activeTutorial && !completedTutorials.includes(activeTutorial.id)) {
        setCompletedTutorials([...completedTutorials, activeTutorial.id]);
      }
      setActiveTutorial(null);
    }
  };

  const progress = activeTutorial ? ((currentStep + 1) / activeTutorial.steps.length) * 100 : 0;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Color Theory</CardTitle>
          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
            {completedTutorials.length} / {TUTORIALS.length} Completed
          </span>
        </div>
        <CardDescription className="text-xs text-muted-foreground">
          Quick mini-tutorials to enhance your color knowledge
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-4 pt-2">
        {activeTutorial ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium">{activeTutorial.title}</h3>
              <span className="text-xs text-muted-foreground">
                Step {currentStep + 1} of {activeTutorial.steps.length}
              </span>
            </div>
            
            <Progress value={progress} className="h-1.5" />
            
            <div className="p-3 bg-muted/50 rounded-lg">
              <h4 className="text-sm font-medium mb-2">{activeTutorial.steps[currentStep].title}</h4>
              <p className="text-xs text-muted-foreground mb-3">{activeTutorial.steps[currentStep].content}</p>
              
              {activeTutorial.steps[currentStep].colors && (
                <div className="flex gap-1 mb-3">
                  {activeTutorial.steps[currentStep].colors!.map((color, idx) => (
                    <div 
                      key={idx} 
                      className="h-8 flex-1 rounded-sm relative group"
                      style={{ backgroundColor: color }}
                    >
                      <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-mono bg-black/50">
                        {color}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              
              {activeTutorial.steps[currentStep].isInteractive && (
                <div className="bg-primary/5 p-2 rounded-lg border border-primary/10 text-xs text-primary flex items-center">
                  <Lightbulb className="h-3.5 w-3.5 mr-1.5" />
                  Try adjusting colors in the palette generator to see this in action!
                </div>
              )}
            </div>
            
            <Button 
              onClick={nextStep} 
              className="w-full flex items-center justify-center gap-1.5"
              size="sm"
            >
              {currentStep < activeTutorial.steps.length - 1 ? (
                <>Next <ArrowRight className="h-3.5 w-3.5" /></>
              ) : (
                <>Complete <Check className="h-3.5 w-3.5" /></>
              )}
            </Button>
          </div>
        ) : (
          <Carousel className="w-full">
            <CarouselContent>
              {TUTORIALS.map((tutorial) => (
                <CarouselItem key={tutorial.id}>
                  <div className="p-1">
                    <Card>
                      <CardContent className="p-3">
                        <div className="space-y-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="text-sm font-medium">{tutorial.title}</h3>
                              <p className="text-xs text-muted-foreground">{tutorial.description}</p>
                            </div>
                            {completedTutorials.includes(tutorial.id) && (
                              <span className="bg-green-500/10 text-green-500 p-1 rounded-full">
                                <Check className="h-3 w-3" />
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
                            <span className="bg-primary/10 px-2 py-0.5 rounded-full">
                              {tutorial.level}
                            </span>
                            <span className="flex items-center">
                              <BookOpen className="h-3 w-3 mr-1" />
                              {tutorial.duration} min
                            </span>
                          </div>
                          
                          <Button
                            onClick={() => startTutorial(tutorial)}
                            variant="outline"
                            size="sm"
                            className="w-full mt-2 text-xs h-8"
                          >
                            {completedTutorials.includes(tutorial.id) ? "Review" : "Start"}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="h-7 w-7 -left-3" />
            <CarouselNext className="h-7 w-7 -right-3" />
          </Carousel>
        )}
      </CardContent>
      
      <CardFooter className="p-3 pt-1 flex justify-center">
        <Button variant="link" size="sm" className="text-xs">
          Browse all tutorials
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ColorTheoryMiniTutorials;