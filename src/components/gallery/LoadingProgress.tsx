'use client';

import { useEffect, useState } from 'react';

interface LoadingProgressProps {
  current: number;
  total: number;
  isInitialLoad?: boolean;
}

export default function LoadingProgress({ current, total, isInitialLoad }: LoadingProgressProps) {
  const [isVisible, setIsVisible] = useState(true);

  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
  const isComplete = current >= total && total > 0;

  // Hide the progress bar after completion with delay
  useEffect(() => {
    if (isComplete) {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(true);
    }
  }, [isComplete]);

  if (isInitialLoad) {
    return (
      <div className="mb-4 p-3 bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-gray-300 border-t-primary-500 rounded-full animate-spin" />
          <span className="text-sm text-gray-600">이미지 목록을 불러오는 중...</span>
        </div>
      </div>
    );
  }

  if (!isVisible || total === 0) {
    return null;
  }

  return (
    <div
      className={`mb-4 p-3 bg-white rounded-lg shadow-sm border border-gray-100 transition-all duration-500 ${
        isComplete ? 'opacity-0 transform -translate-y-2' : 'opacity-100'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {!isComplete && (
            <div className="w-4 h-4 border-2 border-gray-300 border-t-primary-500 rounded-full animate-spin" />
          )}
          {isComplete && (
            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )}
          <span className="text-sm text-gray-600">
            {isComplete ? '로딩 완료!' : '이미지 로딩 중...'}
          </span>
        </div>
        <span className="text-sm font-medium text-gray-700">
          {current} / {total}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ease-out ${
            isComplete ? 'bg-green-500' : 'bg-primary-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Percentage text */}
      <div className="mt-1 text-right">
        <span className="text-xs text-gray-500">{percentage}%</span>
      </div>
    </div>
  );
}
