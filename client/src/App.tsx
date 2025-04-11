import { Route, Switch } from 'wouter';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Clean App</h1>
          <nav>
            <ul className="flex space-x-4">
              <li><a href="/" className="text-blue-600 hover:text-blue-800">Home</a></li>
              <li><a href="/login" className="text-blue-600 hover:text-blue-800">Login</a></li>
              <li><a href="/register" className="text-blue-600 hover:text-blue-800">Register</a></li>
              <li><a href="/profile" className="text-blue-600 hover:text-blue-800">Profile</a></li>
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
        </Switch>
      </main>
      <footer className="bg-gray-100 py-4">
        <div className="container mx-auto px-4 text-center text-gray-600">
          &copy; 2025 Clean App. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

export default App;