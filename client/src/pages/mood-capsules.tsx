import React, { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import MoodCapsulesList from '@/components/mood-capsules/MoodCapsulesList';
import MoodCapsuleForm from '@/components/mood-capsules/MoodCapsuleForm';
import MoodCapsuleDetail from '@/components/mood-capsules/MoodCapsuleDetail';
import type { MoodCapsule } from '@/lib/types';
import { Card } from '@/components/ui/card';

const MoodCapsulesPage: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedCapsule, setSelectedCapsule] = useState<MoodCapsule | undefined>(undefined);
  const [selectedCapsuleId, setSelectedCapsuleId] = useState<number | undefined>(undefined);
  
  // Handle opening the form for a new capsule
  const handleCreateCapsule = () => {
    setSelectedCapsule(undefined);
    setIsFormOpen(true);
  };
  
  // Handle opening the form for editing an existing capsule
  const handleEditCapsule = (capsule: MoodCapsule) => {
    setSelectedCapsule(capsule);
    setIsFormOpen(true);
    setIsDetailOpen(false); // Close detail view if it's open
  };
  
  // Handle viewing capsule details
  const handleViewCapsule = (capsule: MoodCapsule) => {
    setSelectedCapsuleId(capsule.id);
    setIsDetailOpen(true);
  };
  
  // Handle closing the form
  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedCapsule(undefined);
  };
  
  // Handle success (submit) in the form
  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setSelectedCapsule(undefined);
  };
  
  // Handle closing the detail view
  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    setSelectedCapsuleId(undefined);
  };
  
  return (
    <div className="container py-6 max-w-7xl mx-auto">
      <PageHeader
        heading="Mood Capsules"
        description="Group your content by emotional tone to create cohesive mood stories"
        rightSection={!isFormOpen ? null : undefined}
      />
      
      {isFormOpen ? (
        <Card className="mt-6">
          <MoodCapsuleForm
            capsule={selectedCapsule}
            onCancel={handleCloseForm}
            onSuccess={handleFormSuccess}
          />
        </Card>
      ) : (
        <div className="mt-6">
          <MoodCapsulesList
            onCreateCapsule={handleCreateCapsule}
            onEditCapsule={handleEditCapsule}
            onViewCapsule={handleViewCapsule}
          />
        </div>
      )}
      
      {/* Detail view dialog/sheet */}
      {selectedCapsuleId && (
        <MoodCapsuleDetail
          capsuleId={selectedCapsuleId}
          isOpen={isDetailOpen}
          onClose={handleCloseDetail}
          onEdit={handleEditCapsule}
        />
      )}
    </div>
  );
};

export default MoodCapsulesPage;