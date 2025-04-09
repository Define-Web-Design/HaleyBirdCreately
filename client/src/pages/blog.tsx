import React, { useState } from 'react';
import { Link } from 'wouter';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, Search, Tag, Clock, BookOpen } from 'lucide-react';

// Sample blog post data
const BLOG_POSTS = [
  {
    id: 1,
    title: "Navigating Creative Blocks: Strategies for Content Creators",
    excerpt: "Discover effective strategies to overcome creative blocks and maintain a consistent content creation rhythm. Learn how to leverage AI assistance without compromising your unique creative voice.",
    category: "Creativity",
    author: {
      name: "Alex Morgan",
      avatar: "AM",
    },
    date: "April 5, 2025",
    readTime: "8 min read",
    featured: true,
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80",
    tags: ["creativity", "productivity", "content-creation"]
  },
  {
    id: 2,
    title: "Color Theory for Digital Creators: Beyond the Basics",
    excerpt: "Dive deep into advanced color theory concepts that can elevate your digital creations. Learn how to extract meaningful color palettes from your surroundings and apply them effectively.",
    category: "Design",
    author: {
      name: "Priya Sharma",
      avatar: "PS",
    },
    date: "March 29, 2025",
    readTime: "12 min read",
    featured: false,
    image: "https://images.unsplash.com/photo-1579547945413-497e1b99dac0?w=800&q=80",
    tags: ["design", "color-theory", "digital-art"]
  },
  {
    id: 3,
    title: "The Future of Creative AI: Collaboration Not Replacement",
    excerpt: "How artificial intelligence is transforming the creative landscape, and why it's an opportunity for collaboration rather than a threat to human creativity.",
    category: "Technology",
    author: {
      name: "Jordan Lee",
      avatar: "JL",
    },
    date: "March 25, 2025",
    readTime: "10 min read",
    featured: true,
    image: "https://images.unsplash.com/photo-1676097316986-ecd5418bf42d?w=800&q=80",
    tags: ["ai", "future-of-creativity", "technology"]
  },
  {
    id: 4,
    title: "Cross-Platform Content Strategies That Work",
    excerpt: "Learn how to adapt your content for different platforms while maintaining brand consistency and maximizing audience engagement across channels.",
    category: "Marketing",
    author: {
      name: "Taylor Williams",
      avatar: "TW",
    },
    date: "March 18, 2025",
    readTime: "9 min read",
    featured: false,
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80",
    tags: ["marketing", "cross-platform", "content-strategy"]
  },
  {
    id: 5,
    title: "Ethical Considerations in AI-Enhanced Content Creation",
    excerpt: "Explore the ethical dimensions of using AI in creative work, from copyright concerns to transparency with your audience.",
    category: "Ethics",
    author: {
      name: "Cameron Robinson",
      avatar: "CR",
    },
    date: "March 12, 2025",
    readTime: "15 min read",
    featured: false,
    image: "https://images.unsplash.com/photo-1546938576-6e6a64f317cc?w=800&q=80",
    tags: ["ethics", "ai", "creativity"]
  },
  {
    id: 6,
    title: "The Science of Creativity: What Brain Research Tells Us",
    excerpt: "Recent neuroscience findings on creativity and how you can apply these insights to enhance your creative process and output.",
    category: "Science",
    author: {
      name: "Dr. Olivia Chen",
      avatar: "OC",
    },
    date: "March 8, 2025",
    readTime: "11 min read",
    featured: false,
    image: "https://images.unsplash.com/photo-1493612276216-ee3925520721?w=800&q=80",
    tags: ["science", "neuroscience", "creativity"]
  }
];

// Sample categories
const CATEGORIES = [
  "All",
  "Creativity",
  "Design",
  "Technology",
  "Marketing",
  "Ethics",
  "Science",
  "Tutorials"
];

const Blog = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Filter posts based on search query and selected category
  const filteredPosts = BLOG_POSTS.filter(post => {
    const matchesSearch = searchQuery === '' || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });
  
  // Featured posts
  const featuredPosts = BLOG_POSTS.filter(post => post.featured);

  return (
    <div className="container mx-auto px-4 py-12">
      <header className="mb-12">
        <h1 className="text-4xl font-bold mb-4">Creately Blog</h1>
        <p className="text-xl text-muted-foreground max-w-3xl">
          Insights, tutorials, and inspiration for creative professionals and content creators.
        </p>
      </header>

      {/* Featured Posts */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-6">Featured Articles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {featuredPosts.map(post => (
            <Card key={post.id} className="overflow-hidden">
              <div className="aspect-video overflow-hidden">
                <img 
                  src={post.image} 
                  alt={post.title} 
                  className="object-cover w-full h-full transition-transform hover:scale-105 duration-300"
                />
              </div>
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline">{post.category}</Badge>
                  <span className="text-xs text-muted-foreground">{post.date}</span>
                </div>
                <CardTitle className="text-xl font-bold hover:text-primary transition-colors">
                  <Link href={`/blog/${post.id}`}>{post.title}</Link>
                </CardTitle>
                <CardDescription className="line-clamp-2">{post.excerpt}</CardDescription>
              </CardHeader>
              <CardFooter className="flex justify-between items-center pt-0">
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback>{post.author.avatar}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{post.author.name}</span>
                </div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <Clock className="h-3 w-3 mr-1" />
                  {post.readTime}
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      {/* Search and Filter */}
      <section className="mb-8">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative w-full md:w-1/3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search articles..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="w-full md:w-2/3">
            <Tabs defaultValue="All" onValueChange={setSelectedCategory}>
              <TabsList className="w-full h-auto flex flex-wrap">
                {CATEGORIES.map(category => (
                  <TabsTrigger 
                    key={category} 
                    value={category}
                    className="flex-grow flex-shrink-0 md:flex-grow-0"
                  >
                    {category}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </div>
      </section>

      {/* All Articles */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">All Articles</h2>
          <div className="text-sm text-muted-foreground">
            Showing {filteredPosts.length} of {BLOG_POSTS.length} articles
          </div>
        </div>

        {filteredPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map(post => (
              <Card key={post.id}>
                <div className="aspect-video overflow-hidden">
                  <img 
                    src={post.image} 
                    alt={post.title} 
                    className="object-cover w-full h-full transition-transform hover:scale-105 duration-300"
                  />
                </div>
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">{post.category}</Badge>
                    <span className="text-xs text-muted-foreground">{post.date}</span>
                  </div>
                  <CardTitle className="text-lg hover:text-primary transition-colors line-clamp-2">
                    <Link href={`/blog/${post.id}`}>{post.title}</Link>
                  </CardTitle>
                  <CardDescription className="line-clamp-2 text-sm">{post.excerpt}</CardDescription>
                </CardHeader>
                <CardFooter className="flex justify-between items-center pt-0">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback>{post.author.avatar}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{post.author.name}</span>
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Clock className="h-3 w-3 mr-1" />
                    {post.readTime}
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border rounded-md">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No articles found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filter to find what you're looking for.
            </p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
            >
              Clear filters
            </Button>
          </div>
        )}

        {/* Load More Button */}
        {filteredPosts.length > 6 && (
          <div className="text-center mt-10">
            <Button variant="outline">Load More Articles</Button>
          </div>
        )}
      </section>

      {/* Newsletter Signup */}
      <section className="mt-20 bg-primary/5 rounded-xl p-8">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-3">Subscribe to Our Newsletter</h2>
          <p className="text-muted-foreground mb-6">
            Get the latest articles, tutorials, and creative inspiration delivered straight to your inbox.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Input placeholder="Enter your email" className="sm:flex-1" />
            <Button>Subscribe</Button>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </div>
      </section>

      {/* Popular Tags */}
      <section className="mt-16">
        <h2 className="text-2xl font-bold mb-6">Popular Topics</h2>
        <div className="flex flex-wrap gap-2">
          {Array.from(new Set(BLOG_POSTS.flatMap(post => post.tags))).map(tag => (
            <Button 
              key={tag} 
              variant="outline" 
              className="flex items-center gap-1"
              onClick={() => setSearchQuery(tag)}
            >
              <Tag className="h-3.5 w-3.5" />
              {tag.replace('-', ' ')}
            </Button>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Blog;