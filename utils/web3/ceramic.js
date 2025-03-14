import { CeramicClient } from '@ceramicnetwork/http-client';
import { DID } from 'dids';
import { getResolver } from 'key-did-resolver';
import { Ed25519Provider } from 'key-did-provider-ed25519';
import { ModelManager } from '@glazed/devtools';
import { DIDDataStore } from '@glazed/did-datastore';

let ceramic = null;

export const initCeramic = async () => {
  if (!ceramic) {
    ceramic = new CeramicClient(process.env.NEXT_PUBLIC_CERAMIC_API_URL);
    
    // Setup DID authentication
    const key = new Uint8Array(32); // Replace with actual key generation/management
    const provider = new Ed25519Provider(key);
    const did = new DID({ provider, resolver: getResolver() });
    await did.authenticate();
    ceramic.did = did;
  }
  return ceramic;
};

// Define schema for profiles
const profileSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  title: 'Profile',
  type: 'object',
  properties: {
    username: { type: 'string' },
    avatar_url: { type: 'string' },
    bio: { type: 'string' },
    email: { type: 'string' },
    full_name: { type: 'string' },
    website: { type: 'string' }
  }
};

// Define schema for groups
const groupSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  title: 'Group',
  type: 'object',
  properties: {
    name: { type: 'string' },
    description: { type: 'string' },
    creator_id: { type: 'string' },
    created_at: { type: 'string' },
    updated_at: { type: 'string' }
  }
};

export async function createProfile(profileData) {
  const ceramic = await initCeramic();
  const manager = new ModelManager(ceramic);
  
  // Create the profile schema
  const profileSchemaID = await manager.createSchema('Profile', profileSchema);
  const definition = await manager.createDefinition('profile', {
    name: 'Profile',
    description: 'Profile Information',
    schema: manager.getSchemaURL(profileSchemaID)
  });
  
  const dataStore = new DIDDataStore({ ceramic, model: manager.toJSON() });
  await dataStore.set('profile', profileData);
  
  return profileData;
}

export async function getProfile(did) {
  const ceramic = await initCeramic();
  const manager = new ModelManager(ceramic);
  const dataStore = new DIDDataStore({ ceramic, model: manager.toJSON() });
  
  return await dataStore.get('profile', did);
}

export async function updateProfile(did, profileData) {
  const ceramic = await initCeramic();
  const manager = new ModelManager(ceramic);
  const dataStore = new DIDDataStore({ ceramic, model: manager.toJSON() });
  
  const existingProfile = await dataStore.get('profile', did);
  const updatedProfile = { ...existingProfile, ...profileData };
  await dataStore.set('profile', updatedProfile);
  
  return updatedProfile;
}

// Group management functions
export async function createGroup(groupData) {
  const ceramic = await initCeramic();
  const manager = new ModelManager(ceramic);
  
  const groupSchemaID = await manager.createSchema('Group', groupSchema);
  const definition = await manager.createDefinition('group', {
    name: 'Group',
    description: 'Group Information',
    schema: manager.getSchemaURL(groupSchemaID)
  });
  
  const dataStore = new DIDDataStore({ ceramic, model: manager.toJSON() });
  await dataStore.set('group', groupData);
  
  return groupData;
}

export async function getGroup(groupId) {
  const ceramic = await initCeramic();
  const manager = new ModelManager(ceramic);
  const dataStore = new DIDDataStore({ ceramic, model: manager.toJSON() });
  
  return await dataStore.get('group', groupId);
}

export async function updateGroup(groupId, groupData) {
  const ceramic = await initCeramic();
  const manager = new ModelManager(ceramic);
  const dataStore = new DIDDataStore({ ceramic, model: manager.toJSON() });
  
  const existingGroup = await dataStore.get('group', groupId);
  const updatedGroup = { ...existingGroup, ...groupData };
  await dataStore.set('group', updatedGroup);
  
  return updatedGroup;
}