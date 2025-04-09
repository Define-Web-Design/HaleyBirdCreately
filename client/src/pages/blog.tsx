import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, Search, Tag, ThumbsUp, User } from 'lucide-react';

const BlogPage = () => {
  // Mock blog post data
  const featuredPosts = [
    {
      id: 1,
      title: 'Creative Symbiosis: How AI Enhances Human Creativity',
      excerpt: 'Discover how artificial intelligence can work alongside your natural creativity to produce amazing results.',
      category: 'AI + Creativity',
      date: 'April 2, 2025',
      readTime: '6 min read',
      author: 'Alex Chen',
      image: 'https://images.unsplash.com/photo-1633613286991-611fe299c4be?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      likes: 234
    },
    {
      id: 2,
      title: 'Unleashing Your Camera Roll: From Photos to Creative Assets',
      excerpt: 'Learn how to transform your everyday photos into powerful creative assets with the right tools.',
      category: 'Tools & Tips',
      date: 'March 28, 2025',
      readTime: '8 min read',
      author: 'Jamie Rodriguez',
      image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      likes: 187
    },
    {
      id: 3,
      title: 'The Psychology of Color: How Palettes Affect Your Audience',
      excerpt: 'An in-depth look at how color choices influence perception and emotional response to your creative work.',
      category: 'Color Theory',
      date: 'March 15, 2025',
      readTime: '10 min read',
      author: 'Morgan Peters',
      image: 'https://images.unsplash.com/photo-1550859492-d5da9d8e45f3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      likes: 312
    }
  ];

  const recentPosts = [
    {
      id: 4,
      title: 'Accessibility in Design: Creating for Everyone',
      excerpt: 'How to ensure your creative projects are accessible to all audiences without compromising aesthetics.',
      category: 'Accessibility',
      date: 'April 5, 2025',
      readTime: '7 min read',
      author: 'Jordan Lee',
      image: 'https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      likes: 98
    },
    {
      id: 5,
      title: 'From Beginner to Pro: Creative Growth with Adaptive AI',
      excerpt: 'How adaptive learning systems can help accelerate your creative skills development journey.',
      category: 'Learning',
      date: 'April 3, 2025',
      readTime: '9 min read',
      author: 'Sasha Wong',
      image: 'https://images.unsplash.com/photo-1456406644174-8ddd4cd52a06?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      likes: 156
    },
    {
      id: 6,
      title: 'Voice Preservation in the Age of AI',
      excerpt: 'Strategies for maintaining your authentic creative voice while leveraging AI enhancement tools.',
      category: 'AI Ethics',
      date: 'March 30, 2025',
      readTime: '6 min read',
      author: 'Taylor Walsh',
      image: 'https://images.unsplash.com/photo-1519791883288-dc8bd696e667?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      likes: 203
    },
    {
      id: 7,
      title: 'Creative Block? How AI Can Help You Break Through',
      excerpt: 'Using intelligent prompts and adaptive tools to overcome creative blocks and unlock new inspiration.',
      category: 'Creativity',
      date: 'March 25, 2025',
      readTime: '5 min read',
      author: 'Riley Jordan',
      image: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      likes: 145
    }
  ];

  const popularCategories = [
    { name: 'AI + Creativity', count: 24 },
    { name: 'Color Theory', count: 18 },
    { name: 'Tools & Tips', count: 32 },
    { name: 'Accessibility', count: 12 },
    { name: 'Learning', count: 16 },
    { name: 'AI Ethics', count: 9 },
    { name: 'Design Trends', count: 21 },
    { name: 'User Stories', count: 15 }
  ];

  return (
    <div className="container mx-auto py-8 px-4">
      <Helmet>
        <title>Blog | Creately</title>
        <meta name="description" content="Insights, tips, and stories about creative processes enhanced by AI" />
      </Helmet>

      {/* Hero Section */}
      <section className="mb-16">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Creately Blog</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Insights, tips, and stories about the intersection of human creativity and intelligent tools
          </p>
        </div>

        <div className="flex justify-center mb-8">
          <div className="relative w-full max-w-2xl">
            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input 
              type="search" 
              placeholder="Search articles..." 
              className="pl-10 pr-4 py-6 text-lg w-full"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-3 justify-center">
          {popularCategories.slice(0, 6).map((category) => (
            <Badge 
              key={category.name} 
              variant="outline" 
              className="px-4 py-2 text-sm cursor-pointer hover:bg-primary/10"
            >
              {category.name}
            </Badge>
          ))}
          <Badge 
            variant="outline" 
            className="px-4 py-2 text-sm cursor-pointer hover:bg-primary/10"
          >
            More...
          </Badge>
        </div>
      </section>

      {/* Featured Articles */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold mb-8">Featured Articles</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredPosts.map((post) => (
            <Card key={post.id} className="overflow-hidden h-full flex flex-col">
              <div className="aspect-video w-full overflow-hidden">
                <img 
                  src={post.image} 
                  alt={post.title} 
                  className="w-full h-full object-cover transition-transform hover:scale-105"
                />
              </div>
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary" className="font-normal">
                    {post.category}
                  </Badge>
                </div>
                <CardTitle className="text-xl hover:text-primary cursor-pointer transition-colors">
                  {post.title}
                </CardTitle>
                <CardDescription className="text-sm line-clamp-3">
                  {post.excerpt}
                </CardDescription>
              </CardHeader>
              <CardFooter className="flex justify-between items-center mt-auto pt-0">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span className="mr-3">{post.date}</span>
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{post.readTime}</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <ThumbsUp className="h-4 w-4" />
                  <span>{post.likes}</span>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      {/* Tabs for Categories */}
      <section className="mb-16">
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full md:w-auto md:inline-flex grid-cols-2 sm:grid-cols-4 md:grid-cols-none gap-2 md:gap-0 mb-8">
            <TabsTrigger value="all">All Posts</TabsTrigger>
            <TabsTrigger value="ai">AI & Creativity</TabsTrigger>
            <TabsTrigger value="tools">Tools & Tips</TabsTrigger>
            <TabsTrigger value="design">Design Insights</TabsTrigger>
          </TabsList>
          <TabsContent value="all">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {recentPosts.map((post) => (
                <div key={post.id} className="flex flex-col md:flex-row gap-4 border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="md:w-1/3 aspect-video overflow-hidden rounded-md">
                    <img 
                      src={post.image} 
                      alt={post.title} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="md:w-2/3">
                    <Badge variant="secondary" className="font-normal mb-2">
                      {post.category}
                    </Badge>
                    <h3 className="text-xl font-semibold mb-2 hover:text-primary cursor-pointer transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-muted-foreground mb-4 line-clamp-2">
                      {post.excerpt}
                    </p>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <User className="h-4 w-4" />
                        <span className="mr-3">{post.author}</span>
                        <Clock className="h-4 w-4 mr-1" />
                        <span>{post.readTime}</span>
                      </div>
                      <Button variant="link" className="p-0 h-auto font-medium">
                        Read More
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          
          {/* Placeholder content for other tabs - in a real app, these would be filtered lists */}
          <TabsContent value="ai">
            <div className="flex items-center justify-center p-12 text-muted-foreground">
              Content filtered by AI & Creativity category
            </div>
          </TabsContent>
          
          <TabsContent value="tools">
            <div className="flex items-center justify-center p-12 text-muted-foreground">
              Content filtered by Tools & Tips category
            </div>
          </TabsContent>
          
          <TabsContent value="design">
            <div className="flex items-center justify-center p-12 text-muted-foreground">
              Content filtered by Design Insights category
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-center mt-8">
          <Button variant="outline" size="lg">
            Load More Articles
          </Button>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="bg-primary/10 rounded-lg p-8 md:p-12 text-center mb-16">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">Stay Inspired</h2>
        <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
          Subscribe to our newsletter to receive the latest articles, tips, and insights about creative technology.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <Input 
            type="email" 
            placeholder="Your email address" 
            className="flex-grow"
          />
          <Button>Subscribe</Button>
        </div>
      </section>

      {/* Topics Section */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-6">Popular Topics</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {popularCategories.map((category) => (
            <div 
              key={category.name} 
              className="border rounded-lg p-4 flex justify-between items-center hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-primary" />
                <span>{category.name}</span>
              </div>
              <Badge variant="secondary">{category.count}</Badge>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default BlogPage;