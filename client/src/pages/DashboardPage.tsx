import { Helmet } from 'react-helmet-async';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export function DashboardPage() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto py-8 px-4">
        <Helmet>
          <title>Dashboard | Creately</title>
          <meta name="description" content="Your personal dashboard on Creately" />
        </Helmet>
        
        <div className="flex flex-col gap-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <Button variant="outline" onClick={handleLogout}>Sign Out</Button>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Welcome, {user?.displayName || user?.username || 'User'}!</CardTitle>
              <CardDescription>
                This is your personal dashboard where you can manage your account and creations.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="rounded-lg border p-4">
                    <h3 className="text-lg font-medium mb-2">Account Details</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Username:</span> {user?.username}</p>
                      <p><span className="font-medium">Email:</span> {user?.email}</p>
                      <p><span className="font-medium">Role:</span> {user?.role}</p>
                    </div>
                  </div>
                  
                  <div className="rounded-lg border p-4">
                    <h3 className="text-lg font-medium mb-2">Quick Stats</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col items-center justify-center p-3 bg-primary/10 rounded-md">
                        <span className="text-2xl font-bold">0</span>
                        <span className="text-xs text-muted-foreground">Palettes</span>
                      </div>
                      <div className="flex flex-col items-center justify-center p-3 bg-primary/10 rounded-md">
                        <span className="text-2xl font-bold">0</span>
                        <span className="text-xs text-muted-foreground">Saved</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <p className="text-sm text-muted-foreground">
                Account created on {new Date().toLocaleDateString()}
              </p>
            </CardFooter>
          </Card>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Create Palette</CardTitle>
                <CardDescription>Generate a new color palette based on mood or theme</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <div className="w-24 h-24 bg-gradient-to-r from-primary to-primary/60 rounded-full flex items-center justify-center">
                  <span className="text-3xl">🎨</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full">New Palette</Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Image Analysis</CardTitle>
                <CardDescription>Extract colors from your images</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-3xl">📷</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" variant="outline">Upload Image</Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Your Collections</CardTitle>
                <CardDescription>View and manage your saved collections</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <div className="w-24 h-24 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-3xl">📚</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" variant="secondary">View All</Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}