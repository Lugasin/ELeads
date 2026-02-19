import React, { useState } from 'react';

interface SourceInputProps {
  onSubmit: (type: 'url' | 'pasted_text', value: string) => Promise<void>;
  isProcessing: boolean;
  canCreateSignal: boolean;
}

const SourceInput: React.FC<SourceInputProps> = ({ onSubmit, isProcessing, canCreateSignal }) => {
  const [inputType, setInputType] = useState<'url' | 'pasted_text'>('pasted_text');
  const [value, setValue] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim() || !canCreateSignal) return;

    await onSubmit(inputType, value.trim());
    setValue('');
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Add Signal Source</h2>

        <div className="mb-6">
          <p className="text-gray-600 mb-4">
            Paste public information or provide a URL to extract business signals.
            Only observable entities and contacts will be extracted - no hallucination.
          </p>

          {!canCreateSignal && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
              <p className="text-yellow-800">
                You've reached your monthly signal limit. Upgrade your plan to extract more signals.
              </p>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Source Type
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="pasted_text"
                  checked={inputType === 'pasted_text'}
                  onChange={(e) => setInputType(e.target.value as 'pasted_text')}
                  className="mr-2"
                />
                Pasted Text
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="url"
                  checked={inputType === 'url'}
                  onChange={(e) => setInputType(e.target.value as 'url')}
                  className="mr-2"
                />
                URL
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {inputType === 'url' ? 'URL' : 'Text Content'}
            </label>
            {inputType === 'url' ? (
              <input
                type="url"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="https://example.com/news/article"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            ) : (
              <textarea
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Paste public information here (news articles, company pages, etc.)"
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            )}
          </div>

          <button
            type="submit"
            disabled={!value.trim() || isProcessing || !canCreateSignal}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? 'Extracting Signals...' : 'Extract Signals'}
          </button>
        </form>

        <div className="mt-6 text-sm text-gray-500">
          <p className="mb-2"><strong>What happens next:</strong></p>
          <ol className="list-decimal list-inside space-y-1">
            <li>AI analyzes the content for observable business signals</li>
            <li>Extracts only explicitly mentioned entities and contacts</li>
            <li>Stores signals in your dashboard for analysis</li>
            <li>You can run AI analysis on individual signals</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default SourceInput;