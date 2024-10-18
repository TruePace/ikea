import dynamic from 'next/dynamic'
import { Suspense } from 'react'

const ProfileContent = dynamic(() => import('./Header/ProfileContent/ProfileContent'), {
  loading: () => <div>Loading...</div>,
  suspense: true,
})

const ProfilePage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProfileContent />
    </Suspense>
  )
}

export default ProfilePage