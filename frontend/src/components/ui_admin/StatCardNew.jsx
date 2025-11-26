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
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="admin-stat-label">{title}</p>
          <h3 className="admin-stat-value">{value}</h3>
          
          {trend && (
            <div className="admin-stat-trend">
              <span className={`flex items-center gap-1 ${
                isPositiveTrend ? 'text-green-600' : 'text-red-600'
              }`}>
                {isPositiveTrend ? (
                  <ArrowTrendingUpIcon className="w-4 h-4" />
                ) : (
                  <ArrowTrendingDownIcon className="w-4 h-4" />
                )}
                {trend}
              </span>
              {description && (
                <span className="text-xs text-gray-500">{description}</span>
              )}
            </div>
          )}
        </div>

        {/* Icon */}
        {Icon && (
          <div className={`admin-stat-icon-wrapper ${iconBgColor}`}>
            <Icon className={`admin-stat-icon ${iconColor}`} />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCardNew;
