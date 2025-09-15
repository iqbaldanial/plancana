// app/map/page.tsx
'use client'
import { auth } from '@/auth';
import { redirect } from 'next/dist/server/api-utils';
// import ArcGISMap from '@/components/map'
import dynamic from 'next/dynamic';

import React from 'react'

const ArcGISMap = dynamic(() => import('@/components/map'), {
  ssr: false,  // Disable server-side rendering
  loading: () => <div className='text-2xl flex justify-center text-center px-80 py-80'>Loading map...</div>  // Loading state
});

const page = () => {
  return (
    <>
    <div className='w-dvw h-dvh'>
      <ArcGISMap
        apiKey={process.env.NEXT_PUBLIC_ARCGIS_API_KEY || ''}
        center = {[101.9758, 4.2105]}
        zoom = {12}
        basemap = "arcgis/navigation"
      />
    </div>
    </>
  )
}

export default page
