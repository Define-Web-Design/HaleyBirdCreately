
import { Client } from '@hubspot/api-client';

/**
 * HubSpot API Client
 * 
 * This utility provides methods for interacting with the HubSpot API.
 * Set your API key in the environment variables as VITE_HUBSPOT_API_KEY
 */

// Initialize the HubSpot client
const hubspotClient = new Client({ 
  accessToken: import.meta.env.VITE_HUBSPOT_API_KEY
});

/**
 * Create a contact in HubSpot
 * 
 * @param contactProperties - Object with contact properties like email, firstname, lastname, etc.
 * @returns The created contact
 */
export const createContact = async (contactProperties: Record<string, string>) => {
  try {
    const response = await hubspotClient.crm.contacts.basicApi.create({
      properties: contactProperties
    });
    return response.body;
  } catch (error) {
    console.error('Error creating HubSpot contact:', error);
    throw error;
  }
};

/**
 * Get a contact by email
 * 
 * @param email - Email of the contact to retrieve
 * @returns The contact object if found
 */
export const getContactByEmail = async (email: string) => {
  try {
    const filter = { propertyName: 'email', operator: 'EQ', value: email };
    const response = await hubspotClient.crm.contacts.searchApi.doSearch({
      filterGroups: [{ filters: [filter] }]
    });
    return response.body.results[0];
  } catch (error) {
    console.error('Error getting HubSpot contact:', error);
    throw error;
  }
};

/**
 * Create a deal in HubSpot
 * 
 * @param dealProperties - Object with deal properties
 * @returns The created deal
 */
export const createDeal = async (dealProperties: Record<string, string>) => {
  try {
    const response = await hubspotClient.crm.deals.basicApi.create({
      properties: dealProperties
    });
    return response.body;
  } catch (error) {
    console.error('Error creating HubSpot deal:', error);
    throw error;
  }
};

/**
 * Associate a contact with a deal
 * 
 * @param dealId - ID of the deal
 * @param contactId - ID of the contact
 */
export const associateContactWithDeal = async (dealId: string, contactId: string) => {
  try {
    await hubspotClient.crm.deals.associationsApi.create(
      dealId,
      'contacts',
      contactId,
      'deal_to_contact'
    );
    return true;
  } catch (error) {
    console.error('Error associating contact with deal:', error);
    throw error;
  }
};

export default hubspotClient;
