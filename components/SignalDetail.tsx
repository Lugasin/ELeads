import React from 'react';
import { Signal, AIAnalysis } from '../types';

interface SignalDetailProps {
  signal: Signal;
  onClose: () => void;
  onAnalyze: (signalId: string, analysisType: 'intent' | 'seniority' | 'outreach') => Promise<void>;
  userRole: string;
}

const SignalDetail: React.FC<SignalDetailProps> = ({ signal, onClose, onAnalyze, userRole }) => {
  const canRunAIAnalysis = userRole !== 'free';
  const analyses = signal.ai_analysis || [];

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Signal Details
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <span className="text-2xl">&times;</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Signal Information */}
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-3">Signal Information</h4>
            <dl className="space-y-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Entity Name</dt>
                <dd className="text-sm text-gray-900">{signal.entity_name || 'Not specified'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Entity Type</dt>
                <dd className="text-sm text-gray-900 capitalize">{signal.entity_type || 'Unknown'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Observed Title</dt>
                <dd className="text-sm text-gray-900">{signal.observed_title || 'Not specified'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Observed Company</dt>
                <dd className="text-sm text-gray-900">{signal.observed_company || 'Not specified'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Observed Location</dt>
                <dd className="text-sm text-gray-900">{signal.observed_location || 'Not specified'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Observed Contact</dt>
                <dd className="text-sm text-gray-900">{signal.observed_contact || 'Not specified'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Source URL</dt>
                <dd className="text-sm text-gray-900">
                  {signal.source_url ? (
                    <a href={signal.source_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                      {signal.source_url}
                    </a>
                  ) : 'Not available'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Created</dt>
                <dd className="text-sm text-gray-900">{new Date(signal.created_at).toLocaleString()}</dd>
              </div>
            </dl>
          </div>

          {/* Source Excerpt */}
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-3">Source Excerpt</h4>
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="text-sm text-gray-700">
                {signal.source_excerpt || 'No excerpt available'}
              </p>
            </div>

            {/* AI Analysis Section */}
            {canRunAIAnalysis && (
              <div className="mt-6">
                <h4 className="text-md font-medium text-gray-900 mb-3">AI Analysis</h4>

                {analyses.length === 0 ? (
                  <p className="text-gray-500 text-sm mb-3">No analysis performed yet.</p>
                ) : (
                  <div className="space-y-3 mb-3">
                    {analyses.map((analysis) => (
                      <div key={analysis.id} className="bg-blue-50 p-3 rounded-md">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-sm font-medium text-blue-900 capitalize">
                            {analysis.analysis_type} Analysis
                          </span>
                          <span className="text-xs text-blue-600">
                            {new Date(analysis.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="text-sm text-blue-800">
                          {typeof analysis.content === 'object' ? (
                            <pre className="whitespace-pre-wrap text-xs">
                              {JSON.stringify(analysis.content, null, 2)}
                            </pre>
                          ) : (
                            <p>{String(analysis.content)}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex space-x-2">
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        onAnalyze(signal.id, e.target.value as 'intent' | 'seniority' | 'outreach');
                        e.target.value = '';
                      }
                    }}
                    className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    defaultValue=""
                  >
                    <option value="" disabled>Run Analysis</option>
                    <option value="intent">Intent Analysis</option>
                    <option value="seniority">Seniority Analysis</option>
                    <option value="outreach">Outreach Assistance</option>
                  </select>
                </div>
              </div>
            )}

            {!canRunAIAnalysis && (
              <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <p className="text-yellow-800 text-sm">
                  AI analysis is available on Pro and Enterprise plans. Upgrade to unlock intent analysis, seniority assessment, and outreach assistance.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignalDetail;