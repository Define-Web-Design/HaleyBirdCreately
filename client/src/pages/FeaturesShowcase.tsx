import React from 'react';
import { Helmet } from 'react-helmet';
import ColorInspirationDigest from '@/components/features/ColorInspirationDigest';
import ColorTheoryMiniTutorials from '@/components/features/ColorTheoryMiniTutorials';
import CollaborativePaletteSharing from '@/components/features/CollaborativePaletteSharing';
import PaletteExport from '@/components/features/PaletteExport';
import EmojiReaction from '@/components/features/EmojiReaction';

const FeaturesShowcase = () => {
  return (
    <div className="container mx-auto px-4 py-6">
      <Helmet>
        <title>Features Showcase | Creately</title>
      </Helmet>
      
      <h1 className="text-2xl font-bold mb-6">New Features Showcase</h1>
      <p className="text-muted-foreground mb-8 max-w-3xl">
        Explore the latest features designed to enhance your creative workflow and color palette experience.
        These features provide powerful tools for discovery, learning, sharing, and managing your color palettes.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Grid layout for feature cards */}
        <div className="col-span-1">
          <h2 className="text-lg font-semibold mb-3">Personalized Color Inspiration</h2>
          <ColorInspirationDigest />
        </div>
        
        <div className="col-span-1">
          <h2 className="text-lg font-semibold mb-3">Color Theory Mini-Tutorials</h2>
          <ColorTheoryMiniTutorials />
        </div>
        
        <div className="col-span-1">
          <h2 className="text-lg font-semibold mb-3">Collaborative Palette Sharing</h2>
          <CollaborativePaletteSharing />
        </div>
        
        <div className="col-span-1">
          <h2 className="text-lg font-semibold mb-3">One-Click Palette Export</h2>
          <PaletteExport />
        </div>
        
        <div className="col-span-1">
          <h2 className="text-lg font-semibold mb-3">Emoji Reactions for Palettes</h2>
          <EmojiReaction />
        </div>
        
        <div className="col-span-1 flex flex-col justify-center items-center bg-muted/30 rounded-xl border border-dashed border-muted-foreground/20 p-8">
          <div className="text-4xl mb-3">✨</div>
          <h3 className="text-lg font-medium mb-2 text-center">Coming Soon</h3>
          <p className="text-sm text-center text-muted-foreground">
            More exciting features are on the way. Stay tuned for updates!
          </p>
        </div>
      </div>
      
      <div className="mt-12 p-6 bg-primary/5 rounded-lg border border-primary/10">
        <h2 className="text-xl font-semibold mb-3">Tell us what you think!</h2>
        <p className="text-muted-foreground mb-4">
          We're constantly working to improve your experience with Creately. 
          Your feedback helps us create better features tailored to your needs.
        </p>
        <div className="flex gap-4">
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
            Share Feedback
          </button>
          <button className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors">
            Request a Feature
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeaturesShowcase;