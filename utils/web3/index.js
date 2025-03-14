import { compatAuth } from './auth';
import * as ceramic from './ceramic';
import * as tableland from './tableland';
import * as xmtp from './xmtp';
import * as storage from './storage';
import { USE_WEB3_AUTH, USE_TABLELAND, USE_CERAMIC, USE_IPFS, USE_XMTP } from './config';
import * as supabaseClient from '../supabase/client';

// Authentication
export const auth = USE_WEB3_AUTH ? compatAuth : supabaseClient.auth;

// Database operations
export const database = {
  // Profile operations
  profiles: {
    get: USE_CERAMIC ? ceramic.getProfile : supabaseClient.getUserProfile,
    update: USE_CERAMIC ? ceramic.updateProfile : supabaseClient.updateUserProfile,
    create: USE_CERAMIC ? ceramic.createProfile : supabaseClient.createUserProfile,
  },
  
  // Listing operations
  listings: {
    get: USE_TABLELAND ? tableland.getListings : supabaseClient.getListings,
    create: USE_TABLELAND ? tableland.createListing : supabaseClient.createListing,
  },
  
  // Order operations
  orders: {
    create: USE_TABLELAND ? tableland.createOrder : supabaseClient.createOrder,
  },
  
  // Review operations
  reviews: {
    create: USE_TABLELAND ? tableland.createReview : supabaseClient.createReview,
  },
  
  // Group operations
  groups: {
    get: USE_CERAMIC ? ceramic.getGroup : supabaseClient.getGroup,
    create: USE_CERAMIC ? ceramic.createGroup : supabaseClient.createGroup,
    update: USE_CERAMIC ? ceramic.updateGroup : supabaseClient.updateGroup,
  }
};

// Messaging operations
export const messaging = {
  send: USE_XMTP ? xmtp.sendMessage : supabaseClient.sendMessage,
  getConversation: USE_XMTP ? xmtp.getConversation : supabaseClient.getConversation,
  getUserConversations: USE_XMTP ? xmtp.getUserConversations : supabaseClient.getUserConversations,
  subscribe: USE_XMTP ? xmtp.subscribeToMessages : supabaseClient.subscribeToMessages,
};

// Storage operations
export const fileStorage = {
  upload: USE_IPFS ? storage.uploadFile : supabaseClient.uploadFile,
  uploadJSON: USE_IPFS ? storage.uploadJSON : supabaseClient.uploadJSON,
  retrieve: USE_IPFS ? storage.retrieveFile : supabaseClient.retrieveFile,
  retrieveJSON: USE_IPFS ? storage.retrieveJSON : supabaseClient.retrieveJSON,
};