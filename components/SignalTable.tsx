import React from 'react';
import { Signal } from '../types';

interface SignalTableProps {
  signals: Signal[];
  onSelectSignal: (signal: Signal) => void;
  onAnalyzeSignal: (signalId: string, analysisType: 'intent' | 'seniority' | 'outreach') => Promise<void>;
  userRole: string;
}

const SignalTable: React.FC<SignalTableProps> = ({ signals, onSelectSignal, onAnalyzeSignal, userRole }) => {
  const canRunAIAnalysis = userRole !== 'free';

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
          Business Signals
        </h3>

        {signals.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No signals found. Add a source to extract signals.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Entity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Observed Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Source
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {signals.map((signal) => (
                  <tr key={signal.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {signal.entity_name || 'Unknown'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        signal.entity_type === 'person'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {signal.entity_type || 'unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {signal.observed_title && <div>Title: {signal.observed_title}</div>}
                        {signal.observed_company && <div>Company: {signal.observed_company}</div>}
                        {signal.observed_location && <div>Location: {signal.observed_location}</div>}
                        {signal.observed_contact && <div>Contact: {signal.observed_contact}</div>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 max-w-xs truncate">
                        {signal.source_excerpt || 'No excerpt available'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(signal.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => onSelectSignal(signal)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View
                        </button>

                        {canRunAIAnalysis && (
                          <div className="relative inline-block text-left">
                            <select
                              onChange={(e) => {
                                if (e.target.value) {
                                  onAnalyzeSignal(signal.id, e.target.value as 'intent' | 'seniority' | 'outreach');
                                  e.target.value = '';
                                }
                              }}
                              className="text-indigo-600 hover:text-indigo-900 text-sm border-none bg-transparent"
                              defaultValue=""
                            >
                              <option value="" disabled>Analyze</option>
                              <option value="intent">Intent</option>
                              <option value="seniority">Seniority</option>
                              <option value="outreach">Outreach</option>
                            </select>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!canRunAIAnalysis && signals.length > 0 && (
          <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <p className="text-yellow-800 text-sm">
              AI analysis is available on Pro and Enterprise plans. Upgrade to analyze signals for intent, seniority, and outreach assistance.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SignalTable;