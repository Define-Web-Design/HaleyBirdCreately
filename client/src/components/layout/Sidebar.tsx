import { Link, useLocation } from 'wouter';
import { MENU_ITEMS, SMART_TOOLS } from '@/lib/constants';

const Sidebar = () => {
  const [location] = useLocation();

  return (
    <div className="flex flex-col w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 shadow-sm h-full">
      {/* Logo */}
      <div className="p-4 flex items-center">
        <div className="bg-gradient-to-r from-[#F2994A] to-[#FF9DAE] h-10 w-10 rounded-lg flex items-center justify-center text-white font-bold text-xl mr-3">C</div>
        <h1 className="text-xl font-['SF_Pro_Display'] font-semibold">Creately</h1>
      </div>
      
      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto py-4">
        <div className="px-4 mb-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Workspace</h2>
            <button className="text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary">
              <i className="fas fa-ellipsis-h text-xs"></i>
            </button>
          </div>
        </div>
        
        {/* Menu Items */}
        <ul>
          {MENU_ITEMS.map((item) => (
            <li key={item.path} className="px-2 mt-1 first:mt-0">
              <Link href={item.path} className={`flex items-center px-4 py-3 rounded-lg ${
                  location === item.path 
                  ? 'text-primary bg-orange-50 dark:bg-gray-800' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}>
                <i className={`${item.icon} w-5 mr-3`}></i>
                <span>{item.name}</span>
                {item.isNew && (
                  <span className="ml-2 px-1.5 py-0.5 text-xs font-medium text-white bg-primary rounded-full">New</span>
                )}
              </Link>
            </li>
          ))}
        </ul>
        
        <div className="px-4 mt-8 mb-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Smart Tools</h2>
          </div>
        </div>
        
        <ul>
          {SMART_TOOLS.map((tool) => (
            <li key={tool.path} className="px-2 mt-1 first:mt-0">
              <Link href={tool.path} className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                <i className={`${tool.icon} w-5 mr-3`}></i>
                <span>{tool.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      {/* User Profile */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800 mt-auto">
        <div className="flex items-center">
          <img 
            src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&h=120&q=80" 
            alt="User avatar" 
            className="h-8 w-8 rounded-full object-cover mr-3"
          />
          <div>
            <p className="text-sm font-medium">Sophia Chen</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Creator</p>
          </div>
          <button className="ml-auto text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary">
            <i className="fas fa-cog"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
