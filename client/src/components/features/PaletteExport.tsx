import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Download, 
  FileImage, 
  File, 
  FileText, 
  Layers, 
  Check,
  Copy,
  Grid,
  List,
  CheckSquare
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface ColorPalette {
  id: number;
  name: string;
  colors: string[];
  description?: string;
}

interface ExportPreset {
  id: string;
  name: string;
  format: 'pdf' | 'png' | 'jpg' | 'svg' | 'json' | 'css' | 'scss';
  layout: 'grid' | 'horizontal' | 'vertical';
  quality?: 'standard' | 'high' | 'ultra';
  showHexCodes?: boolean;
  showRgbValues?: boolean;
  includeMetadata?: boolean;
}

const PaletteExport = () => {
  const [selectedFormat, setSelectedFormat] = useState<'pdf' | 'png' | 'jpg' | 'svg' | 'json' | 'css' | 'scss'>('pdf');
  const [selectedLayout, setSelectedLayout] = useState<'grid' | 'horizontal' | 'vertical'>('horizontal');
  const [imageQuality, setImageQuality] = useState<'standard' | 'high' | 'ultra'>('high');
  const [showHexCodes, setShowHexCodes] = useState(true);
  const [showRgbValues, setShowRgbValues] = useState(false);
  const [includeMetadata, setIncludeMetadata] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Example palette to export
  const palette: ColorPalette = {
    id: 123,
    name: "Forest Tranquility",
    colors: ["#2D3A3A", "#3E5641", "#57A773", "#8ECF9B", "#CDE77F"],
    description: "A calming palette inspired by lush forests and natural landscapes."
  };

  // Export presets
  const presets: ExportPreset[] = [
    {
      id: 'design-handoff',
      name: 'Design Handoff',
      format: 'pdf',
      layout: 'grid',
      quality: 'high',
      showHexCodes: true,
      showRgbValues: true,
      includeMetadata: true
    },
    {
      id: 'social-share',
      name: 'Social Share',
      format: 'png',
      layout: 'horizontal',
      quality: 'high',
      showHexCodes: true,
      showRgbValues: false,
      includeMetadata: false
    },
    {
      id: 'developer-export',
      name: 'Developer Export',
      format: 'json',
      layout: 'vertical',
      showHexCodes: true,
      showRgbValues: true,
      includeMetadata: true
    }
  ];

  const handleExport = () => {
    setExporting(true);
    // Simulate export process
    setTimeout(() => {
      setExporting(false);
      // In a real app, this would trigger a file download
      console.log('Exported palette in format:', selectedFormat);
    }, 1500);
  };

  const handlePresetSelect = (presetId: string) => {
    const preset = presets.find(p => p.id === presetId);
    if (preset) {
      setSelectedFormat(preset.format);
      setSelectedLayout(preset.layout);
      if (preset.quality) setImageQuality(preset.quality);
      if (preset.showHexCodes !== undefined) setShowHexCodes(preset.showHexCodes);
      if (preset.showRgbValues !== undefined) setShowRgbValues(preset.showRgbValues);
      if (preset.includeMetadata !== undefined) setIncludeMetadata(preset.includeMetadata);
    }
  };

  const handleCopyColors = () => {
    const colorText = palette.colors.join('\n');
    navigator.clipboard.writeText(colorText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'pdf': return <File className="h-4 w-4" />;
      case 'png': 
      case 'jpg':
      case 'svg': return <FileImage className="h-4 w-4" />;
      case 'json':
      case 'css':
      case 'scss': return <FileText className="h-4 w-4" />;
      default: return <Download className="h-4 w-4" />;
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">One-Click Export</CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0"
                  onClick={handleCopyColors}
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Copy all colors</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <CardDescription className="text-xs text-muted-foreground">
          Export your palette in various formats with one click
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-4 pt-2">
        <div className="space-y-4">
          {/* Palette preview */}
          <div className="mb-3">
            <Label className="text-xs text-muted-foreground mb-1 block">Current Palette</Label>
            <div className="flex rounded-md overflow-hidden">
              {palette.colors.map((color, index) => (
                <div 
                  key={index} 
                  className="h-8 flex-1 relative group"
                  style={{ backgroundColor: color }}
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-black/50 flex items-center justify-center transition-opacity">
                    <span className="text-white text-xs font-mono">{color}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Quick export presets */}
          <div>
            <Label className="text-xs text-muted-foreground mb-1 block">Export Presets</Label>
            <div className="grid grid-cols-3 gap-2">
              {presets.map((preset) => (
                <Button
                  key={preset.id}
                  variant="outline"
                  size="sm"
                  className="h-auto py-1.5 text-xs flex flex-col items-center"
                  onClick={() => handlePresetSelect(preset.id)}
                >
                  {getFormatIcon(preset.format)}
                  <span className="mt-1">{preset.name}</span>
                </Button>
              ))}
            </div>
          </div>
          
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="options">
              <AccordionTrigger className="text-sm py-2">Advanced Options</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3">
                  {/* Format Selection */}
                  <div>
                    <Label htmlFor="export-format" className="text-xs block mb-1">Format</Label>
                    <Select value={selectedFormat} onValueChange={(value: any) => setSelectedFormat(value)}>
                      <SelectTrigger id="export-format" className="h-8 text-xs">
                        <SelectValue placeholder="Select format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pdf">PDF Document</SelectItem>
                        <SelectItem value="png">PNG Image</SelectItem>
                        <SelectItem value="jpg">JPG Image</SelectItem>
                        <SelectItem value="svg">SVG Vector</SelectItem>
                        <SelectItem value="json">JSON Data</SelectItem>
                        <SelectItem value="css">CSS Variables</SelectItem>
                        <SelectItem value="scss">SCSS Variables</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Layout Selection */}
                  <div>
                    <Label className="text-xs block mb-1">Layout</Label>
                    <ToggleGroup 
                      type="single" 
                      value={selectedLayout}
                      onValueChange={(value: any) => value && setSelectedLayout(value)}
                      className="justify-start"
                    >
                      <ToggleGroupItem value="horizontal" aria-label="Horizontal layout" className="h-8 w-8">
                        <List className="h-4 w-4" />
                      </ToggleGroupItem>
                      <ToggleGroupItem value="vertical" aria-label="Vertical layout" className="h-8 w-8 rotate-90">
                        <List className="h-4 w-4" />
                      </ToggleGroupItem>
                      <ToggleGroupItem value="grid" aria-label="Grid layout" className="h-8 w-8">
                        <Grid className="h-4 w-4" />
                      </ToggleGroupItem>
                    </ToggleGroup>
                  </div>

                  {/* Only show quality option for image formats */}
                  {['png', 'jpg'].includes(selectedFormat) && (
                    <div>
                      <Label className="text-xs block mb-1">Quality</Label>
                      <RadioGroup 
                        value={imageQuality} 
                        onValueChange={(value: any) => setImageQuality(value)}
                        className="flex gap-4"
                      >
                        <div className="flex items-center space-x-1">
                          <RadioGroupItem value="standard" id="quality-standard" className="h-3 w-3" />
                          <Label htmlFor="quality-standard" className="text-xs">Standard</Label>
                        </div>
                        <div className="flex items-center space-x-1">
                          <RadioGroupItem value="high" id="quality-high" className="h-3 w-3" />
                          <Label htmlFor="quality-high" className="text-xs">High</Label>
                        </div>
                        <div className="flex items-center space-x-1">
                          <RadioGroupItem value="ultra" id="quality-ultra" className="h-3 w-3" />
                          <Label htmlFor="quality-ultra" className="text-xs">Ultra</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  )}

                  {/* Options */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 flex items-center justify-center" onClick={() => setShowHexCodes(!showHexCodes)}>
                        {showHexCodes ? <CheckSquare className="h-4 w-4 text-primary" /> : <div className="h-4 w-4 border rounded-sm" />}
                      </div>
                      <Label className="text-xs cursor-pointer" onClick={() => setShowHexCodes(!showHexCodes)}>
                        Include HEX Codes
                      </Label>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 flex items-center justify-center" onClick={() => setShowRgbValues(!showRgbValues)}>
                        {showRgbValues ? <CheckSquare className="h-4 w-4 text-primary" /> : <div className="h-4 w-4 border rounded-sm" />}
                      </div>
                      <Label className="text-xs cursor-pointer" onClick={() => setShowRgbValues(!showRgbValues)}>
                        Include RGB Values
                      </Label>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 flex items-center justify-center" onClick={() => setIncludeMetadata(!includeMetadata)}>
                        {includeMetadata ? <CheckSquare className="h-4 w-4 text-primary" /> : <div className="h-4 w-4 border rounded-sm" />}
                      </div>
                      <Label className="text-xs cursor-pointer" onClick={() => setIncludeMetadata(!includeMetadata)}>
                        Include Palette Metadata
                      </Label>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </CardContent>
      
      <CardFooter className="p-3 pt-0 flex justify-center">
        <Button 
          onClick={handleExport} 
          disabled={exporting}
          className="w-full gap-1.5"
          size="sm"
        >
          {exporting ? (
            <>
              <div className="h-3.5 w-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="h-3.5 w-3.5" />
              Export as {selectedFormat.toUpperCase()}
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PaletteExport;