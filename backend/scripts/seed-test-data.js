/**
 * Urbify test data seed — run in browser console on localhost:3000
 * Paste this entire script and call: seedUrbify()
 */
window.seedUrbify = async function() {
  const BASE = '/api/v1';
  const log = (msg) => console.log('[seed]', msg);
  const err = (msg) => console.error('[seed ERROR]', msg);

  async function post(url, body, token) {
    const h = { 'Content-Type': 'application/json' };
    if (token) h['Authorization'] = `Bearer ${token}`;
    const r = await fetch(BASE + url, { method: 'POST', headers: h, body: JSON.stringify(body) });
    const d = await r.json();
    if (!r.ok) { err(`POST ${url} → ${r.status}: ${JSON.stringify(d.message)}`); return null; }
    return d;
  }

  async function getMe(token) {
    const r = await fetch(`${BASE}/users/me`, { headers: { Authorization: `Bearer ${token}` } });
    return r.ok ? r.json() : null;
  }

  // ── 1. Register all roles ──────────────────────────────────────────────────
  log('Registering accounts…');

  const accounts = [
    { email:'owner@urbify.test',  password:'Test@1234', role:'OWNER',  fullName:'Rohan Pillai',  city:'Bangalore' },
    { email:'tenant@urbify.test', password:'Test@1234', role:'CLIENT', fullName:'Aanya Sharma',  city:'Mumbai' },
    { email:'broker@urbify.test', password:'Test@1234', role:'BROKER', fullName:'Vikram Kumar',  city:'Delhi', reraId:'DL/RERA/BRK/1234' },
    { email:'admin@urbify.test',  password:'Test@1234', role:'ADMIN',  fullName:'Maya Ops',      city:'Bangalore' },
  ];

  const tokens = {};
  for (const acc of accounts) {
    // Try login first (account might already exist)
    let res = await post('/auth/login', { email: acc.email, password: acc.password });
    if (!res) {
      // Try register
      res = await post('/auth/register', acc);
    }
    if (res?.accessToken) {
      tokens[acc.role] = res.accessToken;
      log(`✓ ${acc.role}: ${acc.email}`);
    } else {
      err(`✗ Could not auth ${acc.role} (${acc.email})`);
    }
  }

  // ── 2. Create listings as OWNER ────────────────────────────────────────────
  if (tokens.OWNER) {
    log('Creating owner listings…');
    const listings = [
      {
        listingType: 'RESIDENTIAL_RENTAL',
        locality: 'Koramangala 4th Block', city: 'Bangalore', state: 'Karnataka',
        pincode: '560034', fullAddress: '38, 4th Block, 80 Feet Road, Koramangala, Bangalore 560034',
        title: '2 BHK Apartment for Rent in Koramangala', description: 'Spacious 2 BHK with balcony and car parking in prime Koramangala location. Well-connected to IT parks and restaurants.',
        propertySubType: 'apartment', bhk: 2, areaSqFt: 1240, floor: 4, totalFloors: 8,
        furnishingStatus: 'SEMI_FURNISHED', facing: 'EAST', propertyAge: 3,
        rentOrPrice: 45000, securityDeposit: 90000, availableFrom: '2026-07-01', isNegotiable: true,
        amenities: ['Power Backup', 'Gym', 'Security'],
        latitude: 12.9352, longitude: 77.6245,
      },
      {
        listingType: 'RESIDENTIAL_RENTAL',
        locality: 'HSR Layout Sector 2', city: 'Bangalore', state: 'Karnataka',
        pincode: '560102', fullAddress: '12, 27th Main, HSR Layout Sector 2, Bangalore 560102',
        title: '3 BHK Villa for Rent in HSR Layout', description: 'Independent 3 BHK villa with garden, servant quarter, and 2 car parking. Quiet and peaceful residential area.',
        propertySubType: 'independent_house', bhk: 3, areaSqFt: 2100, floor: 1, totalFloors: 2,
        furnishingStatus: 'FULLY_FURNISHED', facing: 'NORTH', propertyAge: 8,
        rentOrPrice: 65000, securityDeposit: 130000, availableFrom: '2026-07-15', isNegotiable: false,
        amenities: ['Power Backup', 'Garden', 'Car Parking', 'Security'],
        latitude: 12.9116, longitude: 77.6389,
      },
      {
        listingType: 'RESIDENTIAL_RENTAL',
        locality: 'Indiranagar 12th Main', city: 'Bangalore', state: 'Karnataka',
        pincode: '560038', fullAddress: '56, 12th Main Road, Indiranagar, Bangalore 560038',
        title: '1 BHK Studio Apartment in Indiranagar', description: 'Modern 1 BHK studio apartment near metro station. Perfect for working professionals. Fully furnished.',
        propertySubType: 'apartment', bhk: 1, areaSqFt: 680, floor: 3, totalFloors: 6,
        furnishingStatus: 'FULLY_FURNISHED', facing: 'EAST', propertyAge: 5,
        rentOrPrice: 28000, securityDeposit: 56000, availableFrom: '2026-06-15', isNegotiable: true,
        amenities: ['Power Backup', 'WiFi', 'AC'],
      },
    ];

    for (const l of listings) {
      const created = await post('/properties', l, tokens.OWNER);
      if (created?.id || created?.data?.id) {
        const id = created.id || created.data?.id;
        log(`✓ Owner listing created: ${l.title} (${id})`);
      }
    }
  }

  // ── 3. Create listings as BROKER ───────────────────────────────────────────
  if (tokens.BROKER) {
    log('Creating broker listings…');
    const brokerListings = [
      {
        listingType: 'RESIDENTIAL_RENTAL',
        locality: 'Whitefield ITPL Road', city: 'Bangalore', state: 'Karnataka',
        pincode: '560066', fullAddress: '101, Prestige Tech Park, Whitefield, Bangalore 560066',
        title: '2 BHK Apartment for Rent in Whitefield near ITPL', description: 'Brand new 2 BHK near ITPL. Ideal for tech professionals. Close to Cessna Business Park and Whitefield Metro.',
        propertySubType: 'apartment', bhk: 2, areaSqFt: 1100, floor: 6, totalFloors: 18,
        furnishingStatus: 'SEMI_FURNISHED', facing: 'WEST', propertyAge: 1,
        rentOrPrice: 38000, securityDeposit: 76000, availableFrom: '2026-07-01', isNegotiable: true,
        amenities: ['Gym', 'Swimming Pool', 'Club House', 'Power Backup'],
      },
      {
        listingType: 'RESIDENTIAL_RENTAL',
        locality: 'Powai Hiranandani', city: 'Mumbai', state: 'Maharashtra',
        pincode: '400076', fullAddress: '45, Hiranandani Gardens, Powai, Mumbai 400076',
        title: '2 BHK Apartment for Rent in Powai Hiranandani', description: 'Well-maintained 2 BHK in the premium Hiranandani complex. Close to IIT Bombay and tech parks.',
        propertySubType: 'apartment', bhk: 2, areaSqFt: 950, floor: 8, totalFloors: 20,
        furnishingStatus: 'SEMI_FURNISHED', facing: 'SOUTH', propertyAge: 6,
        rentOrPrice: 58000, securityDeposit: 116000, availableFrom: '2026-08-01', isNegotiable: false,
        amenities: ['Swimming Pool', 'Gym', 'Security', 'Power Backup'],
      },
    ];

    for (const l of brokerListings) {
      const created = await post('/properties', l, tokens.BROKER);
      if (created?.id || created?.data?.id) {
        const id = created.id || created.data?.id;
        log(`✓ Broker listing created: ${l.title} (${id})`);
      }
    }
  }

  // ── 4. Summary ─────────────────────────────────────────────────────────────
  log('\n=== SEED COMPLETE ===');
  log('Accounts created with password: Test@1234');
  log('  owner@urbify.test  → OWNER');
  log('  tenant@urbify.test → CLIENT/TENANT');
  log('  broker@urbify.test → BROKER');
  log('  admin@urbify.test  → ADMIN');
  log('\nListings are in PENDING_REVIEW status.');
  log('Login as admin@urbify.test and go to /admin to approve them.');
  log('\nTokens saved for manual testing:');
  window._urbTokens = tokens;
  console.log('window._urbTokens =', tokens);

  return tokens;
};

log('Ready. Call seedUrbify() in the console.');
