import { PropertyAIService } from '@/lib/ai/property-ai-service'

// Test the AI property extraction functionality
async function testAIPropertyExtraction() {
  const service = new PropertyAIService()
  
  const testCases = [
    {
      input: "3-bedroom house in Colombo 5, 2500 sqft, budget 45 million, has garden and parking",
      expected: {
        title: expect.any(String),
        price: expect.any(Number),
        bedrooms: 3,
        propertyType: 'house'
      }
    },
    {
      input: "Luxury apartment near Galle Road, 2 beds, sea view, modern amenities, price negotiable",
      expected: {
        propertyType: 'apartment',
        bedrooms: 2,
        description: expect.any(String)
      }
    }
  ]

  console.log('Testing AI Property Extraction...')
  
  for (const testCase of testCases) {
    try {
      console.log(`Testing: ${testCase.input}`)
      const result = await service.extractPropertyData(testCase.input)
      console.log('Extracted data:', result)
      
      // Validate results
      const validation = service.validatePropertyData(result)
      console.log('Validation:', validation)
      
      if (validation.isValid) {
        console.log('✅ Test passed - valid property data extracted')
      } else {
        console.log('⚠️  Validation errors:', validation.errors)
      }
      
    } catch (error) {
      console.error('❌ Test failed:', error)
    }
  }
  
  console.log('\nTesting property description generation...')
  const sampleData = {
    title: "Beautiful 3-Bedroom House",
    price: 45000000,
    propertyType: "house",
    bedrooms: 3,
    bathrooms: 2,
    size: 2500,
    district: "Colombo",
    city: "Colombo 5"
  }
  
  try {
    const description = await service.generatePropertyDescription(sampleData)
    console.log('Generated description:', description)
    
    const title = await service.suggestPropertyTitle(sampleData)
    console.log('Suggested title:', title)
    
  } catch (error) {
    console.error('Content generation failed:', error)
  }
}

// Run the test
testAIPropertyExtraction().catch(console.error)