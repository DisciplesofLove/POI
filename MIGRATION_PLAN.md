# Supabase to Decentralized Stack Migration Plan

## Current Architecture

The application currently uses Supabase for:

1. **Authentication** (auth.js)
   - User signup/signin
   - Password management
   - Session handling

2. **Database** (various SQL files)
   - Profiles
   - Listings
   - Orders
   - Reviews
   - Messages
   - Groups

3. **Storage** (not directly visible but referenced)
   - File uploads
   - Image storage

## Migration Strategy

### Phase 1: Authentication
- Replace Supabase Auth with Web3Auth
- Integration points:
  - utils/supabase/auth.js
  - Anywhere using getCurrentUser()

### Phase 2: Database
- Primary: Tableland for structured data
- Secondary: Ceramic for user profiles and dynamic content
- Migration needed for:
  - Profiles -> Ceramic
  - Listings -> Tableland
  - Orders -> Tableland
  - Reviews -> Tableland
  - Messages -> XMTP
  - Groups -> Ceramic

### Phase 3: Storage
- Replace with IPFS/Filecoin
- Use web3.storage for simplified integration
- Migration points:
  - Profile avatars
  - Listing images
  - Any uploaded content

### Phase 4: Real-time Features
- Replace Supabase Realtime with:
  - The Graph for blockchain data indexing
  - XMTP for messaging
  - Waku for real-time updates

## Implementation Steps

1. Create new utility classes for each decentralized service
2. Implement parallel functionality alongside existing Supabase
3. Feature-flag the new implementations
4. Migrate data to new services
5. Switch to new implementations
6. Remove Supabase dependencies

## Priority Order

1. Authentication (highest impact, foundational)
2. Database (core functionality)
3. Storage (assets and files)
4. Real-time features (enhanced functionality)

## New Dependencies Required

```json
{
  "@web3auth/web3auth": "latest",
  "@tableland/sdk": "latest",
  "@ceramicnetwork/http-client": "latest",
  "ipfs-http-client": "latest",
  "@graphprotocol/client-cli": "latest",
  "@xmtp/xmtp-js": "latest",
  "js-waku": "latest"
}
```

## Security Considerations

1. Implement proper wallet connection handling
2. Secure key management for Web3Auth
3. Data encryption for sensitive information
4. Access control through smart contracts
5. Rate limiting and spam protection

## Testing Strategy

1. Unit tests for new decentralized services
2. Integration tests for Web3 interactions
3. Migration tests for data consistency
4. Performance testing for decentralized alternatives
5. Security testing for wallet interactions

## Rollback Plan

- Maintain Supabase as fallback during migration
- Implement feature flags for gradual rollout
- Keep data backups before migration
- Monitor performance metrics and user feedback