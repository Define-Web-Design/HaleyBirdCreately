
import React, { useState } from 'react';
import { BarChart, Activity, ChevronDown, Info, ExternalLink } from 'lucide-react';
import { InfoModal } from '@/components/ui/info-modal';
import { Modal, useModal } from '@/components/ui/modal';

interface ContentAnalysisProps {
  contentId?: string | number;
}

export function ContentAnalysis({ contentId }: ContentAnalysisProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const fullViewModal = useModal();

  // Sample data - in a real app, this would come from an API
  const analysisData = {
    overview: {
      contentScore: 87,
      readabilityScore: 72,
      engagementScore: 91,
      seoScore: 85,
    },
    // Other analysis data...
  };

  const toggleSection = (section: string) => {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
    }
  };

  const handleFullView = () => {
    fullViewModal.openModal();
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 flex items-center">
            Content Analysis
            <InfoModal 
              title="About Content Analysis"
              content={
                <div>
                  <p>Content Analysis provides insights into your content performance and quality metrics.</p>
                  <ul>
                    <li><strong>Content Score:</strong> Overall quality assessment</li>
                    <li><strong>Readability:</strong> How easy your content is to read</li>
                    <li><strong>Engagement:</strong> How well your content captures attention</li>
                    <li><strong>SEO:</strong> Search engine optimization score</li>
                  </ul>
                </div>
              }
              iconOnly={true}
            />
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Analysis of your content performance and quality metrics
          </p>
        </div>
        
        <button 
          onClick={handleFullView}
          className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 flex items-center text-sm"
        >
          <ExternalLink className="h-4 w-4 mr-1" />
          Full Analysis
        </button>
      </div>

      <div className="p-4">
        <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
          <button
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'overview'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-500'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'readability'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-500'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('readability')}
          >
            Readability
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'engagement'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-500'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('engagement')}
          >
            Engagement
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'seo'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-500'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('seo')}
          >
            SEO
          </button>
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-gray-50 dark:bg-gray-700 p-3 sm:p-4 rounded-lg">
                <div className="flex justify-between items-center mb-1 sm:mb-2">
                  <span className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Content Score</span>
                  <BarChart className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500" />
                </div>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">{analysisData.overview.contentScore}/100</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-3 sm:p-4 rounded-lg">
                <div className="flex justify-between items-center mb-1 sm:mb-2">
                  <span className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Readability</span>
                  <Activity className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                </div>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">{analysisData.overview.readabilityScore}/100</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-3 sm:p-4 rounded-lg">
                <div className="flex justify-between items-center mb-1 sm:mb-2">
                  <span className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Engagement</span>
                  <Activity className="h-3 w-3 sm:h-4 sm:w-4 text-purple-500" />
                </div>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">{analysisData.overview.engagementScore}/100</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-3 sm:p-4 rounded-lg">
                <div className="flex justify-between items-center mb-1 sm:mb-2">
                  <span className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">SEO Score</span>
                  <Activity className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500" />
                </div>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">{analysisData.overview.seoScore}/100</p>
              </div>
            </div>

            <div className="mt-6">
              <button
                className="flex items-center justify-between w-full p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-left"
                onClick={() => toggleSection('insights')}
              >
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Key Insights</span>
                <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${expandedSection === 'insights' ? 'transform rotate-180' : ''}`} />
              </button>
              {expandedSection === 'insights' && (
                <div className="p-4 border-t border-gray-200 dark:border-gray-600">
                  <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                    <li className="flex items-start">
                      <span className="inline-block w-2 h-2 bg-green-500 rounded-full mt-1.5 mr-2"></span>
                      Strong introduction and conclusion sections
                    </li>
                    <li className="flex items-start">
                      <span className="inline-block w-2 h-2 bg-yellow-500 rounded-full mt-1.5 mr-2"></span>
                      Consider reducing sentence length in the middle sections
                    </li>
                    <li className="flex items-start">
                      <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mt-1.5 mr-2"></span>
                      Good keyword distribution throughout the content
                    </li>
                    <li className="flex items-start">
                      <span className="inline-block w-2 h-2 bg-purple-500 rounded-full mt-1.5 mr-2"></span>
                      High engagement potential based on content structure
                    </li>
                  </ul>
                </div>
              )}
            </div>

            <div>
              <button
                className="flex items-center justify-between w-full p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-left"
                onClick={() => toggleSection('recommendations')}
              >
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Recommendations</span>
                <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${expandedSection === 'recommendations' ? 'transform rotate-180' : ''}`} />
              </button>
              {expandedSection === 'recommendations' && (
                <div className="p-4 border-t border-gray-200 dark:border-gray-600">
                  <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                    <li className="flex items-start">
                      <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mt-1.5 mr-2"></span>
                      Add 2-3 more examples to support your main points
                    </li>
                    <li className="flex items-start">
                      <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mt-1.5 mr-2"></span>
                      Include additional subheadings for better content structure
                    </li>
                    <li className="flex items-start">
                      <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mt-1.5 mr-2"></span>
                      Consider adding a call-to-action at the end
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'readability' && (
          <div>
            <p className="text-gray-700 dark:text-gray-300">Detailed readability metrics coming soon...</p>
          </div>
        )}

        {activeTab === 'engagement' && (
          <div>
            <p className="text-gray-700 dark:text-gray-300">Engagement metrics coming soon...</p>
          </div>
        )}

        {activeTab === 'seo' && (
          <div>
            <p className="text-gray-700 dark:text-gray-300">SEO analysis coming soon...</p>
          </div>
        )}
      </div>

      {/* Full View Modal */}
      <Modal 
        isOpen={fullViewModal.isOpen} 
        onClose={fullViewModal.closeModal} 
        title="Complete Content Analysis"
        size="xl"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Content Overview</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                This analysis provides a comprehensive look at your content quality, readability, engagement potential, and SEO optimization.
              </p>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Content Score</span>
                <BarChart className="h-4 w-4 text-blue-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{analysisData.overview.contentScore}/100</p>
              <p className="text-xs text-gray-500 mt-1">Your content is well-structured with good formatting</p>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Readability</span>
                <Activity className="h-4 w-4 text-green-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{analysisData.overview.readabilityScore}/100</p>
              <p className="text-xs text-gray-500 mt-1">Flesch-Kincaid level: Grade 8-9 (Good)</p>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Engagement</span>
                <Activity className="h-4 w-4 text-purple-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{analysisData.overview.engagementScore}/100</p>
              <p className="text-xs text-gray-500 mt-1">High potential for reader engagement</p>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">SEO Score</span>
                <Activity className="h-4 w-4 text-yellow-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{analysisData.overview.seoScore}/100</p>
              <p className="text-xs text-gray-500 mt-1">Good keyword optimization throughout</p>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Detailed Analysis</h3>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Key Strengths</h4>
              <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full mt-1.5 mr-2"></span>
                  Strong introduction that clearly establishes the topic
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full mt-1.5 mr-2"></span>
                  Well-organized structure with logical flow between sections
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full mt-1.5 mr-2"></span>
                  Good use of subheadings to break up content
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full mt-1.5 mr-2"></span>
                  Effective conclusion that summarizes key points
                </li>
              </ul>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mt-4">
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Areas for Improvement</h4>
              <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-yellow-500 rounded-full mt-1.5 mr-2"></span>
                  Some sentences in the middle sections are too long (30+ words)
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-yellow-500 rounded-full mt-1.5 mr-2"></span>
                  Consider adding more visual elements to break up text
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-yellow-500 rounded-full mt-1.5 mr-2"></span>
                  A few paragraphs could be shortened for better readability
                </li>
              </ul>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mt-4">
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Recommendations</h4>
              <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mt-1.5 mr-2"></span>
                  Break down longer sentences to improve readability
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mt-1.5 mr-2"></span>
                  Add 2-3 more supporting examples or evidence
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mt-1.5 mr-2"></span>
                  Include a clear call-to-action at the end
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mt-1.5 mr-2"></span>
                  Consider adding internal links to related content
                </li>
              </ul>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default ContentAnalysis;
