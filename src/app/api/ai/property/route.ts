import { NextRequest, NextResponse } from 'next/server';
import { PropertyAIService } from '@/lib/ai/property-ai-service';
import { createProperty } from '@/lib/actions/property';
import { getCurrentUser } from '@/lib/appwrite/server';
import { PropertyFormValues } from '@/lib/schemas';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const userInput = formData.get('userInput') as string;
    const imageFile = formData.get('image') as File | null;
    
    if (!userInput) {
      return NextResponse.json(
        { error: 'User input is required' },
        { status: 400 }
      );
    }

    const propertyAI = new PropertyAIService();
    
    // Process image if provided
    let attachment = undefined;
    if (imageFile) {
      const buffer = await imageFile.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      attachment = {
        mimeType: imageFile.type,
        data: base64
      };
    }

    // Extract property data using AI
    const aiData = await propertyAI.extractPropertyData(userInput, attachment);
    
    if (Object.keys(aiData).length === 0) {
      return NextResponse.json(
        { error: 'Could not extract property information. Please provide more details.' },
        { status: 400 }
      );
    }

    // Validate extracted data
    const validation = propertyAI.validatePropertyData(aiData);
    if (!validation.isValid) {
      return NextResponse.json({
        error: 'Property data validation failed',
        details: validation.errors,
        data: aiData
      }, { status: 400 });
    }

    // Generate missing content if needed
    if (!aiData.description) {
      aiData.description = await propertyAI.generatePropertyDescription(aiData);
    }
    
    if (!aiData.title) {
      aiData.title = await propertyAI.suggestPropertyTitle(aiData);
    }

    // Convert to form data format
    const formDataValues = propertyAI.convertToFormData(aiData);
    
    // Create the property
    const result = await createProperty(formDataValues as PropertyFormValues);
    
    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Property created successfully via AI',
      data: {
        extractedData: aiData,
        generatedContent: {
          title: aiData.title,
          description: aiData.description
        }
      }
    });

  } catch (error) {
    console.error('AI Property Creation Error:', error);
    return NextResponse.json(
      { error: 'Failed to create property via AI' },
      { status: 500 }
    );
  }
}

// GET endpoint for AI suggestions
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type');
    const data = searchParams.get('data');

    if (!type || !data) {
      return NextResponse.json(
        { error: 'Type and data parameters are required' },
        { status: 400 }
      );
    }

    const propertyAI = new PropertyAIService();
    const parsedData = JSON.parse(data);

    let result;
    switch (type) {
      case 'title':
        result = await propertyAI.suggestPropertyTitle(parsedData);
        break;
      case 'description':
        result = await propertyAI.generatePropertyDescription(parsedData);
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid type. Use "title" or "description"' },
          { status: 400 }
        );
    }

    return NextResponse.json({ result });

  } catch (error) {
    console.error('AI Suggestion Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate AI suggestion' },
      { status: 500 }
    );
  }
}