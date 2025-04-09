import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Helmet } from "react-helmet-async";
import { Link } from "wouter";

export const DashboardPage = () => {
  const { user, logout } = useAuth();

  return (
    <>
      <Helmet>
        <title>Dashboard | Creately</title>
      </Helmet>
      
      <div className="container mx-auto py-10 px-4">
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome, {user?.displayName || user?.username || 'User'}!</h1>
          <p className="text-muted-foreground">Manage your creative tools and projects</p>
        </header>
        
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="palettes">Color Palettes</TabsTrigger>
            <TabsTrigger value="tools">Tools</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard title="Color Palettes" value="12" description="Total palettes created" />
              <StatCard title="Projects" value="4" description="Active creative projects" />
              <StatCard title="Collections" value="3" description="Organized asset collections" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Your latest creative actions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <ActivityItem 
                      title="Color Palette Created" 
                      description="Summer Vibes palette with 5 colors"
                      time="2 hours ago"
                    />
                    <ActivityItem 
                      title="Project Updated" 
                      description="Website Redesign project modified"
                      time="Yesterday"
                    />
                    <ActivityItem 
                      title="Mood Board Created" 
                      description="Urban Modern mood board with 8 images"
                      time="3 days ago"
                    />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Frequently used tools</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <QuickActionButton href="/color-palettes" label="Create Palette" />
                    <QuickActionButton href="/mood-boards" label="New Mood Board" />
                    <QuickActionButton href="/creative-prompts" label="Get Inspiration" />
                    <QuickActionButton href="/ai-enhancement" label="AI Enhancement" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="projects" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Projects</CardTitle>
                <CardDescription>Manage your creative projects</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-6">
                  <p className="text-muted-foreground mb-4">Projects feature coming soon!</p>
                  <Button>Create New Project</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="palettes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Color Palettes</CardTitle>
                <CardDescription>Your saved color combinations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-6">
                  <p className="text-muted-foreground mb-4">Visit the color palettes section to view and manage your palettes</p>
                  <Link href="/color-palettes">
                    <Button>Go to Color Palettes</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="tools" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Creative Tools</CardTitle>
                <CardDescription>Access your creative tools</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <ToolCard title="Color Palettes" href="/color-palettes" description="Create and manage color schemes" />
                  <ToolCard title="Mood Boards" href="/mood-boards" description="Visual inspiration collections" />
                  <ToolCard title="Mood Capsules" href="/mood-capsules" description="Emotional design elements" />
                  <ToolCard title="AI Enhancement" href="/ai-enhancement" description="AI-powered creative tools" />
                  <ToolCard title="Creative Prompts" href="/creative-prompts" description="Inspiration generators" />
                  <ToolCard title="Creative Tools" href="/creative-tools" description="Additional creation tools" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

// Helper Components
const StatCard = ({ title, value, description }: { title: string, value: string, description: string }) => (
  <Card>
    <CardHeader className="pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-3xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground mt-1">{description}</p>
    </CardContent>
  </Card>
);

const ActivityItem = ({ title, description, time }: { title: string, description: string, time: string }) => (
  <div className="flex justify-between items-start border-b pb-3 last:border-0 last:pb-0">
    <div>
      <h4 className="font-medium">{title}</h4>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
    <span className="text-xs text-muted-foreground">{time}</span>
  </div>
);

const QuickActionButton = ({ href, label }: { href: string, label: string }) => (
  <Link href={href}>
    <Button variant="outline" className="w-full">{label}</Button>
  </Link>
);

const ToolCard = ({ title, href, description }: { title: string, href: string, description: string }) => (
  <Card className="overflow-hidden">
    <CardHeader className="pb-2">
      <CardTitle className="text-lg">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-sm text-muted-foreground mb-4">{description}</p>
      <Link href={href}>
        <Button variant="outline" size="sm" className="w-full">Open</Button>
      </Link>
    </CardContent>
  </Card>
);

export default DashboardPage;