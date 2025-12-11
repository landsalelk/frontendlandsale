#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Appwrite configuration
const APPWRITE_ENDPOINT = 'http://appwrite-u88gs08cw0co0sgskgc40804.75.119.150.209.sslip.io/v1';
const APPWRITE_PROJECT_ID = '693962bb002fb1f881bd';
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY || '';
const DATABASE_ID = 'osclass_landsale_db';

// Validate API key
if (!APPWRITE_API_KEY) {
  console.error('❌ APPWRITE_API_KEY environment variable is required');
  process.exit(1);
}

// Simple Appwrite SDK implementation for server-side
class AppwriteClient {
  constructor(endpoint, projectId, apiKey) {
    this.endpoint = endpoint;
    this.projectId = projectId;
    this.apiKey = apiKey;
  }

  async request(method, path, data = null) {
    const url = `${this.endpoint}${path}`;
    const headers = {
      'Content-Type': 'application/json',
      'X-Appwrite-Project': this.projectId,
      'X-Appwrite-Key': this.apiKey,
    };

    const options = {
      method,
      headers,
    };

    if (data && method !== 'GET') {
      options.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, options);
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${result.message || 'Unknown error'}`);
      }
      
      return result;
    } catch (error) {
      console.error(`Request failed: ${method} ${path}`, error.message);
      throw error;
    }
  }

  // Database operations
  async createDocument(databaseId, collectionId, documentId, data, permissions = []) {
    return this.request('POST', `/databases/${databaseId}/collections/${collectionId}/documents`, {
      documentId,
      data,
      permissions
    });
  }

  async listDocuments(databaseId, collectionId, queries = []) {
    const queryString = queries.length > 0 ? `?queries[]=${queries.join('&queries[]=')}` : '';
    return this.request('GET', `/databases/${databaseId}/collections/${collectionId}/documents${queryString}`);
  }

  async deleteDocument(databaseId, collectionId, documentId) {
    return this.request('DELETE', `/databases/${databaseId}/collections/${collectionId}/documents/${documentId}`);
  }
}

// SQL Data Parser
class SQLDataParser {
  constructor(sqlFilePath) {
    this.sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
  }

  extractCopyData(tableName) {
    // Try both backup_osclass and public schemas
    const schemas = ['backup_osclass', 'public'];
    let copyStartMatch = null;
    let schema = null;
    
    for (const s of schemas) {
      // More flexible regex pattern to match COPY statements
      const copyStartPattern = new RegExp(`COPY\\s+"${s}"\\."${tableName}"\\s*\\([^)]+\\)\\s*FROM\\s+stdin;`, 'i');
      copyStartMatch = copyStartPattern.exec(this.sqlContent);
      if (copyStartMatch) {
        schema = s;
        break;
      }
    }
    
    if (!copyStartMatch) {
      console.log(`No COPY data found for table ${tableName}`);
      return [];
    }
    
    console.log(`Found COPY statement for ${tableName}:`, copyStartMatch[0]);
    
    // Extract columns from the COPY statement
    const columnsMatch = copyStartMatch[0].match(/\(([^)]+)\)/);
    if (!columnsMatch) {
      console.log(`No columns found in COPY statement for ${tableName}`);
      console.log('COPY statement:', copyStartMatch[0]);
      return [];
    }
    
    console.log(`Columns match:`, columnsMatch[1]);
    
    const columns = columnsMatch[1].split(',').map(col => col.trim().replace(/"/g, ''));
    console.log(`Parsed columns:`, columns);
    
    // Find the data section (between COPY statement and \\.)
    const startIndex = copyStartMatch.index + copyStartMatch[0].length;
    const endPattern = /\\\\\\./;
    const endMatch = endPattern.exec(this.sqlContent.slice(startIndex));
    
    if (!endMatch) {
      console.log(`No end marker found for COPY data in ${tableName}`);
      return [];
    }
    
    const dataSection = this.sqlContent.slice(startIndex, startIndex + endMatch.index);
    const dataRows = dataSection.trim().split('\n').filter(row => row.trim());
    
    console.log(`Found ${dataRows.length} rows in ${schema}.${tableName}`);
    
    const rows = dataRows.map(row => {
      const values = row.split('\t');
      const rowData = {};
      columns.forEach((col, index) => {
        let value = values[index] || null;
        if (value === '\\N') value = null;
        rowData[col] = value;
      });
      return rowData;
    });
    
    return rows;
  }

  parseCategories() {
    return this.extractCopyData('oc_t_category');
  }

  parseCategoryDescriptions() {
    return this.extractCopyData('oc_t_category_description');
  }

  parseItems() {
    return this.extractCopyData('oc_t_item');
  }

  parseItemDescriptions() {
    return this.extractCopyData('oc_t_item_description');
  }
}

// Data Transformer
class DataTransformer {
  transformCategory(category, descriptions) {
    const description = descriptions.find(d => d.fk_i_category_id === category.pk_i_id);
    
    return {
      id: category.pk_i_id.toString(),
      parent_id: category.fk_i_parent_id ? category.fk_i_parent_id.toString() : null,
      name: description ? description.s_name : `Category ${category.pk_i_id}`,
      slug: description ? description.s_slug : `category-${category.pk_i_id}`,
      description: description ? description.s_description : null,
      icon: category.s_icon,
      color: category.s_color,
      position: parseInt(category.i_position) || 0,
      is_enabled: category.b_enabled === 't',
      price_enabled: category.b_price_enabled === 't',
      expiration_days: parseInt(category.i_expiration_days) || 0
    };
  }

  transformListing(item, descriptions) {
    const description = descriptions.find(d => d.fk_i_item_id === item.pk_i_id);
    
    // Convert price from cents to actual currency
    let price = 0;
    if (item.f_price) {
      price = parseFloat(item.f_price) * 100; // Convert to cents
    } else if (item.i_price) {
      price = parseInt(item.i_price) / 100; // Assuming i_price is in smallest unit
    }

    return {
      id: item.pk_i_id.toString(),
      user_id: item.fk_i_user_id ? item.fk_i_user_id.toString() : '1', // Default to admin user
      category_id: item.fk_i_category_id.toString(),
      title: description ? description.s_title : `Listing ${item.pk_i_id}`,
      description: description ? description.s_description : '',
      slug: this.generateSlug(description ? description.s_title : `Listing ${item.pk_i_id}`),
      listing_type: item.listing_type || 'sale',
      status: this.mapStatus(item.status, item.b_enabled, item.b_active, item.b_spam),
      price: Math.round(price),
      currency_code: item.fk_c_currency_code || 'LKR',
      price_negotiable: false, // Default
      location: this.extractLocation(description ? description.s_description : ''),
      contact: {
        name: item.s_contact_name || 'Unknown',
        email: item.s_contact_email,
        phone: item.s_contact_phone,
        other: item.s_contact_other
      },
      features: [], // Will be extracted from description
      images: [], // Will be populated separately
      videos: [],
      is_premium: item.b_premium === 't',
      views_count: 0,
      expires_at: item.dt_expiration || '9999-12-31T23:59:59.999Z',
      published_at: item.dt_pub_date,
      ip_address: item.s_ip,
      auction_enabled: false,
      seo_title: description ? description.s_title.substring(0, 60) : '',
      seo_keywords: this.extractKeywords(description ? description.s_description : '')
    };
  }

  generateSlug(title) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 200);
  }

  mapStatus(status, enabled, active, spam) {
    if (spam === 't') return 'rejected';
    if (enabled === 'f' || active === 'f') return 'draft';
    if (status === 'sold') return 'sold';
    if (status === 'expired') return 'expired';
    return 'active';
  }

  extractLocation(description) {
    // Simple location extraction from description
    const locationPatterns = [
      /(?:in|at|near)\s+([A-Za-z\s,]+?)(?:\.|,|\n|$)/i,
      /Location:\s*([A-Za-z\s,]+?)(?:\.|,|\n|$)/i,
      /(?:Wellampitiya|Maharagama|Kuliyapitiya|Kadurugashena|Suriyamawatha)/gi
    ];

    for (const pattern of locationPatterns) {
      const match = description.match(pattern);
      if (match) {
        return match[1] ? match[1].trim() : match[0];
      }
    }
    
    return 'Sri Lanka'; // Default
  }

  extractKeywords(description) {
    // Extract keywords from description
    const words = description.toLowerCase()
      .replace(/[^a-z\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3)
      .slice(0, 10);
    
    return [...new Set(words)]; // Remove duplicates
  }
}

// Main Seeding Class
class AppwriteSeeder {
  constructor(sqlFilePath) {
    this.client = new AppwriteClient(APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, APPWRITE_API_KEY);
    this.parser = new SQLDataParser(sqlFilePath);
    this.transformer = new DataTransformer();
  }

  async seedCategories() {
    console.log('🔄 Seeding categories...');
    
    const categories = this.parser.parseCategories();
    const descriptions = this.parser.parseCategoryDescriptions();
    
    let successCount = 0;
    let errorCount = 0;

    for (const category of categories) {
      try {
        const transformed = this.transformer.transformCategory(category, descriptions);
        
        await this.client.createDocument(
          DATABASE_ID,
          'categories',
          transformed.id,
          transformed,
          ['read("any")']
        );
        
        successCount++;
        console.log(`✅ Category ${transformed.name} (${transformed.id})`);
      } catch (error) {
        errorCount++;
        console.error(`❌ Category ${category.pk_i_id}: ${error.message}`);
      }
    }
    
    console.log(`📊 Categories: ${successCount} success, ${errorCount} errors`);
    return { successCount, errorCount };
  }

  async seedListings() {
    console.log('🔄 Seeding listings...');
    
    const items = this.parser.parseItems();
    const descriptions = this.parser.parseItemDescriptions();
    
    let successCount = 0;
    let errorCount = 0;

    // Process in batches to avoid overwhelming the API
    const batchSize = 10;
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      
      await Promise.all(batch.map(async (item) => {
        try {
          const transformed = this.transformer.transformListing(item, descriptions);
          
          await this.client.createDocument(
            DATABASE_ID,
            'listings',
            transformed.id,
            transformed,
            ['read("any")']
          );
          
          successCount++;
          console.log(`✅ Listing ${transformed.title} (${transformed.id})`);
        } catch (error) {
          errorCount++;
          console.error(`❌ Listing ${item.pk_i_id}: ${error.message}`);
        }
      }));
      
      // Small delay between batches
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log(`📊 Listings: ${successCount} success, ${errorCount} errors`);
    return { successCount, errorCount };
  }

  async clearExistingData() {
    console.log('🧹 Clearing existing data...');
    
    try {
      // Clear categories
      const categories = await this.client.listDocuments(DATABASE_ID, 'categories');
      for (const category of categories.documents || []) {
        await this.client.deleteDocument(DATABASE_ID, 'categories', category.$id);
      }
      console.log(`🗑️ Cleared ${categories.documents?.length || 0} categories`);
      
      // Clear listings
      const listings = await this.client.listDocuments(DATABASE_ID, 'listings');
      for (const listing of listings.documents || []) {
        await this.client.deleteDocument(DATABASE_ID, 'listings', listing.$id);
      }
      console.log(`🗑️ Cleared ${listings.documents?.length || 0} listings`);
      
    } catch (error) {
      console.warn('⚠️ Could not clear existing data:', error.message);
    }
  }

  async run() {
    console.log('🚀 Starting Appwrite database seeding...');
    console.log(`📁 SQL File: ${process.argv[2]}`);
    console.log(`🗄️ Database: ${DATABASE_ID}`);
    
    const startTime = Date.now();
    
    try {
      // Clear existing data
      await this.clearExistingData();
      
      // Seed categories first (dependencies)
      const categoryResults = await this.seedCategories();
      
      // Then seed listings
      const listingResults = await this.seedListings();
      
      const duration = (Date.now() - startTime) / 1000;
      
      console.log('\n📈 Seeding Complete!');
      console.log(`⏱️ Duration: ${duration}s`);
      console.log(`📊 Categories: ${categoryResults.successCount} added, ${categoryResults.errorCount} errors`);
      console.log(`📊 Listings: ${listingResults.successCount} added, ${listingResults.errorCount} errors`);
      
      if (categoryResults.errorCount > 0 || listingResults.errorCount > 0) {
        console.log('\n⚠️ Some errors occurred during seeding. Check the logs above.');
        process.exit(1);
      }
      
      console.log('\n✅ All data seeded successfully!');
      
    } catch (error) {
      console.error('💥 Fatal error during seeding:', error.message);
      process.exit(1);
    }
  }
}

// Main execution
if (require.main === module) {
  const sqlFilePath = process.argv[2] || 'c:\\landsalelk AI\\landsale-frontend\\full_remote_backup.sql';
  
  if (!fs.existsSync(sqlFilePath)) {
    console.error(`❌ SQL file not found: ${sqlFilePath}`);
    process.exit(1);
  }
  
  const seeder = new AppwriteSeeder(sqlFilePath);
  seeder.run().catch(console.error);
}

module.exports = { AppwriteSeeder, SQLDataParser, DataTransformer };