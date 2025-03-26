import { ToolCard as ToolCardType } from '@/lib/types';

interface ToolCardProps {
  tool: ToolCardType;
  children?: React.ReactNode;
}

const ToolCard = ({ tool, children }: ToolCardProps) => {
  return (
    <div className={`content-card bg-gradient-to-br ${tool.gradient} rounded-xl shadow-sm overflow-hidden border ${tool.border} p-6 flex flex-col transition-all hover:shadow-md`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className={`h-10 w-10 rounded-lg ${tool.iconGradient} flex items-center justify-center text-white`}>
            <i className={tool.icon}></i>
          </div>
          <h3 className="font-medium ml-3">{tool.title}</h3>
        </div>
        {tool.isNew && (
          <span className="text-xs text-primary bg-primary/10 py-1 px-2 rounded-full">New</span>
        )}
      </div>
      
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
        {tool.description}
      </p>
      
      {children}
      
      <button
        onClick={tool.onClick}
        className={`mt-auto text-white ${tool.buttonColor} rounded-lg py-2 font-medium transition-colors`}
      >
        {tool.buttonText || `Use ${tool.title}`}
      </button>
    </div>
  );
};

export default ToolCard;
