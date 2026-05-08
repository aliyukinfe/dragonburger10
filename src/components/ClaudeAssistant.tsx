'use client';

import { useState } from 'react';

interface ClaudeAssistantProps {
  orderData?: any;
}

export default function ClaudeAssistant({ orderData }: ClaudeAssistantProps) {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerateInsight = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    setError('');
    setResponse('');

    try {
      const res = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'insight', prompt }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setResponse(data.content);
    } catch (err) {
      setError('Failed to generate insight. Please check your API key and try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeOrders = async () => {
    if (!orderData) return;

    setLoading(true);
    setError('');
    setResponse('');

    try {
      const res = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'analyze', orderData }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setResponse(data.content);
    } catch (err) {
      setError('Failed to analyze order data. Please check your API key and try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">AI Restaurant Assistant</h2>
      
      <div className="space-y-6">
        {/* Custom Prompt Section */}
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-3 text-gray-700">Ask for Restaurant Insights</h3>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., How can I improve customer satisfaction during peak hours?"
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={3}
          />
          <button
            onClick={handleGenerateInsight}
            disabled={loading || !prompt.trim()}
            className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Generating...' : 'Get Insight'}
          </button>
        </div>

        {/* Order Analysis Section */}
        {orderData && (
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3 text-gray-700">Analyze Order Data</h3>
            <button
              onClick={handleAnalyzeOrders}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Analyzing...' : 'Analyze Orders'}
            </button>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Response Display */}
        {response && (
          <div className="border rounded-lg p-4 bg-gray-50">
            <h3 className="text-lg font-semibold mb-3 text-gray-700">AI Response</h3>
            <div className="prose prose-sm max-w-none">
              <pre className="whitespace-pre-wrap text-gray-800 font-sans">
                {response}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
