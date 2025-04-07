import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Mic, MicOff, Volume2, RefreshCw, Lightbulb } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface Color {
  hex: string;
  name: string;
  role: string;
}

interface VoiceColorSelectorProps {
  onPaletteGenerated?: (palette: string[]) => void;
  disabled?: boolean;
}

const VoiceColorSelector: React.FC<VoiceColorSelectorProps> = ({ 
  onPaletteGenerated,
  disabled = false 
}) => {
  // State hooks
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [guidance, setGuidance] = useState<string | null>(null);
  const [accessDenied, setAccessDenied] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [showTips, setShowTips] = useState(false);
  
  // References
  const recognitionRef = useRef<any>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  
  const { toast } = useToast();

  // Mutation for generating AI palette
  interface GeneratePaletteResponse {
    palette: {
      colors: Color[];
      moodName: string;
      description?: string;
    };
  }
  
  const generatePaletteMutation = useMutation<
    GeneratePaletteResponse,
    Error,
    { mood: string, description?: string }
  >({
    mutationFn: (data) => 
      apiRequest<GeneratePaletteResponse>({
        url: '/api/color-palettes/generate', 
        method: 'POST',
        data,
      }),
    onSuccess: (data) => {
      if (data.palette && data.palette.colors) {
        const newPalette = data.palette.colors.map((color: Color) => color.hex);
        
        // Notify parent component of new palette
        if (onPaletteGenerated) {
          onPaletteGenerated(newPalette);
        }
        
        // Update the guidance message instead of showing a toast
        setGuidance(`Created a ${data.palette.moodName} palette based on your description.`);
      }
    },
    onError: () => {
      setGuidance('Something went wrong. Please try again or be more specific with your description.');
    }
  });

  // Visualize audio input levels
  const visualizeAudio = useCallback(() => {
    if (!analyserRef.current) return;
    
    const analyser = analyserRef.current;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    
    const updateAudioLevel = () => {
      analyser.getByteFrequencyData(dataArray);
      
      // Calculate average frequency amplitude
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      const avg = sum / dataArray.length;
      
      // Normalize to 0-100 for the progress bar, with some scaling for better visual feedback
      const scaledLevel = Math.min(100, Math.max(0, avg * 1.5));
      setAudioLevel(scaledLevel);
      
      animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
    };
    
    updateAudioLevel();
  }, []);

  // Stop listening for voice input
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    
    // Stop audio visualization
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    // Clean up media stream
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    
    setIsListening(false);
    
    if (!transcript) {
      setGuidance('Click the microphone button to start describing colors with your voice.');
    }
  }, [transcript]);

  // Generate a palette from voice transcript
  const generatePaletteFromVoice = useCallback((voiceInput: string) => {
    if (!voiceInput.trim()) {
      setGuidance('I couldn\'t hear anything. Please try again.');
      return;
    }
    
    // Provide feedback during processing
    setGuidance('Creating your palette from voice input...');
    
    // Send the voice transcript to the API
    generatePaletteMutation.mutate({
      mood: 'CUSTOM', // Default mood
      description: voiceInput.trim()
    });
  }, [generatePaletteMutation]);

  // Set up speech recognition with optimized mobile performance
  const setupRecognition = useCallback(() => {
    try {
      // @ts-ignore - SpeechRecognition is not in the TypeScript types yet
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
        setGuidance('Speech recognition not supported. Try another browser.');
        return false;
      }
      
      const recognition = new SpeechRecognition();
      
      // Optimize for mobile - shorter continuous sessions to save battery
      recognition.continuous = false;
      
      // Improve response time by enabling interim results
      recognition.interimResults = true;
      
      // Default to system language with fallback to English
      recognition.lang = navigator.language || 'en-US';
      
      // Optimize recognition settings for different devices
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      
      if (isMobile) {
        // Mobile optimizations - shorter max duration
        recognition.maxAlternatives = 1; // Limit alternatives to save processing
      } else {
        // Desktop can handle more
        recognition.maxAlternatives = 3;
      }
      
      recognition.onresult = (event: any) => {
        const current = event.resultIndex;
        const result = event.results[current];
        const transcriptValue = result[0].transcript;
        setTranscript(transcriptValue);
        
        // Optimize confidence threshold based on ambient noise
        const confidenceThreshold = audioLevel > 50 ? 0.6 : 0.7; // Lower threshold in noisy environments
        
        // If we're confident and it's final, use this for generating
        if (result.isFinal && result[0].confidence > confidenceThreshold) {
          stopListening();
          generatePaletteFromVoice(transcriptValue);
        }
      };
      
      recognition.onerror = (event: any) => {
        if (event.error === 'not-allowed') {
          setAccessDenied(true);
          setGuidance('Microphone access denied. Check browser permissions.');
        } else if (event.error === 'network') {
          setGuidance('Network error. Check your connection and try again.');
        } else if (event.error === 'no-speech') {
          setGuidance('No speech detected. Speak clearly or try again in a quieter environment.');
        } else {
          setGuidance(`Recognition issue: ${event.error}. Try speaking clearly.`);
        }
        stopListening();
      };
      
      recognition.onend = () => {
        if (isListening) {
          // Dynamic restart with backoff to prevent excessive API calls
          try {
            recognition.start();
          } catch (e) {
            console.warn('Could not restart recognition immediately, using delay', e);
            // Implement backoff for mobile to prevent excessive battery drain
            setTimeout(() => {
              try {
                if (isListening) recognition.start();
              } catch (err) {
                stopListening();
                setGuidance('Voice recognition session ended. Tap to restart.');
              }
            }, 300);
          }
        }
      };
      
      recognitionRef.current = recognition;
      return true;
    } catch (error) {
      console.error('Error setting up speech recognition:', error);
      setGuidance('Speech recognition initialization failed. Try reloading the page.');
      return false;
    }
  }, [isListening, audioLevel, generatePaletteFromVoice, stopListening]);

  // Start listening for voice input - optimized for mobile
  const startListening = useCallback(async () => {
    if (disabled) return;
    
    // Clear previous transcript
    setTranscript('');
    setGuidance('Listening... Describe colors or mood you want.');
    
    // Set up recognition if not already done
    if (!recognitionRef.current && !setupRecognition()) {
      return;
    }
    
    try {
      // Request microphone access with optimized constraints for mobile
      const constraints = { 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      };
      
      // For iOS Safari, use a simpler constraint object to prevent permission issues
      const isiOS = /iPhone|iPad|iPod/.test(navigator.userAgent) && /Safari/.test(navigator.userAgent);
      
      if (isiOS) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;
      } else {
        // For all other browsers, use the enhanced constraints
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        mediaStreamRef.current = stream;
      }
      
      // Set up audio visualization with optimized settings for performance
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const audioContext = audioContextRef.current;
      const analyser = audioContext.createAnalyser();
      
      // Lower FFT size on mobile to reduce CPU usage
      const isMobile = /Android|iPhone|iPad|iPod/.test(navigator.userAgent);
      analyser.fftSize = isMobile ? 128 : 256;
      analyserRef.current = analyser;
      
      const source = audioContext.createMediaStreamSource(mediaStreamRef.current);
      source.connect(analyser);
      
      // Start visualization
      visualizeAudio();
      
      // Start recognition
      recognitionRef.current.start();
      setIsListening(true);
      
      // Use in-component feedback instead of toast for better mobile experience
      setGuidance('Listening... Speak clearly to describe colors or mood.');
    } catch (error: any) {
      console.error('Error starting voice recognition:', error);
      setAccessDenied(true);
      
      // Provide error guidance within component instead of toast
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        setGuidance('Microphone access denied. Please check your browser settings.');
      } else if (error.name === 'NotFoundError') {
        setGuidance('No microphone detected. Please connect a microphone device.');
      } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        setGuidance('Microphone is in use by another application. Close other apps using it.');
      } else {
        setGuidance(`Microphone error: ${error.message || 'Unknown error'}. Try reloading.`);
      }
    }
  }, [disabled, setupRecognition, visualizeAudio]);

  // Reset when done or on error
  const handleReset = useCallback(() => {
    setTranscript('');
    setGuidance('Click the microphone button to start describing colors with your voice.');
    stopListening();
  }, [stopListening]);

  // Play voice guidance
  const speakGuidance = useCallback(() => {
    if (!guidance) return;
    
    // Use browser's speech synthesis
    const speech = new SpeechSynthesisUtterance(guidance);
    speech.rate = 1.0;
    speech.pitch = 1.0;
    speech.volume = 1.0;
    
    window.speechSynthesis.speak(speech);
  }, [guidance]);

  // Toggle tips visibility
  const toggleTips = useCallback(() => {
    setShowTips(prev => !prev);
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopListening();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [stopListening]);

  return (
    <Card className="voice-selector-card overflow-hidden">
      <CardHeader className="bg-primary/5 pb-2">
        <CardTitle className="flex items-center text-xl">
          <span>Voice Color Explorer</span>
          <Button 
            variant="ghost" 
            size="icon" 
            className="ml-auto" 
            onClick={toggleTips}
            aria-label="Toggle tips"
          >
            <Lightbulb className="h-5 w-5" />
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pt-4 space-y-4">
        {/* Tips section */}
        {showTips && (
          <div className="bg-muted p-3 rounded-md text-sm mb-4 animate-fadeIn">
            <h4 className="font-medium mb-1">Voice Command Tips:</h4>
            <ul className="list-disc pl-5 space-y-1">
              <li>Describe the mood: "Create a calming ocean palette"</li>
              <li>Specify colors: "I want deep purples with gold accents"</li>
              <li>Reference scenes: "Like a sunset over mountains"</li>
              <li>Use emotions: "Colors that feel energetic and bold"</li>
            </ul>
          </div>
        )}
        
        {/* Voice input visualization */}
        <div className="relative h-20 bg-muted rounded-lg overflow-hidden border border-border/50">
          <div 
            className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
              isListening ? 'opacity-100' : 'opacity-70'
            }`}
          >
            {transcript ? (
              <p className="text-center p-2 text-sm font-medium">{transcript}</p>
            ) : (
              <p className="text-center p-2 text-sm text-muted-foreground">
                {guidance || 'Click the microphone button to start describing colors with your voice.'}
              </p>
            )}
          </div>
          
          {/* Audio level visualization */}
          {isListening && (
            <div className="absolute bottom-2 left-2 right-2">
              <Progress value={audioLevel} max={100} className="h-1.5 w-full" />
            </div>
          )}
        </div>
        
        {/* Controls */}
        <div className="flex justify-center space-x-2">
          <Button
            onClick={isListening ? stopListening : startListening}
            variant={isListening ? "destructive" : "default"}
            className={`relative flex-1 ${isListening ? 'animate-pulse-slow' : ''}`}
            disabled={disabled || accessDenied || generatePaletteMutation.isPending}
          >
            {isListening ? (
              <>
                <MicOff className="mr-2 h-5 w-5" />
                Stop Listening
              </>
            ) : (
              <>
                <Mic className="mr-2 h-5 w-5" />
                Start Voice Input
              </>
            )}
            
            {/* Visualize recording state */}
            {isListening && (
              <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full m-1 animate-pulse-slow" />
            )}
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            onClick={speakGuidance}
            disabled={!guidance || isListening}
            title="Speak guidance aloud"
          >
            <Volume2 className="h-5 w-5" />
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            onClick={handleReset}
            disabled={isListening || (!transcript && !guidance)}
            title="Reset"
          >
            <RefreshCw className="h-5 w-5" />
          </Button>
        </div>

        {/* Loading state */}
        {generatePaletteMutation.isPending && (
          <div className="text-center py-2">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary border-r-transparent" />
            <p className="text-sm text-muted-foreground mt-1">Creating your palette...</p>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="border-t bg-muted/30 justify-between pt-2 pb-2 text-xs text-muted-foreground">
        <div>Use your voice to create unique color palettes</div>
        {accessDenied && (
          <div className="text-destructive">Microphone access required</div>
        )}
      </CardFooter>
    </Card>
  );
};

export default VoiceColorSelector;