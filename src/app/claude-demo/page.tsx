import ClaudeAssistant from '@/components/ClaudeAssistant';

// Sample order data for demonstration
const sampleOrderData = {
  orders: [
    {
      id: 1,
      items: [
        { name: 'Dragon Burger', price: 12.99, quantity: 2 },
        { name: 'Fries', price: 3.99, quantity: 1 }
      ],
      total: 29.97,
      timestamp: '2024-01-15T12:30:00Z',
      customer_type: 'regular'
    },
    {
      id: 2,
      items: [
        { name: 'Dragon Burger', price: 12.99, quantity: 1 },
        { name: 'Dragon Wings', price: 8.99, quantity: 2 }
      ],
      total: 30.97,
      timestamp: '2024-01-15T13:15:00Z',
      customer_type: 'new'
    },
    {
      id: 3,
      items: [
        { name: 'Veggie Dragon', price: 11.99, quantity: 1 },
        { name: 'Dragon Shake', price: 5.99, quantity: 1 }
      ],
      total: 17.98,
      timestamp: '2024-01-15T18:45:00Z',
      customer_type: 'regular'
    }
  ],
  summary: {
    total_orders: 3,
    total_revenue: 78.92,
    popular_items: ['Dragon Burger', 'Dragon Wings'],
    peak_hours: ['12:00-14:00', '18:00-20:00']
  }
};

export default function ClaudeDemoPage() {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Claude Sonnet Integration Demo
          </h1>
          <p className="text-lg text-gray-600">
            AI-powered insights for your restaurant management system
          </p>
        </div>
        
        <ClaudeAssistant orderData={sampleOrderData} />
        
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Note: Make sure to set your ANTHROPIC_API_KEY in .env.local</p>
        </div>
      </div>
    </div>
  );
}
