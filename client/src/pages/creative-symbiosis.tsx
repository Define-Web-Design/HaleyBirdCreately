import CreativeSymbiosisSection from '@/components/dashboard/CreativeSymbiosis';

export default function CreativeSymbiosisPage() {
  return (
    <div className="container py-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold">Creative Symbiosis</h1>
      </div>
      
      <CreativeSymbiosisSection />
    </div>
  );
}