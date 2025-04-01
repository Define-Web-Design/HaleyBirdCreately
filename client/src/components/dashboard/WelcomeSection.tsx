import { User } from '@/lib/types';

interface WelcomeSectionProps {
  user?: User;
  onCreateContent?: () => void;
}

const WelcomeSection = ({ user, onCreateContent }: WelcomeSectionProps) => {
  const displayName = user?.displayName || 'Sophia';

  return (
    <section className="mb-6">
      <div className="px-1 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-['SF_Pro_Display'] font-bold text-gray-900 dark:text-white">
              Welcome, {displayName}
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1 max-w-md text-sm">
              Let's optimize your content strategy today
            </p>
          </div>
          <div className="mt-3 sm:mt-0 flex-shrink-0">
            <button 
              onClick={onCreateContent}
              className="bg-primary text-white font-medium py-2 px-4 rounded-lg flex items-center transition-all"
              aria-label="Create new content"
            >
              <i className="fas fa-plus mr-2"></i> Create Content
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WelcomeSection;
