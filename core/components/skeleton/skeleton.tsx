import * as Skeleton from '@/vibes/soul/primitives/skeleton';

export default function DashboardSkeleton() {
  return (
    <div className="w-full min-h-screen bg-white p-8">
      <div className="animate-pulse w-full">
        {/* Hero Section Skeleton */}
        <div className="w-full h-96 bg-gray-200 rounded-lg mb-8 border border-gray-200">
          <div className="h-full w-full flex items-center justify-center">
            <Skeleton.Box className="h-full w-full bg-gray-300" />
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Title */}
          <div className="h-12 w-3/4 bg-gray-300 rounded-md"></div>
          
          {/* Description */}
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/5"></div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-100 rounded-lg p-4 border border-gray-200">
                <div className="h-6 w-3/4 bg-gray-300 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}



