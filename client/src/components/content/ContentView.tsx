
import React, { useState } from 'react';
import { Modal, useModal } from '@/components/ui/modal';
import { ChevronRight, Maximize2, ExternalLink, Edit, Archive } from 'lucide-react';

interface ContentViewProps {
  content: {
    id: string;
    title: string;
    type: string;
    thumbnail?: string;
    description: string;
    createdAt: string;
    content: string;
  };
  onEdit?: (id: string) => void;
  onArchive?: (id: string) => void;
  onFullScreen?: (id: string) => void;
}

export function ContentView({ content, onEdit, onArchive, onFullScreen }: ContentViewProps) {
  const { isOpen, openModal, closeModal } = useModal();
  const [expanded, setExpanded] = useState(false);

  const handleEdit = () => {
    if (onEdit) onEdit(content.id);
    closeModal();
  };

  const handleArchive = () => {
    if (onArchive) onArchive(content.id);
    closeModal();
  };

  const handleFullScreen = () => {
    if (onFullScreen) onFullScreen(content.id);
    closeModal();
  };

  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  return (
    <>
      <div 
        className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
        onClick={openModal}
      >
        {content.thumbnail && (
          <div className="mb-3 h-32 overflow-hidden rounded-md">
            <img 
              src={content.thumbnail} 
              alt={content.title} 
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">{content.title}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{content.type} • {new Date(content.createdAt).toLocaleDateString()}</p>
        <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">{content.description}</p>
        <div className="mt-3 flex items-center text-blue-500 dark:text-blue-400">
          <span className="text-sm">View details</span>
          <ChevronRight className="h-4 w-4 ml-1" />
        </div>
      </div>

      <Modal 
        isOpen={isOpen} 
        onClose={closeModal} 
        title={content.title}
        size={expanded ? "xl" : "md"}
      >
        <div className="space-y-4">
          {content.thumbnail && (
            <div className="mb-3 overflow-hidden rounded-md">
              <img 
                src={content.thumbnail} 
                alt={content.title} 
                className="w-full object-cover"
              />
            </div>
          )}
          
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {content.type} • Created on {new Date(content.createdAt).toLocaleDateString()}
            </p>
            <div className="flex space-x-2">
              <button 
                onClick={toggleExpand} 
                className="p-1.5 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                aria-label={expanded ? "Collapse view" : "Expand view"}
              >
                <Maximize2 className="h-4 w-4" />
              </button>
              {onFullScreen && (
                <button 
                  onClick={handleFullScreen} 
                  className="p-1.5 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  aria-label="Open in full screen"
                >
                  <ExternalLink className="h-4 w-4" />
                </button>
              )}
              {onEdit && (
                <button 
                  onClick={handleEdit} 
                  className="p-1.5 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  aria-label="Edit content"
                >
                  <Edit className="h-4 w-4" />
                </button>
              )}
              {onArchive && (
                <button 
                  onClick={handleArchive} 
                  className="p-1.5 rounded-full text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-500"
                  aria-label="Archive content"
                >
                  <Archive className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
          
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-gray-700 dark:text-gray-300">{content.description}</p>
            <div dangerouslySetInnerHTML={{ __html: content.content }} />
          </div>
        </div>
      </Modal>
    </>
  );
}
