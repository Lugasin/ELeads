import React from 'react';
import { Signal } from '../types';

interface SignalDashboardProps {
  signals: Signal[];
  monthlyCount: number;
  userRole: string;
}

const SignalDashboard: React.FC<SignalDashboardProps> = ({ signals, monthlyCount, userRole }) => {
  const recentSignals = signals.slice(0, 5);
  const totalSignals = signals.length;

  const getRoleLimit = (role: string) => {
    switch (role) {
      case 'free': return 10;
      case 'pro': return 500;
      case 'enterprise': return -1; // unlimited
      case 'admin': return -1;
      default: return 10;
    }
  };

  const limit = getRoleLimit(userRole);
  const usagePercentage = limit > 0 ? (monthlyCount / limit) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Usage Stats */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-bold">S</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Signals This Month
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {monthlyCount} {limit > 0 ? `/ ${limit}` : ''}
                  </dd>
                </dl>
              </div>
            </div>
            {limit > 0 && (
              <div className="mt-3">
                <div className="bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${usagePercentage > 90 ? 'bg-red-500' : usagePercentage > 70 ? 'bg-yellow-500' : 'bg-blue-500'}`}
                    style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Total Signals */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-bold">T</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Signals
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {totalSignals}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Plan Info */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-bold">P</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Current Plan
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 capitalize">
                    {userRole}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Signals */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Recent Signals
          </h3>

          {recentSignals.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No signals yet. Add a source to get started.
            </p>
          ) : (
            <div className="space-y-3">
              {recentSignals.map((signal) => (
                <div key={signal.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {signal.entity_name || 'Unknown Entity'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {signal.entity_type} • {signal.observed_title || 'No title'} • {signal.observed_company || 'No company'}
                    </p>
                    {signal.source_excerpt && (
                      <p className="text-xs text-gray-400 mt-1 truncate">
                        {signal.source_excerpt}
                      </p>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(signal.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Getting Started */}
      {totalSignals === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-2">
            Getting Started
          </h3>
          <div className="text-blue-800 space-y-2">
            <p>1. Go to the "Add Source" tab</p>
            <p>2. Paste public information or provide a URL</p>
            <p>3. AI will extract observable business signals</p>
            <p>4. Analyze signals for intent, seniority, or outreach assistance</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignalDashboard;