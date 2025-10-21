import ResetPassword from '@/components/auth/PassReset'
import React from 'react'
import { Suspense } from 'react'

const page = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPassword isPassReset={true} />
    </Suspense>
  )
}

export default page