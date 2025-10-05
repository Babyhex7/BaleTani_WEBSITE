import React from 'react';

/**
 * Komponen StatCard untuk menampilkan statistik di dashboard
 * Reusable card dengan icon, title, value dan trend
 */
const StatCard = ({ 
  title, 
  value, 
  icon, 
  trend, 
  trendValue,
  color = "green",
  onClick
}) => {
  const colorClasses = {
    green: {
      bg: "bg-green-50",
      icon: "text-green-600",
      text: "text-green-600"
    },
    blue: {
      bg: "bg-blue-50", 
      icon: "text-blue-600",
      text: "text-blue-600"
    },
    yellow: {
      bg: "bg-yellow-50",
      icon: "text-yellow-600", 
      text: "text-yellow-600"
    },
    red: {
      bg: "bg-red-50",
      icon: "text-red-600",
      text: "text-red-600"
    },
    purple: {
      bg: "bg-purple-50",
      icon: "text-purple-600",
      text: "text-purple-600"
    }
  };

  const currentColor = colorClasses[color] || colorClasses.green;

  return (
    <div 
      className={`bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200 ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
      onClick={onClick}
    >
      <div className="p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className={`w-12 h-12 ${currentColor.bg} rounded-lg flex items-center justify-center`}>
              <span className={`text-xl ${currentColor.icon}`}>
                {icon}
              </span>
            </div>
          </div>
          <div className="ml-4 flex-1">
            <p className="text-sm font-medium text-gray-500 truncate">
              {title}
            </p>
            <p className="text-2xl font-semibold text-gray-900">
              {value}
            </p>
            {trend && trendValue && (
              <div className="flex items-center mt-1">
                <span className={`text-sm font-medium ${
                  trend === 'up' ? 'text-green-600' : 
                  trend === 'down' ? 'text-red-600' : 
                  'text-gray-600'
                }`}>
                  {trend === 'up' && '↗ '}
                  {trend === 'down' && '↘ '}
                  {trend === 'stable' && '→ '}
                  {trendValue}
                </span>
                <span className="text-sm text-gray-500 ml-1">
                  dari bulan lalu
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatCard;