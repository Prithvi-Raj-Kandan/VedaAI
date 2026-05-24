'use client'

import dynamic from 'next/dynamic'

const AssignmentOutput = dynamic(() => import('@/components/AssignmentOutput'), {
  ssr: false,
})

export default function OutputClient() {
  return <AssignmentOutput />
}
