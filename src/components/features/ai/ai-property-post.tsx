"use client"

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Sparkles, Upload, Mic } from 'lucide-react'
import { toast } from 'sonner'
import { PropertyFormValues } from '@/lib/schemas'

interface AIPropertyPostProps {
  onPropertyCreated?: (propertyData: PropertyFormValues) => void
}

export function AIPropertyPost({ onPropertyCreated }: AIPropertyPostProps) {
  const [userInput, setUserInput] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [extractedData, setExtractedData] = useState<any>(null)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedImage(file)
      toast.success('Image selected for AI analysis')
    }
  }

  const handleSubmit = async () => {
    if (!userInput.trim()) {
      toast.error('Please describe your property')
      return
    }

    setIsProcessing(true)
    
    try {
      const formData = new FormData()
      formData.append('userInput', userInput)
      if (selectedImage) {
        formData.append('image', selectedImage)
      }

      const response = await fetch('/api/ai/property', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        if (result.details) {
          toast.error(`Validation errors: ${result.details.join(', ')}`)
          setExtractedData(result.data)
        } else {
          toast.error(result.error || 'Failed to process property data')
        }
        return
      }

      toast.success('Property created successfully via AI!')
      setExtractedData(result.data.extractedData)
      
      if (onPropertyCreated) {
        // Convert AI data back to form format for preview/editing
        onPropertyCreated(result.data.extractedData)
      }

      // Reset form
      setUserInput('')
      setSelectedImage(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

    } catch (error) {
      console.error('AI Property Post Error:', error)
      toast.error('Failed to create property via AI')
    } finally {
      setIsProcessing(false)
    }
  }

  const examplePrompts = [
    "3-bedroom house in Colombo 5, 2500 sqft, budget 45 million, has garden and parking",
    "Luxury apartment near Galle Road, 2 beds, sea view, modern amenities, price negotiable",
    "Commercial building in Kandy, suitable for office, 5000 sqft, central location",
    "Land for sale in Rajagiriya, 20 perches, residential area, clear title"
  ]

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-500" />
          AI Property Assistant
        </CardTitle>
        <CardDescription>
          Describe your property in natural language and our AI will create a listing for you
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Property Description</label>
          <Textarea
            placeholder="Describe your property... (e.g., 3-bedroom house in Colombo 5 with garden and parking, asking price 45 million)"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            className="min-h-[100px]"
            disabled={isProcessing}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Optional: Upload Property Image</label>
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
              disabled={isProcessing}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              {selectedImage ? 'Change Image' : 'Add Image'}
            </Button>
            {selectedImage && (
              <span className="text-sm text-muted-foreground">
                {selectedImage.name}
              </span>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Example Prompts</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {examplePrompts.map((prompt, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setUserInput(prompt)}
                className="text-left p-3 text-sm bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                disabled={isProcessing}
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        <Button 
          onClick={handleSubmit}
          disabled={isProcessing || !userInput.trim()}
          className="w-full"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating Property...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Create Property with AI
            </>
          )}
        </Button>

        {extractedData && (
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Extracted Property Data:</h4>
            <pre className="text-xs bg-background p-2 rounded overflow-auto max-h-40">
              {JSON.stringify(extractedData, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  )
}