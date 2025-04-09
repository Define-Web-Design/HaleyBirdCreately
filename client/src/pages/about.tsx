import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  Check, 
  Heart, 
  Lightbulb, 
  MessageSquare, 
  Shield, 
  Sparkles, 
  Users,
  ArrowRight
} from 'lucide-react';

const About = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <header className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-4">About Creately</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          We're building tools that empower creators to unlock their full potential
          and transform how content is created, organized, and shared.
        </p>
      </header>

      {/* Mission Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-20">
        <div>
          <div className="inline-block bg-primary/10 p-2 rounded-lg mb-4">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
          <p className="text-muted-foreground mb-6">
            At Creately, we're on a mission to democratize creativity by building intelligent tools 
            that amplify human creativity rather than replace it. We believe that everyone has unique 
            creative perspectives that deserve to be shared with the world.
          </p>
          <p className="text-muted-foreground mb-6">
            We're committed to developing technology that helps creators overcome technical barriers, 
            streamline their workflows, and focus on what truly matters: their creative vision.
          </p>
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <Check className="h-5 w-5 text-primary mt-0.5" />
              <p>Empowering creativity with intelligent tools</p>
            </div>
            <div className="flex items-start gap-2">
              <Check className="h-5 w-5 text-primary mt-0.5" />
              <p>Supporting creators of all skill levels</p>
            </div>
            <div className="flex items-start gap-2">
              <Check className="h-5 w-5 text-primary mt-0.5" />
              <p>Respecting intellectual property and creative ownership</p>
            </div>
          </div>
        </div>
        <div className="bg-muted/30 rounded-xl h-80 flex items-center justify-center">
          <div className="text-center">
            <Lightbulb className="h-12 w-12 text-primary mx-auto mb-4" />
            <p className="text-lg font-medium">Illuminating Creative Potential</p>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="mb-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Our Values</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            These core principles guide everything we do, from product development to customer interactions.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="border border-primary/10">
            <CardContent className="pt-6">
              <div className="bg-primary/10 rounded-full p-3 w-12 h-12 flex items-center justify-center mb-4">
                <Heart className="text-primary h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Creativity First</h3>
              <p className="text-muted-foreground">
                We believe in the transformative power of human creativity and build tools that enhance rather than replace it.
              </p>
            </CardContent>
          </Card>

          <Card className="border border-primary/10">
            <CardContent className="pt-6">
              <div className="bg-primary/10 rounded-full p-3 w-12 h-12 flex items-center justify-center mb-4">
                <Shield className="text-primary h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Trust & Integrity</h3>
              <p className="text-muted-foreground">
                We're committed to ethical AI practices, transparent data usage, and protecting our users' creative ownership.
              </p>
            </CardContent>
          </Card>

          <Card className="border border-primary/10">
            <CardContent className="pt-6">
              <div className="bg-primary/10 rounded-full p-3 w-12 h-12 flex items-center justify-center mb-4">
                <Users className="text-primary h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Inclusive Design</h3>
              <p className="text-muted-foreground">
                We design our products to be accessible and valuable to creators of all backgrounds, skill levels, and disciplines.
              </p>
            </CardContent>
          </Card>

          <Card className="border border-primary/10">
            <CardContent className="pt-6">
              <div className="bg-primary/10 rounded-full p-3 w-12 h-12 flex items-center justify-center mb-4">
                <Sparkles className="text-primary h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Continuous Innovation</h3>
              <p className="text-muted-foreground">
                We're constantly exploring new technologies and approaches to solve creative challenges in novel ways.
              </p>
            </CardContent>
          </Card>

          <Card className="border border-primary/10">
            <CardContent className="pt-6">
              <div className="bg-primary/10 rounded-full p-3 w-12 h-12 flex items-center justify-center mb-4">
                <MessageSquare className="text-primary h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Community Driven</h3>
              <p className="text-muted-foreground">
                We listen to our users and build features that address real needs in the creative community.
              </p>
            </CardContent>
          </Card>
          
          <Card className="border border-primary/10">
            <CardContent className="pt-6">
              <div className="bg-primary/10 rounded-full p-3 w-12 h-12 flex items-center justify-center mb-4">
                <Lightbulb className="text-primary h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Educational Empowerment</h3>
              <p className="text-muted-foreground">
                We're committed to helping creators learn and grow through intuitive tools and educational resources.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Story Section */}
      <section className="mb-20">
        <div className="bg-primary/5 rounded-xl p-8 md:p-12">
          <h2 className="text-3xl font-bold mb-6">Our Story</h2>
          <div className="space-y-6">
            <p className="text-muted-foreground">
              Creately began in 2023 when a group of designers, developers, and AI researchers came together with a shared 
              frustration: creative tools were either too complex for beginners or too limiting for professionals, and the 
              emerging AI tools threatened to replace human creativity rather than enhance it.
            </p>
            <p className="text-muted-foreground">
              We set out to build something different—tools that respect the human creative process while leveraging AI to 
              remove technical barriers and tedious tasks. We wanted to create a platform where technology amplifies creative 
              vision rather than dictating it.
            </p>
            <p className="text-muted-foreground">
              Today, Creately is used by thousands of creative professionals, content creators, and businesses around the world. 
              We're proud of how far we've come, but even more excited about the creative future we're building together with our users.
            </p>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="mb-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Meet Our Team</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            We're a diverse group of designers, developers, researchers, and creators passionate about building tools that empower creativity.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[
            { name: "Alex Kim", role: "Founder & CEO", avatar: "AK" },
            { name: "Maya Patel", role: "Chief Design Officer", avatar: "MP" },
            { name: "James Wilson", role: "Head of AI Research", avatar: "JW" },
            { name: "Zoe Chen", role: "Lead Engineer", avatar: "ZC" },
            { name: "Nico Rodriguez", role: "Product Manager", avatar: "NR" },
            { name: "Aisha Johnson", role: "UX Designer", avatar: "AJ" },
            { name: "Tyler Brooks", role: "AI Developer", avatar: "TB" },
            { name: "Sophia Kim", role: "Community Lead", avatar: "SK" }
          ].map((member, index) => (
            <div key={index} className="text-center p-6 border rounded-lg">
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-semibold text-primary">{member.avatar}</span>
              </div>
              <h3 className="font-semibold text-lg">{member.name}</h3>
              <p className="text-sm text-muted-foreground">{member.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Join Us Section */}
      <section>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-primary/5 rounded-xl overflow-hidden">
          <div className="p-8 md:p-12 flex flex-col justify-center">
            <h2 className="text-3xl font-bold mb-4">Join Our Team</h2>
            <p className="text-muted-foreground mb-6">
              We're always looking for passionate, talented individuals to help us build the future of creative tools. 
              Check out our open positions and become part of our mission.
            </p>
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-primary" />
                <span>Flexible remote work options</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-primary" />
                <span>Competitive compensation and benefits</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-primary" />
                <span>Collaborative and inclusive culture</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-primary" />
                <span>Opportunities for growth and learning</span>
              </div>
            </div>
            <Button className="w-fit">
              <span>View Careers</span>
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          <div className="bg-muted hidden md:flex items-center justify-center">
            <div className="text-center">
              <Users className="h-16 w-16 text-primary/40 mx-auto mb-4" />
              <p className="text-lg font-medium text-muted-foreground">Be Part of Our Story</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="mt-20">
        <Separator className="mb-12" />
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Get in Touch</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            Have questions, feedback, or just want to say hello? We'd love to hear from you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button>Contact Us</Button>
            <Button variant="outline">support@creately.com</Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;