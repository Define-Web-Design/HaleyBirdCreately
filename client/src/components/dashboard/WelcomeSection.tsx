import { User } from '@/lib/types';

interface WelcomeSectionProps {
  user?: User;
  onCreateContent?: () => void;
}

const WelcomeSection = ({ user, onCreateContent }: WelcomeSectionProps) => {
  const displayName = user?.displayName || 'Sophia';

  return (
    <section className="mb-8 animate-fade-in transition-all">
      <div className="p-4 sm:p-6 rounded-xl bg-gradient-to-br from-orange-50/50 to-transparent dark:from-gray-800/20 dark:to-transparent border border-orange-100/60 dark:border-gray-800/60 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-['SF_Pro_Display'] font-bold text-gray-900 dark:text-white">
              Welcome, {displayName}
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1 max-w-md">
              Let's optimize your content strategy today with AI-powered tools
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex-shrink-0">
            <button 
              onClick={onCreateContent}
              className="bg-gradient-to-r from-[#F2994A] to-[#FF9DAE] text-white font-medium py-2.5 px-5 rounded-lg shadow-md hover:shadow-lg flex items-center transition-all hover:translate-y-[-1px]"
              aria-label="Create new content"
            >
              <i className="fas fa-plus mr-2.5"></i> Create New Content
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WelcomeSection;
