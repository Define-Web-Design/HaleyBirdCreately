import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { 
  Brush, 
  Calendar, 
  Camera, 
  Code, 
  Heart, 
  Laugh, 
  Lightbulb, 
  Palette, 
  Sparkles, 
  Users, 
  Zap 
} from 'lucide-react';

const AboutPage = () => {
  // Team members data
  const teamMembers = [
    {
      name: 'Alex Chen',
      role: 'Founder & CEO',
      bio: 'Creative visionary with a passion for building tools that empower creativity.',
      image: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
    },
    {
      name: 'Jamie Rodriguez',
      role: 'Chief Product Officer',
      bio: 'Designer turned product strategist who believes in creativity as a force for good.',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
    },
    {
      name: 'Morgan Peters',
      role: 'CTO',
      bio: 'Tech innovator focused on building AI systems that enhance human creativity.',
      image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
    },
    {
      name: 'Taylor Walsh',
      role: 'VP of Design',
      bio: 'Passionate about creating intuitive, beautiful interfaces that inspire creativity.',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
    }
  ];

  // Company values data
  const companyValues = [
    {
      icon: <Sparkles className="h-8 w-8 text-primary" />,
      title: 'Creative Symbiosis',
      description: 'We believe in the power of human creativity working in harmony with intelligent tools.'
    },
    {
      icon: <Heart className="h-8 w-8 text-primary" />,
      title: 'Authentic Expression',
      description: 'We preserve and enhance the unique voice of each creator without replacing their style or vision.'
    },
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: 'Inclusive Accessibility',
      description: 'We make advanced creative tools accessible to everyone, regardless of skill level or background.'
    },
    {
      icon: <Lightbulb className="h-8 w-8 text-primary" />,
      title: 'Continuous Evolution',
      description: 'We embrace learning and growth in our platform, just as we encourage it in our users.'
    },
    {
      icon: <Laugh className="h-8 w-8 text-primary" />,
      title: 'Joyful Experience',
      description: 'We believe creative tools should be as delightful to use as the results they help produce.'
    },
    {
      icon: <Zap className="h-8 w-8 text-primary" />,
      title: 'Empowerment',
      description: 'We design every feature to make users feel more capable and inspired in their creative work.'
    }
  ];

  // Timeline data
  const timeline = [
    {
      year: '2023',
      title: 'Concept Development',
      description: 'Creately was conceived as a response to the growing disconnect between AI tools and human creativity.'
    },
    {
      year: '2024',
      title: 'Initial Platform Launch',
      description: 'Our first beta version focused on color tools and basic creative symbiosis features.'
    },
    {
      year: '2024',
      title: 'AI Enhancement Integration',
      description: 'We introduced adaptive learning systems that gauge user skill levels and preferences.'
    },
    {
      year: '2025',
      title: 'Creative Symbiosis Platform',
      description: 'Full launch of the comprehensive platform with camera roll integration and content vault.'
    },
    {
      year: '2025',
      title: 'Team Collaboration Features',
      description: 'Introduction of collaborative tools for creative teams and organizations.'
    }
  ];

  return (
    <div className="container mx-auto py-8 px-4">
      <Helmet>
        <title>About | Creately</title>
        <meta name="description" content="Learn about the team and vision behind Creately's creative platform" />
      </Helmet>

      {/* Hero Section */}
      <section className="text-center mb-20">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">About Creately</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
          We're building the future of creative tools that enhance rather than replace human creativity.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button size="lg" className="gap-2">
            <Users className="h-4 w-4" />
            Join Our Team
          </Button>
          <Button size="lg" variant="outline" className="gap-2">
            <Calendar className="h-4 w-4" />
            Our Story
          </Button>
        </div>
      </section>

      {/* Mission Section */}
      <section className="mb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
            <div className="space-y-4 text-lg">
              <p>
                Creately was founded on a simple yet powerful belief: the future of creativity lies in the symbiotic relationship between human imagination and intelligent tools.
              </p>
              <p>
                We're building a platform that doesn't just generate content, but helps you discover and amplify your authentic creative voice through personalized, adaptive tools that grow with you.
              </p>
              <p>
                By making advanced creative technology accessible to everyone through our freemium model, we're democratizing creativity and helping people at all skill levels express themselves in powerful new ways.
              </p>
            </div>
          </div>
          <div className="bg-muted/30 p-8 rounded-lg">
            <div className="flex flex-col space-y-6">
              <div className="flex gap-4 items-start">
                <div className="bg-primary/10 p-3 rounded-full">
                  <Brush className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Creative Symbiosis</h3>
                  <p className="text-muted-foreground">
                    We enhance human creativity rather than replacing it, creating a seamless partnership between your vision and our intelligent tools.
                  </p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="bg-primary/10 p-3 rounded-full">
                  <Camera className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Authentic Content</h3>
                  <p className="text-muted-foreground">
                    We help you repurpose your existing content while preserving your unique voice, style, and creative perspective.
                  </p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="bg-primary/10 p-3 rounded-full">
                  <Palette className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Universal Access</h3>
                  <p className="text-muted-foreground">
                    We make advanced creative tools accessible to everyone with different paths to the same powerful features.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="mb-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Our Values</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            These core principles guide everything we do at Creately
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {companyValues.map((value, index) => (
            <div key={index} className="bg-muted/20 p-6 rounded-lg hover:bg-muted/30 transition-colors">
              <div className="mb-4">{value.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
              <p className="text-muted-foreground">{value.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Team Section */}
      <section className="mb-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Meet Our Team</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            The passionate people behind Creately's vision and technology
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {teamMembers.map((member, index) => (
            <div key={index} className="text-center">
              <div className="mb-4 aspect-square overflow-hidden rounded-full mx-auto" style={{ maxWidth: '180px' }}>
                <img 
                  src={member.image} 
                  alt={member.name} 
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
              <p className="text-primary font-medium mb-2">{member.role}</p>
              <p className="text-muted-foreground">{member.bio}</p>
            </div>
          ))}
        </div>
        <div className="text-center mt-10">
          <Button variant="outline">View Full Team</Button>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="mb-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Our Journey</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            The evolution of Creately from concept to creative platform
          </p>
        </div>
        <div className="relative">
          <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-border"></div>
          <div className="space-y-12">
            {timeline.map((item, index) => (
              <div 
                key={index} 
                className={`relative flex ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-center`}
              >
                <div className="hidden md:block w-1/2"></div>
                <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-4 md:translate-y-0 bg-background border-4 border-primary rounded-full h-8 w-8 z-10"></div>
                <div className="md:w-1/2 bg-muted/20 p-6 rounded-lg relative">
                  <span className="text-primary font-semibold">{item.year}</span>
                  <h3 className="text-xl font-semibold mt-1 mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technologies Section */}
      <section className="mb-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Our Technology</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Cutting-edge solutions powering our creative symbiosis platform
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex gap-4 items-start border p-6 rounded-lg">
            <div className="bg-primary/10 p-3 rounded-full">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Adaptive AI Learning</h3>
              <p className="text-muted-foreground">
                Our AI system learns from your interactions and adjusts to your skill level, providing a personalized experience that grows with you.
              </p>
            </div>
          </div>
          <div className="flex gap-4 items-start border p-6 rounded-lg">
            <div className="bg-primary/10 p-3 rounded-full">
              <Code className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Style Preservation</h3>
              <p className="text-muted-foreground">
                Our algorithms analyze and preserve your unique creative style, ensuring that AI enhancements amplify rather than overwrite your voice.
              </p>
            </div>
          </div>
          <div className="flex gap-4 items-start border p-6 rounded-lg">
            <div className="bg-primary/10 p-3 rounded-full">
              <Palette className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Advanced Color Analysis</h3>
              <p className="text-muted-foreground">
                Sophisticated algorithms for extracting, analyzing, and generating color palettes that complement your creative vision.
              </p>
            </div>
          </div>
          <div className="flex gap-4 items-start border p-6 rounded-lg">
            <div className="bg-primary/10 p-3 rounded-full">
              <Camera className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Content Integration</h3>
              <p className="text-muted-foreground">
                Seamless connections to your existing content sources, including camera roll, cloud storage, and social platforms.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center bg-primary/10 py-16 px-4 rounded-lg">
        <h2 className="text-3xl font-bold mb-4">Join Our Creative Community</h2>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
          Be part of the creative symbiosis revolution and discover what your creativity can achieve with the right tools.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button size="lg" className="gap-2">
            <Sparkles className="h-4 w-4" />
            Get Started Free
          </Button>
          <Button size="lg" variant="outline" className="gap-2">
            <Users className="h-4 w-4" />
            Contact Us
          </Button>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;