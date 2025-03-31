
import { useEffect, useState } from 'react';

/**
 * A React hook that returns whether a media query matches the current environment.
 * 
 * @param query The media query to check
 * @returns A boolean indicating whether the media query matches
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(false);
  
  useEffect(() => {
    // Create media query list
    const mediaQuery = window.matchMedia(query);
    
    // Set initial value
    setMatches(mediaQuery.matches);
    
    // Define event listener
    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };
    
    // Add event listener
    mediaQuery.addEventListener('change', listener);
    
    // Cleanup function to remove event listener
    return () => {
      mediaQuery.removeEventListener('change', listener);
    };
  }, [query]); // Re-run effect if query changes
  
  return matches;
}

export default useMediaQuery;
