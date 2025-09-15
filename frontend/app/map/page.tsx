// app/map/page.tsx
'use client'
<<<<<<<< HEAD:dev/app/(client page)/map/page.tsx

import { auth } from '@/app/api/auth/auth';
import { redirect } from 'next/dist/server/api-utils';
========
>>>>>>>> ad81a828e761fd10b7114e5f3ce519b00e3b18c5:frontend/app/map/page.tsx
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
