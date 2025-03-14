import { Database } from '@tableland/sdk';
import { ethers } from 'ethers';

let tableland = null;

export const initTableland = async () => {
  if (!tableland) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    tableland = new Database({ signer });
  }
  return tableland;
};

// Create initial tables
export async function createTables() {
  const tableland = await initTableland();
  
  // Create listings table
  await tableland.prepare(`
    CREATE TABLE listings (
      id text PRIMARY KEY,
      title text NOT NULL,
      description text NOT NULL,
      price decimal(12,2) NOT NULL,
      image_url text,
      category text NOT NULL,
      features text,
      requirements text,
      use_cases text,
      rating decimal(3,2) DEFAULT 0,
      downloads integer DEFAULT 0,
      version text,
      author_id text NOT NULL,
      token_id text,
      contract_address text,
      blockchain text DEFAULT 'polygon',
      status text DEFAULT 'active',
      created_at text DEFAULT CURRENT_TIMESTAMP,
      updated_at text DEFAULT CURRENT_TIMESTAMP
    );
  `).run();

  // Create orders table
  await tableland.prepare(`
    CREATE TABLE orders (
      id text PRIMARY KEY,
      listing_id text NOT NULL,
      buyer_id text NOT NULL,
      seller_id text NOT NULL,
      amount decimal(12,2) NOT NULL,
      status text DEFAULT 'pending',
      transaction_hash text,
      created_at text DEFAULT CURRENT_TIMESTAMP,
      updated_at text DEFAULT CURRENT_TIMESTAMP
    );
  `).run();

  // Create reviews table
  await tableland.prepare(`
    CREATE TABLE reviews (
      id text PRIMARY KEY,
      listing_id text NOT NULL,
      user_id text NOT NULL,
      rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
      comment text,
      created_at text DEFAULT CURRENT_TIMESTAMP,
      updated_at text DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(listing_id, user_id)
    );
  `).run();
}

// Listings functions
export async function getListings(category = null, limit = 100, page = 1) {
  const tableland = await initTableland();
  const offset = (page - 1) * limit;
  
  let query = 'SELECT * FROM listings WHERE status = ?';
  const params = ['active'];
  
  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }
  
  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);
  
  const { results } = await tableland.prepare(query).bind(params).all();
  return results;
}

export async function createListing(listingData) {
  const tableland = await initTableland();
  const id = ethers.utils.id(Date.now().toString());
  
  const query = `
    INSERT INTO listings (id, title, description, price, image_url, category, 
      features, requirements, use_cases, author_id, token_id, contract_address)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  await tableland.prepare(query).bind([
    id,
    listingData.title,
    listingData.description,
    listingData.price,
    listingData.image_url,
    listingData.category,
    JSON.stringify(listingData.features),
    JSON.stringify(listingData.requirements),
    JSON.stringify(listingData.use_cases),
    listingData.author_id,
    listingData.token_id,
    listingData.contract_address
  ]).run();
  
  return { id, ...listingData };
}

// Orders functions
export async function createOrder(orderData) {
  const tableland = await initTableland();
  const id = ethers.utils.id(Date.now().toString());
  
  const query = `
    INSERT INTO orders (id, listing_id, buyer_id, seller_id, amount, status)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  
  await tableland.prepare(query).bind([
    id,
    orderData.listing_id,
    orderData.buyer_id,
    orderData.seller_id,
    orderData.amount,
    'pending'
  ]).run();
  
  return { id, ...orderData };
}

// Reviews functions
export async function createReview(reviewData) {
  const tableland = await initTableland();
  const id = ethers.utils.id(Date.now().toString());
  
  const query = `
    INSERT INTO reviews (id, listing_id, user_id, rating, comment)
    VALUES (?, ?, ?, ?, ?)
  `;
  
  await tableland.prepare(query).bind([
    id,
    reviewData.listing_id,
    reviewData.user_id,
    reviewData.rating,
    reviewData.comment
  ]).run();
  
  // Update listing rating
  await updateListingRating(reviewData.listing_id);
  
  return { id, ...reviewData };
}

async function updateListingRating(listingId) {
  const tableland = await initTableland();
  
  // Get average rating
  const { results } = await tableland.prepare(`
    SELECT AVG(rating) as avg_rating 
    FROM reviews 
    WHERE listing_id = ?
  `).bind([listingId]).all();
  
  // Update listing
  await tableland.prepare(`
    UPDATE listings 
    SET rating = ? 
    WHERE id = ?
  `).bind([results[0].avg_rating, listingId]).run();
}