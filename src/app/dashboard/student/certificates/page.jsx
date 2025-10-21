import Certificates from '@/components/dashboard/Certificates';

import React from 'react'

const page = () => {
  const certificates = [];
  return (
    <Certificates certificates={certificates} />
  )
}

export default page