import React from 'react';
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/solid';

/**
 * StatCard - Reusable component untuk menampilkan statistik
 * @param {string} title - Judul stat
 * @param {string|number} value - Nilai stat
 * @param {string} trend - Trend percentage (e.g., "+12%")
 * @param {string} trendDirection - "up" | "down"
 * @param {React.Component} icon - Hero Icon component
 * @param {string} iconBgColor - Background color untuk icon (e.g., "bg-blue-100")
 * @param {string} iconColor - Text color untuk icon (e.g., "text-blue-600")
 */
const StatCardNew = ({ 
  title, 
  value, 
  trend, 
  trendDirection = 'up',
  icon: Icon,
  iconBgColor = 'bg-blue-100',
  iconColor = 'text-blue-600',
  description
}) => {
  const isPositiveTrend = trendDirection === 'up';
  
  return (
    <div className="admin-stat-card">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="admin-stat-label truncate" title={title}>{title}</p>
          <h3 className="admin-stat-value break-words">{value}</h3>
          
          {trend && (
            <div className="admin-stat-trend">
              <span className={`flex items-center gap-1 flex-shrink-0 ${
                isPositiveTrend ? 'text-green-600' : 'text-red-600'
              }`}>
                {isPositiveTrend ? (
                  <ArrowTrendingUpIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                ) : (
                  <ArrowTrendingDownIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                )}
                <span className="whitespace-nowrap">{trend}</span>
              </span>
              {description && (
                <span className="text-xs text-gray-500 truncate" title={description}>{description}</span>
              )}
            </div>
          )}
        </div>

        {/* Icon */}
        {Icon && (
          <div className={`admin-stat-icon-wrapper flex-shrink-0 ${iconBgColor}`}>
            <Icon className={`admin-stat-icon ${iconColor}`} />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCardNew;
