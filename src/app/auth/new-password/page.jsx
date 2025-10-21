import NewPassword from '@/components/auth/NewPass'
import React from 'react'
import { Suspense } from 'react'

const page = () => {
  return  (
    <Suspense fallback={<div>Loading...</div>}>
    <NewPassword />
    </Suspense>
  )
}

export default page