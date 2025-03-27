
import React, { useState } from 'react';
import MoodCapsuleForm from '@/components/forms/MoodCapsuleForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface MoodCapsuleData {
  title: string;
  description: string;
  tags: string[];
  moodTones: string[];
}

const MoodCapsulesContainer: React.FC = () => {
  const [capsules, setCapsules] = useState<MoodCapsuleData[]>([]);
  const [activeTab, setActiveTab] = useState('view');

  const handleSubmit = (data: MoodCapsuleData) => {
    setCapsules(prev => [...prev, data]);
    setActiveTab('view');
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">Mood Capsules Dashboard</h2>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="view">View Capsules</TabsTrigger>
          <TabsTrigger value="create">Create New</TabsTrigger>
        </TabsList>
        
        <TabsContent value="view" className="mt-6">
          {capsules.length === 0 ? (
            <Card className="text-center p-8">
              <CardHeader>
                <CardTitle>No Mood Capsules Yet</CardTitle>
                <CardDescription>
                  Create your first mood capsule to start organizing your creative journey
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => setActiveTab('create')}>
                  Create Your First Mood Capsule
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {capsules.map((capsule, index) => (
                <Card key={index} className="overflow-hidden">
                  <CardHeader>
                    <CardTitle>{capsule.title}</CardTitle>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {capsule.moodTones.map(mood => (
                        <span key={mood} className="px-2 py-1 bg-primary/20 text-primary text-xs rounded-full">
                          {mood}
                        </span>
                      ))}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">{capsule.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {capsule.tags.map(tag => (
                        <span key={tag} className="px-2 py-1 bg-secondary/20 text-secondary text-xs rounded-full">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="create" className="mt-6">
          <MoodCapsuleForm onSubmit={handleSubmit} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MoodCapsulesContainer;
