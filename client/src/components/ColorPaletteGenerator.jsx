import React, { useState } from 'react';
import axios from 'axios';
import { Button, Input, Card, Badge } from '@/components/ui';
import { Loader2, Palette, AlertCircle } from 'lucide-react';

/**
 * ColorPaletteGenerator component
 * 
 * A React component that allows users to generate color palettes based on mood or description
 * using AI.
 */
const ColorPaletteGenerator = () => {
  const [description, setDescription] = useState('');
  const [colors, setColors] = useState(5);
  const [palette, setPalette] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Handle form submission to generate a palette
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('/api/colors/generate-palette', {
        description: description.trim(),
        colors: Number(colors)
      });

      setPalette(response.data);
    } catch (err) {
      console.error('Error generating palette:', err);
      setError(err.response?.data?.message || 'Failed to generate color palette.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Copy a color to clipboard
   */
  const copyToClipboard = (hex) => {
    navigator.clipboard.writeText(hex)
      .then(() => {
        // Could show a notification here
        console.log('Copied to clipboard:', hex);
      })
      .catch(err => {
        console.error('Failed to copy:', err);
      });
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">AI Color Palette Generator</h2>
      
      <Card className="p-6 mb-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1">
              Describe your mood or style
            </label>
            <Input
              id="description"
              placeholder="e.g., calming and peaceful, energetic and vibrant, professional and trustworthy"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full"
              required
            />
          </div>
          
          <div>
            <label htmlFor="colors" className="block text-sm font-medium mb-1">
              Number of colors
            </label>
            <Input
              id="colors"
              type="number"
              min="3"
              max="10"
              value={colors}
              onChange={(e) => setColors(e.target.value)}
              className="w-32"
            />
          </div>
          
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Palette className="mr-2 h-4 w-4" />
                Generate Palette
              </>
            )}
          </Button>
        </form>
      </Card>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 mb-6 flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 text-red-600" />
          <p>{error}</p>
        </div>
      )}
      
      {palette && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold">{palette.theme}</h3>
          <p className="text-gray-600">{palette.description}</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {palette.colors.map((color, index) => (
              <div 
                key={index}
                className="rounded-md overflow-hidden shadow-md cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => copyToClipboard(color.hex)}
              >
                <div 
                  className="h-24 w-full" 
                  style={{ backgroundColor: color.hex }}
                ></div>
                <div className="p-3 bg-white dark:bg-gray-800">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{color.name}</span>
                    <Badge>{color.role}</Badge>
                  </div>
                  <code className="text-sm mt-1 block">{color.hex}</code>
                </div>
              </div>
            ))}
          </div>
          
          <p className="text-sm text-gray-500 mt-4">
            Click on a color to copy its hex code to clipboard. Generated with AI.
          </p>
        </div>
      )}
    </div>
  );
};

export default ColorPaletteGenerator;