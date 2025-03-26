import { User } from '@/lib/types';

interface WelcomeSectionProps {
  user?: User;
  onCreateContent?: () => void;
}

const WelcomeSection = ({ user, onCreateContent }: WelcomeSectionProps) => {
  const displayName = user?.displayName || 'Sophia';

  return (
    <section className="mb-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-2xl font-['SF_Pro_Display'] font-bold">Welcome, {displayName}</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Let's optimize your content strategy today</p>
        </div>
        <div className="mt-4 md:mt-0">
          <button 
            onClick={onCreateContent}
            className="bg-gradient-to-r from-[#F2994A] to-[#FF9DAE] text-white font-medium py-2 px-4 rounded-lg shadow-md hover:shadow-lg flex items-center transition-shadow"
          >
            <i className="fas fa-plus mr-2"></i> Create New Content
          </button>
        </div>
      </div>
    </section>
  );
};

export default WelcomeSection;
