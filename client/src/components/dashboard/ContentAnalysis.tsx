
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  AlertCircle, 
  Star, 
  ThumbsUp, 
  Users, 
  Clock, 
  Award
} from 'lucide-react';

interface ContentAnalysis {
  sentiment: number;
  engagementPrediction: number;
  audienceMatch: number;
  tags: string[];
  improvementSuggestions: string[];
  bestTimeToPost?: string;
  contentScore?: number;
  imageInsights?: string;
}

interface ContentAnalysisProps {
  contentId: number;
}

export default function ContentAnalysis({ contentId }: ContentAnalysisProps) {
  const { data: analysis, isLoading, error } = useQuery({
    queryKey: ['content-analysis', contentId], 
    queryFn: async () => {
      try {
        const response = await fetch(`/api/content/analyze`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contentId })
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to analyze content');
        }
        
        return response.json() as Promise<ContentAnalysis>;
      } catch (err) {
        console.error('Error analyzing content:', err);
        throw err;
      }
    }
  });

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-5 border border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between mb-5">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 animate-pulse"></div>
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-full w-20 animate-pulse"></div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {/* Skeleton for each metric card */}
          {[1, 2, 3].map((item) => (
            <div key={item} className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 animate-pulse">
              <div className="flex items-center mb-2">
                <div className="w-4 h-4 rounded-full bg-gray-200 dark:bg-gray-700 mr-1.5"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
              <div className="flex items-end mb-2">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                <div className="ml-2 h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-2"></div>
            </div>
          ))}
        </div>
        
        {/* Skeleton for tags section */}
        <div className="mb-5">
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-3"></div>
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="h-7 bg-gray-200 dark:bg-gray-700 rounded-full w-16 animate-pulse"></div>
            ))}
          </div>
        </div>
        
        {/* Skeleton for recommendations section */}
        <div>
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-3"></div>
          <div className="space-y-2">
            {[1, 2].map((item) => (
              <div key={item} className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-100 dark:border-red-800">
        <div className="flex items-center text-red-600 dark:text-red-400 mb-2">
          <AlertCircle className="w-5 h-5 mr-2" />
          <h3 className="font-semibold">Analysis Failed</h3>
        </div>
        <p className="text-sm text-red-600/70 dark:text-red-400/70 mb-3">
          {error instanceof Error 
            ? `Error: ${error.message}` 
            : "We couldn't analyze this content. Our analysis engine might be experiencing issues."}
        </p>
        <div className="flex justify-between items-center">
          <button 
            onClick={() => window.location.reload()} 
            className="text-xs bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-red-600 dark:text-red-400 font-medium py-1.5 px-3 rounded-md transition-colors border border-red-100 dark:border-red-800"
          >
            Try Again
          </button>
          <a href="#support" className="text-xs text-red-600/70 dark:text-red-400/70 hover:underline">
            Contact Support
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-5 border border-gray-100 dark:border-gray-800">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-semibold">Content Analysis</h3>
        <div className="text-xs py-1 px-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full border border-blue-100 dark:border-blue-800">
          AI Powered
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {/* Sentiment Metric */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 transition-transform hover:scale-[1.02]">
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-2">
            <Star className="w-4 h-4 mr-1.5 text-amber-500" />
            <span>Sentiment</span>
          </div>
          <div className="flex items-end">
            <div className="text-xl font-semibold">{analysis.sentiment}%</div>
            <div className="ml-2 text-xs text-gray-500 dark:text-gray-400">
              {analysis.sentiment > 75 ? 'Very Positive' : 
               analysis.sentiment > 50 ? 'Positive' : 
               analysis.sentiment > 25 ? 'Neutral' : 'Needs Improvement'}
            </div>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-2">
            <div 
              className="bg-amber-500 h-1.5 rounded-full" 
              style={{ width: `${analysis.sentiment}%` }}
              aria-label={`Sentiment score ${analysis.sentiment}%`}
              role="progressbar"
              aria-valuenow={analysis.sentiment}
              aria-valuemin={0}
              aria-valuemax={100}
            ></div>
          </div>
        </div>
        
        {/* Engagement Metric */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 transition-transform hover:scale-[1.02]">
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-2">
            <ThumbsUp className="w-4 h-4 mr-1.5 text-blue-500" />
            <span>Engagement</span>
          </div>
          <div className="flex items-end">
            <div className="text-xl font-semibold">{analysis.engagementPrediction}%</div>
            <div className="ml-2 text-xs text-gray-500 dark:text-gray-400">
              {analysis.engagementPrediction > 75 ? 'Excellent' : 
               analysis.engagementPrediction > 50 ? 'Good' : 
               analysis.engagementPrediction > 25 ? 'Fair' : 'Low'}
            </div>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-2">
            <div 
              className="bg-blue-500 h-1.5 rounded-full" 
              style={{ width: `${analysis.engagementPrediction}%` }}
              aria-label={`Engagement prediction ${analysis.engagementPrediction}%`}
              role="progressbar"
              aria-valuenow={analysis.engagementPrediction}
              aria-valuemin={0}
              aria-valuemax={100}
            ></div>
          </div>
        </div>
        
        {/* Audience Match Metric */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 transition-transform hover:scale-[1.02]">
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-2">
            <Users className="w-4 h-4 mr-1.5 text-purple-500" />
            <span>Audience Match</span>
          </div>
          <div className="flex items-end">
            <div className="text-xl font-semibold">{analysis.audienceMatch}%</div>
            <div className="ml-2 text-xs text-gray-500 dark:text-gray-400">
              {analysis.audienceMatch > 75 ? 'Perfect Fit' : 
               analysis.audienceMatch > 50 ? 'Good Fit' : 
               analysis.audienceMatch > 25 ? 'Partial Fit' : 'Misaligned'}
            </div>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-2">
            <div 
              className="bg-purple-500 h-1.5 rounded-full" 
              style={{ width: `${analysis.audienceMatch}%` }}
              aria-label={`Audience match ${analysis.audienceMatch}%`}
              role="progressbar"
              aria-valuenow={analysis.audienceMatch}
              aria-valuemin={0}
              aria-valuemax={100}
            ></div>
          </div>
        </div>
      </div>

      {analysis.contentScore && (
        <div className="mb-5 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-md flex items-center">
          <Award className="w-5 h-5 text-primary mr-2" />
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Overall Content Score</div>
            <div className="text-xl font-semibold">{analysis.contentScore}%</div>
          </div>
        </div>
      )}
      
      {analysis.bestTimeToPost && (
        <div className="mb-5 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-md flex items-center">
          <Clock className="w-5 h-5 text-green-500 mr-2" />
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Best Time to Post</div>
            <div className="font-medium">{analysis.bestTimeToPost}</div>
          </div>
        </div>
      )}

      <div className="space-y-5">
        <div>
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Suggested Tags</div>
          <div className="flex flex-wrap gap-2">
            {analysis.tags.map((tag, i) => (
              <span key={i} className="px-2 py-1 bg-primary/10 text-primary dark:bg-primary/20 rounded-full text-xs font-medium">
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div>
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Improvement Suggestions</div>
          <ul className="space-y-2">
            {analysis.improvementSuggestions.map((suggestion, i) => (
              <li key={i} className="flex items-start">
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-100 text-green-600 text-xs font-medium mr-2 mt-0.5">
                  {i + 1}
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-300">{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
        
        {analysis.imageInsights && (
          <div>
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Image Insights</div>
            <div className="text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-md">
              {analysis.imageInsights}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
