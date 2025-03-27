import CreativeSymbiosisSection from '@/components/dashboard/CreativeSymbiosis';
import AICapabilities from '@/components/dashboard/AICapabilities';
import { Separator } from '@/components/ui/separator';

export default function CreativeSymbiosisPage() {
  return (
    <div className="container py-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold">Creative Symbiosis</h1>
      </div>
      
      <CreativeSymbiosisSection />
      
      <Separator className="my-8" />
      
      <AICapabilities />
    </div>
  );
}