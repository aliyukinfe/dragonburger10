import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ClaudeResponse {
  content: string;
  usage?: {
    input_tokens: number;
    output_tokens: number;
  };
}

export async function generateClaudeResponse(
  messages: ClaudeMessage[],
  model: string = 'claude-3-5-sonnet-20241022'
): Promise<ClaudeResponse> {
  try {
    const response = await anthropic.messages.create({
      model,
      max_tokens: 1024,
      messages,
    });

    return {
      content: response.content[0].type === 'text' ? response.content[0].text : '',
      usage: {
        input_tokens: response.usage.input_tokens,
        output_tokens: response.usage.output_tokens,
      },
    };
  } catch (error) {
    console.error('Claude API Error:', error);
    throw new Error('Failed to generate response from Claude');
  }
}

export async function generateRestaurantInsight(
  prompt: string,
  context?: string
): Promise<string> {
  const messages: ClaudeMessage[] = [
    {
      role: 'user',
      content: `You are an AI assistant for a restaurant management system. 
      ${context ? `Context: ${context}\n\n` : ''}
      Question: ${prompt}
      
      Please provide helpful insights for restaurant operations, menu optimization, customer service, or business management.`,
    },
  ];

  const response = await generateClaudeResponse(messages);
  return response.content;
}

export async function analyzeOrderData(orderData: any): Promise<string> {
  const messages: ClaudeMessage[] = [
    {
      role: 'user',
      content: `Analyze this restaurant order data and provide insights:
      
      ${JSON.stringify(orderData, null, 2)}
      
      Please provide insights on:
      - Popular items
      - Peak ordering times
      - Customer preferences
      - Recommendations for menu optimization
      - Any notable patterns`,
    },
  ];

  const response = await generateClaudeResponse(messages);
  return response.content;
}
