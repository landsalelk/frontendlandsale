# OpenRouter AI Integration for Landsale.lk

This document explains how to set up and use OpenRouter as your AI service provider for the AI chat widget.

## 🚀 **Setup Instructions**

### 1. **Get OpenRouter API Key**
1. Visit [OpenRouter.ai](https://openrouter.ai/)
2. Sign up for an account
3. Go to your [API Keys](https://openrouter.ai/keys) section
4. Create a new API key
5. Copy your API key

### 2. **Configure Environment Variables**
Update your `.env.local` file with your OpenRouter API key:

```bash
# AI Service Configuration - OpenRouter
NEXT_PUBLIC_OPENROUTER_API_KEY=your-actual-openrouter-api-key-here
# Optional: Set default model (defaults to Claude 3 Sonnet)
NEXT_PUBLIC_OPENROUTER_DEFAULT_MODEL=anthropic/claude-3-sonnet-20240229
```

### 3. **Available Models**
You can choose from these models:

**Anthropic Claude Models:**
- `anthropic/claude-3-sonnet-20240229` - Balanced performance (default)
- `anthropic/claude-3-opus-20240229` - Most capable
- `anthropic/claude-3-haiku-20240307` - Fastest

**OpenAI Models:**
- `openai/gpt-4` - Original GPT-4
- `openai/gpt-4-turbo` - Latest GPT-4
- `openai/gpt-3.5-turbo` - Cost-effective

**Open Source Models:**
- `meta-llama/llama-3-70b-instruct` - Llama 3 70B
- `meta-llama/llama-3-8b-instruct` - Llama 3 8B
- `mistralai/mixtral-8x7b-instruct` - Mixtral 8x7B

**Google Models:**
- `google/gemini-pro` - Gemini Pro
- `google/gemini-pro-vision` - Gemini Pro Vision

## 🎯 **Features**

### **Current Features:**
✅ **Text Chat** - Natural conversation with AI assistant
✅ **Image Analysis** - Analyze property images and documents
✅ **Property Search** - Query property listings from Appwrite
✅ **Location Data** - Access regions and cities from database
✅ **Model Selection** - Switch between different AI models
✅ **Streaming Responses** - Real-time response generation
✅ **Message History** - Contextual conversations

### **Enhanced Features with OpenRouter:**
🚀 **Multiple AI Providers** - Access to 100+ models
🚀 **Cost Optimization** - Choose models based on budget/needs
🚀 **Specialized Models** - Use vision models for image analysis
🚀 **Fallback Options** - Switch models if one is unavailable
🚀 **Performance Tuning** - Select models for speed vs quality

## 💡 **Usage Examples**

### **Basic Chat**
```typescript
const chatService = new ChatService();
const response = await chatService.sendMessage("Show me properties in Colombo");
console.log(response.text); // AI response with property listings
```

### **Image Analysis**
```typescript
const imageData = "base64-encoded-image-data";
const response = await chatService.sendMessage(
  "Analyze this property image",
  { mimeType: 'image/jpeg', data: imageData }
);
```

### **Model Switching**
```typescript
// Switch to GPT-4 for complex reasoning
chatService.setModel('GPT4');

// Switch to Claude for creative tasks
chatService.setModel('CLAUDE_3_OPUS');

// Switch to Llama for cost-effective responses
chatService.setModel('LLAMA_3_70B');
```

### **Streaming Responses**
```typescript
await chatService.sendMessageStream(
  "Tell me about the real estate market",
  (chunk) => {
    // Handle each chunk as it arrives
    console.log(chunk);
  }
);
```

## 🔧 **Architecture**

### **Service Structure:**
```
src/components/ai-chat/
├── services/
│   ├── openRouterService.ts      # Core OpenRouter API client
│   ├── chatServiceOpenRouter.ts  # Chat service implementation
│   └── chatService.ts            # Original Google Gemini service
├── components/
│   └── ModelSelector.tsx         # UI for model selection
├── AIChatWidget.tsx              # Main chat widget
└── types.ts                      # TypeScript definitions
```

### **Key Classes:**

**OpenRouterService** - Low-level API client
- Handles authentication and API calls
- Supports streaming and non-streaming responses
- Manages different model endpoints
- Error handling and retries

**ChatService** - High-level chat implementation
- Maintains conversation history
- Processes attachments (images, PDFs)
- Parses AI responses for special tags
- Integrates with Appwrite data

## 📊 **Model Comparison**

| Model | Speed | Quality | Cost | Best For |
|-------|-------|---------|------|----------|
| Claude 3 Haiku | 🟢 Fast | 🟡 Good | 🟢 Low | Quick responses |
| Claude 3 Sonnet | 🟡 Medium | 🟢 Great | 🟡 Medium | Balanced use |
| Claude 3 Opus | 🔴 Slow | 🟢 Excellent | 🔴 High | Complex reasoning |
| GPT-4 Turbo | 🟡 Medium | 🟢 Great | 🔴 High | General purpose |
| GPT-3.5 Turbo | 🟢 Fast | 🟡 Good | 🟢 Low | Cost-effective |
| Llama 3 70B | 🟡 Medium | 🟢 Great | 🟢 Medium | Open source |

## 🛠 **Troubleshooting**

### **Common Issues:**

**1. API Key Not Working**
- Verify your API key is correct
- Check if you have credits in your OpenRouter account
- Ensure the API key has proper permissions

**2. Model Not Responding**
- Try switching to a different model
- Check OpenRouter status page
- Verify model availability for your account

**3. Streaming Not Working**
- Check browser console for errors
- Ensure your API key supports streaming
- Try non-streaming mode first

**4. Image Analysis Issues**
- Verify image format (JPEG, PNG supported)
- Check image size (keep under 10MB)
- Use vision-capable models (Claude 3, GPT-4 Vision)

### **Debug Mode:**
Enable debug logging:
```typescript
// In your browser console
localStorage.setItem('debug:openrouter', 'true');
```

## 🔒 **Security Best Practices**

1. **Never commit API keys** to version control
2. **Use environment variables** for sensitive data
3. **Implement rate limiting** on client side
4. **Monitor API usage** and costs
5. **Use HTTPS** for all API calls
6. **Validate user inputs** before sending to AI

## 📈 **Cost Optimization**

### **Tips to Reduce Costs:**
- Use smaller models for simple queries
- Implement caching for frequent questions
- Set response length limits
- Use streaming for long responses
- Monitor usage patterns
- Set up billing alerts

### **Model Selection Strategy:**
```typescript
// Simple queries → Haiku/GPT-3.5
// Complex analysis → Sonnet/GPT-4
// Creative tasks → Opus/Claude-3-Opus
// Image analysis → Vision models
```

## 🔄 **Migration from Google Gemini**

The system maintains backward compatibility:
- Original `chatService.ts` still available
- Same interface for both services
- Easy to switch between providers
- No breaking changes to UI components

## 📚 **Additional Resources**

- [OpenRouter Documentation](https://openrouter.ai/docs)
- [Model Pricing](https://openrouter.ai/pricing)
- [API Reference](https://openrouter.ai/docs/api-reference)
- [Status Page](https://status.openrouter.ai/)
- [Community Discord](https://discord.gg/openrouter)

---

**Need help?** Contact support or check the troubleshooting section above.