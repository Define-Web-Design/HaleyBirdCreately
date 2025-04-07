
import React, { useState } from 'react';
import { createContact, getContactByEmail, createDeal } from '@/utils/hubspot-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const HubSpotIntegration: React.FC = () => {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleCreateContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !firstName || !lastName) {
      toast({
        title: 'Missing Fields',
        description: 'Please fill in all fields.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const contactProperties = {
        email,
        firstname: firstName,
        lastname: lastName,
      };
      
      const contact = await createContact(contactProperties);
      
      toast({
        title: 'Contact Created',
        description: `Successfully created contact in HubSpot with ID: ${contact.id}`,
      });
      
      // Reset form
      setEmail('');
      setFirstName('');
      setLastName('');
    } catch (error) {
      toast({
        title: 'Error Creating Contact',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFindContact = async () => {
    if (!email) {
      toast({
        title: 'Missing Email',
        description: 'Please enter an email to search for a contact.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const contact = await getContactByEmail(email);
      
      if (contact) {
        toast({
          title: 'Contact Found',
          description: `Found contact: ${contact.properties.firstname} ${contact.properties.lastname}`,
        });
        
        // Populate form with contact details
        setFirstName(contact.properties.firstname || '');
        setLastName(contact.properties.lastname || '');
      } else {
        toast({
          title: 'Contact Not Found',
          description: 'No contact found with this email address.',
        });
      }
    } catch (error) {
      toast({
        title: 'Error Finding Contact',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-md mx-auto p-6 bg-background border rounded-lg shadow-sm">
      <div>
        <h2 className="text-2xl font-bold mb-4">HubSpot Integration</h2>
        <p className="text-muted-foreground mb-4">
          Create and search for contacts in your HubSpot CRM.
        </p>
      </div>

      <form onSubmit={handleCreateContact} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="flex space-x-2">
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              required
            />
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleFindContact}
              disabled={loading}
            >
              Find
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="First name"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Last name"
            required
          />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Creating...' : 'Create Contact in HubSpot'}
        </Button>
      </form>
      
      <div className="pt-4 text-sm text-muted-foreground">
        <p className="mb-2">
          Note: Make sure to set your HubSpot API key in the environment variables:
        </p>
        <code className="bg-muted p-2 rounded block">
          VITE_HUBSPOT_API_KEY=your_api_key_here
        </code>
      </div>
    </div>
  );
};

export default HubSpotIntegration;
