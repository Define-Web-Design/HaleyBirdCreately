import { Route, Switch } from 'wouter';
import Home from './pages/Home';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Switch>
        <Route path="/" component={Home} />
        <Route>
          <div className="p-8 text-center">
            <h1 className="text-2xl font-bold mb-4">404: Page Not Found</h1>
            <p>The page you're looking for doesn't exist.</p>
          </div>
        </Route>
      </Switch>
    </div>
  );
}

export default App;