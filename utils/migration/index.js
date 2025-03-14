import { database as web3DB } from '../web3';
import * as supabaseClient from '../supabase/client';
import { uploadFile, uploadJSON } from '../web3/storage';
import { createTables } from '../web3/tableland';
import { initCeramic } from '../web3/ceramic';
import { ethers } from 'ethers';

// Initialize all required services
export async function initializeWeb3Services() {
  try {
    // Initialize Ceramic
    await initCeramic();
    
    // Initialize Tableland and create tables
    await createTables();
    
    return true;
  } catch (error) {
    console.error('Failed to initialize Web3 services:', error);
    return false;
  }
}

// Migrate user profiles to Ceramic
export async function migrateProfiles() {
  try {
    const profiles = await supabaseClient.getAllProfiles();
    
    for (const profile of profiles) {
      // Upload avatar to IPFS if it exists
      let avatar_url = profile.avatar_url;
      if (avatar_url && !avatar_url.startsWith('ipfs://')) {
        const response = await fetch(avatar_url);
        const blob = await response.blob();
        const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' });
        avatar_url = await uploadFile(file);
      }
      
      // Create profile in Ceramic
      await web3DB.profiles.create({
        ...profile,
        avatar_url,
      });
    }
    
    return true;
  } catch (error) {
    console.error('Failed to migrate profiles:', error);
    return false;
  }
}

// Migrate listings to Tableland
export async function migrateListings() {
  try {
    const listings = await supabaseClient.getAllListings();
    
    for (const listing of listings) {
      // Upload images to IPFS
      let image_url = listing.image_url;
      if (image_url && !image_url.startsWith('ipfs://')) {
        const response = await fetch(image_url);
        const blob = await response.blob();
        const file = new File([blob], 'listing.jpg', { type: 'image/jpeg' });
        image_url = await uploadFile(file);
      }
      
      // Create listing in Tableland
      await web3DB.listings.create({
        ...listing,
        image_url,
        id: ethers.utils.id(listing.id) // Convert UUID to hex for Tableland
      });
    }
    
    return true;
  } catch (error) {
    console.error('Failed to migrate listings:', error);
    return false;
  }
}

// Migrate orders to Tableland
export async function migrateOrders() {
  try {
    const orders = await supabaseClient.getAllOrders();
    
    for (const order of orders) {
      await web3DB.orders.create({
        ...order,
        id: ethers.utils.id(order.id)
      });
    }
    
    return true;
  } catch (error) {
    console.error('Failed to migrate orders:', error);
    return false;
  }
}

// Migrate reviews to Tableland
export async function migrateReviews() {
  try {
    const reviews = await supabaseClient.getAllReviews();
    
    for (const review of reviews) {
      await web3DB.reviews.create({
        ...review,
        id: ethers.utils.id(review.id)
      });
    }
    
    return true;
  } catch (error) {
    console.error('Failed to migrate reviews:', error);
    return false;
  }
}

// Migrate all data
export async function migrateAll() {
  console.log('Starting full migration...');
  
  // Initialize services
  console.log('Initializing Web3 services...');
  const initialized = await initializeWeb3Services();
  if (!initialized) {
    throw new Error('Failed to initialize Web3 services');
  }
  
  // Migrate data in order
  console.log('Migrating profiles...');
  await migrateProfiles();
  
  console.log('Migrating listings...');
  await migrateListings();
  
  console.log('Migrating orders...');
  await migrateOrders();
  
  console.log('Migrating reviews...');
  await migrateReviews();
  
  console.log('Migration completed successfully');
  return true;
}