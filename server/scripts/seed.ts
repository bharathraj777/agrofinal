import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { User, Crop, GovernmentScheme, MarketplaceListing, PriceData } from '../src/models';

// Load environment variables
dotenv.config();

const seedData = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/agriculture_db';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Crop.deleteMany({});
    await GovernmentScheme.deleteMany({});
    await MarketplaceListing.deleteMany({});
    await PriceData.deleteMany({});

    // Seed admin user
    console.log('👤 Creating admin user...');
    const adminPassword = await bcrypt.hash('AdminPass123!', 12);
    const adminUser = new User({
      name: 'System Administrator',
      email: 'admin@local.test',
      passwordHash: adminPassword,
      role: 'admin',
      isActive: true
    });
    await adminUser.save();

    // Seed demo farmer user
    console.log('👨‍🌾 Creating demo farmer user...');
    const farmerPassword = await bcrypt.hash('FarmerPass123!', 12);
    const farmerUser = new User({
      name: 'Demo Farmer',
      email: 'farmer@example.com',
      passwordHash: farmerPassword,
      role: 'farmer',
      phone: '+91 9876543210',
      state: 'Maharashtra',
      location: {
        lat: 19.0760,
        lng: 72.8777,
        address: 'Mumbai, Maharashtra'
      },
      isActive: true
    });
    await farmerUser.save();

    // Seed crops
    console.log('🌾 Creating crops...');
    const crops = [
      {
        name: 'Rice',
        scientificName: 'Oryza sativa',
        images: [
          'https://images.unsplash.com/photo-1586201375761-83865001e31c?ixlib=rb-4.0.3',
          'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?ixlib=rb-4.0.3'
        ],
        ideal: {
          N: [80, 120],
          P: [40, 60],
          K: [40, 80],
          temperature: [20, 35],
          humidity: [60, 80],
          rainfall: [1000, 2000],
          ph: [5.5, 7.0],
          seasons: ['kharif']
        },
        soilTypes: ['clayey', 'loamy'],
        pesticides: ['Bacterial leaf blight pesticide', 'Sheath blight fungicide'],
        fertilizers: [
          {
            name: 'Urea',
            dosage: '80-100 kg/ha',
            applicationTime: 'During transplanting and tillering'
          },
          {
            name: 'DAP',
            dosage: '40-60 kg/ha',
            applicationTime: 'Basal application'
          }
        ],
        priceSource: 'static',
        typicalYield: 25,
        growingPeriod: 120,
        waterRequirement: 'High'
      },
      {
        name: 'Wheat',
        scientificName: 'Triticum aestivum',
        images: [
          'https://images.unsplash.com/photo-1592503963778-b3d5b12b2f11?ixlib=rb-4.0.3'
        ],
        ideal: {
          N: [100, 150],
          P: [60, 80],
          K: [40, 60],
          temperature: [15, 25],
          humidity: [50, 70],
          rainfall: [400, 800],
          ph: [6.0, 7.5],
          seasons: ['rabi']
        },
        soilTypes: ['loamy', 'clayey'],
        pesticides: ['Fungicide for rust', 'Insecticide for aphids'],
        fertilizers: [
          {
            name: 'Urea',
            dosage: '100-120 kg/ha',
            applicationTime: 'Split application'
          }
        ],
        priceSource: 'static',
        typicalYield: 30,
        growingPeriod: 140,
        waterRequirement: 'Medium'
      },
      {
        name: 'Maize',
        scientificName: 'Zea mays',
        images: [
          'https://images.unsplash.com/photo-1572012206388-6b2d9d4983c4?ixlib=rb-4.0.3'
        ],
        ideal: {
          N: [120, 160],
          P: [60, 80],
          K: [40, 60],
          temperature: [18, 30],
          humidity: [60, 80],
          rainfall: [600, 1200],
          ph: [5.5, 7.5],
          seasons: ['kharif', 'rabi']
        },
        soilTypes: ['loamy', 'sandy'],
        pesticides: ['Stalk borer control', 'Termite treatment'],
        fertilizers: [
          {
            name: 'NPK 19:19:19',
            dosage: '250-300 kg/ha',
            applicationTime: 'Basal and top dressing'
          }
        ],
        priceSource: 'static',
        typicalYield: 35,
        growingPeriod: 110,
        waterRequirement: 'Medium'
      },
      {
        name: 'Cotton',
        scientificName: 'Gossypium hirsutum',
        images: [
          'https://images.unsplash.com/photo-1596495579947-90a30d37d3af?ixlib=rb-4.0.3'
        ],
        ideal: {
          N: [80, 120],
          P: [40, 60],
          K: [40, 80],
          temperature: [25, 35],
          humidity: [60, 70],
          rainfall: [500, 800],
          ph: [6.0, 8.0],
          seasons: ['kharif']
        },
        soilTypes: ['black', 'clayey'],
        pesticides: ['Bollworm control', 'Aphid management'],
        fertilizers: [
          {
            name: 'Complex fertilizer',
            dosage: '200-250 kg/ha',
            applicationTime: 'Split application'
          }
        ],
        priceSource: 'static',
        typicalYield: 15,
        growingPeriod: 160,
        waterRequirement: 'Medium'
      },
      {
        name: 'Sugarcane',
        scientificName: 'Saccharum officinarum',
        images: [
          'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3'
        ],
        ideal: {
          N: [150, 200],
          P: [60, 80],
          K: [80, 120],
          temperature: [20, 35],
          humidity: [70, 85],
          rainfall: [1000, 2000],
          ph: [6.0, 7.5],
          seasons: ['kharif', 'rabi']
        },
        soilTypes: ['loamy', 'clayey'],
        pesticides: ['Pest control for early shoot borer', 'Red rot management'],
        fertilizers: [
          {
            name: 'Complex fertilizer',
            dosage: '300-350 kg/ha',
            applicationTime: 'Split application'
          }
        ],
        priceSource: 'static',
        typicalYield: 70,
        growingPeriod: 365,
        waterRequirement: 'High'
      }
    ];

    const createdCrops = await Crop.insertMany(crops);
    console.log(`✅ Created ${createdCrops.length} crops`);

    // Seed government schemes
    console.log('🏛️  Creating government schemes...');
    const schemes = [
      {
        title: 'Pradhan Mantri Kisan Samman Nidhi (PM-Kisan)',
        description: 'Income support of Rs. 6000 per year to farmer families for agricultural activities and domestic needs',
        state: 'All India',
        category: 'subsidy',
        eligibility: [
          'Small and marginal farmers',
          'Land holding up to 2 hectares',
          'Indian citizen',
          'Aadhaar card mandatory'
        ],
        benefits: 'Direct cash transfer of Rs. 6000 in three equal installments',
        documents: [
          'Aadhaar card',
          'Land records',
          'Bank account details',
          'Caste certificate (if applicable)'
        ],
        applicationSteps: [
          'Visit nearest Common Service Center',
          'Submit required documents',
          'Verify details in PM-Kisan portal',
          'Receive DBT transfers'
        ],
        applyUrl: 'https://pmkisan.gov.in',
        contactInfo: {
          phone: '1800115522',
          email: 'pmkisan@gov.in',
          website: 'https://pmkisan.gov.in'
        },
        tags: ['income support', 'small farmers', 'cash transfer', 'central government']
      },
      {
        title: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
        description: 'Crop insurance scheme to provide financial support to farmers suffering crop loss due to natural calamities',
        state: 'All India',
        category: 'insurance',
        eligibility: [
          'All farmers including sharecroppers',
          'Tenant farmers with permission of landowner',
          'Cultivation notified area crops'
        ],
        benefits: 'Insurance coverage for crop losses up to 90% of sum insured',
        documents: [
          'Land ownership proof',
          'Aadhaar card',
          'Bank account details',
          'Crop cultivation details'
        ],
        applicationSteps: [
          'Approach bank or insurance company',
          'Submit application with required documents',
          'Pay premium amount',
          'Get insurance coverage'
        ],
        tags: ['crop insurance', 'risk coverage', 'natural calamities', 'financial security']
      },
      {
        title: 'Maharashtra State Agriculture Credit Card Scheme',
        description: 'Provides credit card facilities to farmers for agricultural operations and allied activities',
        state: 'Maharashtra',
        category: 'loan',
        eligibility: [
          'Resident farmers of Maharashtra',
          'Minimum 1 acre agricultural land',
          'Good credit history',
          'Age between 18-65 years'
        ],
        benefits: 'Credit limit up to Rs. 50,000 with 4% interest rate',
        documents: [
          'Residence proof',
          'Land records',
          'Income certificate',
          'Bank account details'
        ],
        applicationSteps: [
          'Apply at nearest bank branch',
          'Submit application form and documents',
          'Bank verification and approval',
          'Receive credit card'
        ],
        tags: ['agricultural credit', 'loan facility', 'maharashtra', '4% interest']
      },
      {
        title: 'Soil Health Card Scheme',
        description: 'Provides soil health cards to farmers with information about soil nutrient status and recommendations',
        state: 'All India',
        category: 'training',
        eligibility: [
          'All farmers',
          'Land ownership or cultivation rights',
          'Valid agricultural land details'
        ],
        benefits: 'Free soil testing and fertilizer recommendations every 2 years',
        documents: [
          'Land ownership documents',
          'Aadhaar card',
          'Bank account details'
        ],
        applicationSteps: [
          'Register at local agriculture office',
          'Submit land details',
          'Soil sample collection',
          'Receive soil health card'
        ],
        tags: ['soil testing', 'fertilizer recommendations', 'soil health', 'free testing']
      },
      {
        title: 'National Agriculture Market (e-NAM)',
        description: 'Online trading platform for agricultural commodities to ensure better price discovery',
        state: 'All India',
        category: 'equipment',
        eligibility: [
          'Farmers and traders',
          'Valid agricultural produce',
          'Registered with local mandi'
        ],
        benefits: 'Better price discovery, reduced transaction costs, transparent trading',
        documents: [
          'PAN card',
          'Aadhaar card',
          'Bank account',
          'Mandi registration'
        ],
        applicationSteps: [
          'Register on e-NAM portal',
          'Complete KYC verification',
          'Start online trading',
          'Receive payments directly'
        ],
        applyUrl: 'https://enam.gov.in',
        tags: ['online trading', 'price discovery', 'digital agriculture', 'transparent market']
      }
    ];

    const createdSchemes = await GovernmentScheme.insertMany(schemes);
    console.log(`✅ Created ${createdSchemes.length} government schemes`);

    // Seed marketplace listings
    console.log('🏪 Creating marketplace listings...');
    const listings = [
      {
        sellerId: farmerUser._id,
        cropId: createdCrops[0]._id, // Rice
        title: 'Premium Basmati Rice - Fresh Harvest',
        description: 'High quality basmati rice, freshly harvested with excellent grain quality',
        quantity: 50,
        pricePerQuintal: 3200,
        location: {
          lat: 19.0760,
          lng: 72.8777,
          address: 'Near Agricultural Market, Nashik',
          city: 'Nashik',
          state: 'Maharashtra'
        },
        images: [
          'https://images.unsplash.com/photo-1586201375761-83865001e31c?ixlib=rb-4.0.3'
        ],
        availableFrom: new Date(),
        availableUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        harvestDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        quality: 'A',
        certification: ['Organic'],
        status: 'approved',
        viewCount: 24
      },
      {
        sellerId: farmerUser._id,
        cropId: createdCrops[1]._id, // Wheat
        title: 'Grade A Wheat - Best Quality',
        description: 'Premium quality wheat suitable for making fine flour',
        quantity: 75,
        pricePerQuintal: 2200,
        location: {
          lat: 19.0760,
          lng: 72.8777,
          address: 'Agricultural Market Yard, Pune',
          city: 'Pune',
          state: 'Maharashtra'
        },
        images: [
          'https://images.unsplash.com/photo-1592503963778-b3d5b12b2f11?ixlib=rb-4.0.3'
        ],
        availableFrom: new Date(),
        availableUntil: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        harvestDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        quality: 'A',
        status: 'approved',
        viewCount: 18
      }
    ];

    const createdListings = await MarketplaceListing.insertMany(listings);
    console.log(`✅ Created ${createdListings.length} marketplace listings`);

    // Seed price data
    console.log('💰 Creating price data...');
    const priceData = [];
    const states = ['Maharashtra', 'Gujarat', 'Punjab', 'Haryana', 'Madhya Pradesh'];
    const cropNames = ['Rice', 'Wheat', 'Maize', 'Cotton', 'Sugarcane'];

    for (let cropName of cropNames) {
      const crop = createdCrops.find(c => c.name === cropName);
      if (!crop) continue;

      for (let state of states) {
        for (let month = 0; month < 12; month++) {
          const date = new Date();
          date.setMonth(date.getMonth() - month);

          priceData.push({
            cropId: crop._id,
            location: {
              state,
              market: 'Mandi Market'
            },
            price: Math.floor(Math.random() * 2000) + 1500, // Random price between 1500-3500
            date,
            source: 'static',
            marketType: 'wholesale'
          });
        }
      }
    }

    const createdPriceData = await PriceData.insertMany(priceData);
    console.log(`✅ Created ${createdPriceData.length} price data entries`);

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('   Admin: admin@local.test / AdminPass123!');
    console.log('   Farmer: farmer@example.com / FarmerPass123!');
    console.log('\n🌐 Application URLs:');
    console.log('   Frontend: http://localhost:3000');
    console.log('   Backend API: http://localhost:5000/api');
    console.log('   Health Check: http://localhost:5000/health');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
};

// Run seeding function
seedData().catch(console.error);