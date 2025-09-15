// app/map/[id]/page.tsx
'use client'
import dynamic from 'next/dynamic';
import React, { use } from 'react'

const ArcGISMap = dynamic(() => import('@/components/map'), {
  ssr: false,  // Disable server-side rendering
  loading: () => <div className='text-2xl flex justify-center text-center px-80 py-80'>Loading map...</div>  // Loading state
});

interface PageProps {
  params: Promise<{
    id: string;
  }>
}

const page = ({ params }: PageProps) => {
  const { id: cropId } = use(params);

  return (
    <>
      <div className='w-dvw h-dvh'>
        <ArcGISMap
          apiKey={process.env.NEXT_PUBLIC_ARCGIS_API_KEY || ''}
          center={[101.9758, 4.2105]}
          zoom={12}
          basemap="arcgis/navigation"
          cropId={cropId}
        />
      </div>
    </>
  )
}

export default page