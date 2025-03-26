
import React from 'react';
import { useQuery } from '@tanstack/react-query';

interface ContentAnalysisProps {
  contentId: number;
}

export default function ContentAnalysis({ contentId }: ContentAnalysisProps) {
  const { data: analysis, isLoading } = useQuery(['content-analysis', contentId], 
    async () => {
      const response = await fetch(`/api/content/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentId })
      });
      return response.json();
    }
  );

  if (isLoading) {
    return (
      <div className="animate-pulse bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-4 border border-gray-100 dark:border-gray-800">
      <h3 className="text-lg font-semibold mb-4">Content Analysis</h3>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Sentiment Score</div>
          <div className="text-2xl font-semibold">{analysis?.sentiment}%</div>
        </div>
        <div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Engagement Prediction</div>
          <div className="text-2xl font-semibold">{analysis?.engagementPrediction}%</div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Suggested Tags</div>
          <div className="flex flex-wrap gap-2">
            {analysis?.tags.map((tag: string, i: number) => (
              <span key={i} className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-sm">
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Improvements</div>
          <ul className="list-disc list-inside space-y-1">
            {analysis?.improvementSuggestions.map((suggestion: string, i: number) => (
              <li key={i} className="text-sm">{suggestion}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
