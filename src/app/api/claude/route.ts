import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { prompt, context, orderData, type } = await request.json()

    let userContent = ''

    if (type === 'analyze' && orderData) {
      userContent = `Analyze this restaurant order data and provide insights:\n\n${JSON.stringify(orderData, null, 2)}\n\nPlease provide insights on:\n- Popular items\n- Peak ordering times\n- Customer preferences\n- Recommendations for menu optimization\n- Any notable patterns`
    } else {
      userContent = `You are an AI assistant for a restaurant management system.${context ? `\nContext: ${context}\n\n` : ''}\nQuestion: ${prompt}\n\nPlease provide helpful insights for restaurant operations, menu optimization, customer service, or business management.`
    }

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [{ role: 'user', content: userContent }],
    })

    const content = response.content[0].type === 'text' ? response.content[0].text : ''

    return NextResponse.json({ content, usage: response.usage })
  } catch (error) {
    console.error('Claude API error:', error)
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    )
  }
}
