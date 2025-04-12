import { Route, Switch, Link } from 'wouter';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import SnippetsPage from './pages/snippets/SnippetsPage';
import SnippetDetailPage from './pages/snippets/SnippetDetailPage';
import SharedSnippetPage from './pages/snippets/SharedSnippetPage';
import CreateSnippetPage from './pages/snippets/CreateSnippetPage';
import EditSnippetPage from './pages/snippets/EditSnippetPage';
import { useAuth } from './hooks/useAuth';

function App() {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Creately</h1>
          <nav>
            <ul className="flex space-x-4">
              <li><Link href="/" className="text-blue-600 hover:text-blue-800">Home</Link></li>
              <li><Link href="/snippets" className="text-blue-600 hover:text-blue-800">Snippets</Link></li>
              {user ? (
                <>
                  <li><Link href="/profile" className="text-blue-600 hover:text-blue-800">Profile</Link></li>
                </>
              ) : (
                <>
                  <li><Link href="/login" className="text-blue-600 hover:text-blue-800">Login</Link></li>
                  <li><Link href="/register" className="text-blue-600 hover:text-blue-800">Register</Link></li>
                </>
              )}
            </ul>
          </nav>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/login" component={Login} />
          <Route path="/register" component={Register} />
          <Route path="/profile" component={Profile} />
          
          {/* Code Snippet Routes */}
          <Route path="/snippets" component={SnippetsPage} />
          <Route path="/snippets/new" component={CreateSnippetPage} />
          <Route path="/snippets/edit/:id" component={EditSnippetPage} />
          <Route path="/snippets/share/:shareId" component={SharedSnippetPage} />
          <Route path="/snippets/:id" component={SnippetDetailPage} />
        </Switch>
      </main>
      <footer className="bg-gray-100 py-4">
        <div className="container mx-auto px-4 text-center text-gray-600">
          &copy; 2025 Creately. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

export default App;