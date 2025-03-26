
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
      <div className="animate-pulse bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-3"></div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
        <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded mb-3"></div>
        <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
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
        <p className="text-sm text-red-600/70 dark:text-red-400/70">
          We couldn't analyze this content. Please try again later.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-4 border border-gray-100 dark:border-gray-800">
      <h3 className="text-lg font-semibold mb-4">Content Analysis</h3>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        <div>
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-1">
            <Star className="w-4 h-4 mr-1 text-amber-500" />
            <span>Sentiment</span>
          </div>
          <div className="text-xl font-semibold">{analysis.sentiment}%</div>
        </div>
        
        <div>
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-1">
            <ThumbsUp className="w-4 h-4 mr-1 text-blue-500" />
            <span>Engagement</span>
          </div>
          <div className="text-xl font-semibold">{analysis.engagementPrediction}%</div>
        </div>
        
        <div>
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-1">
            <Users className="w-4 h-4 mr-1 text-purple-500" />
            <span>Audience Match</span>
          </div>
          <div className="text-xl font-semibold">{analysis.audienceMatch}%</div>
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
