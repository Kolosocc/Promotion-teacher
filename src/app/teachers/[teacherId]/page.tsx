'use client'
import { CommentsSection } from '@/components/teacherDetails/CommentsSection'
import { RatingsSection } from '@/components/teacherDetails/RatingsSection'
import { TeacherDetails } from '@/components/teacherDetails/TeacherDetails'

const TeacherDetailsPage = () => {
  return (
    <div>
      <TeacherDetails />
      <CommentsSection />
      <RatingsSection />
    </div>
  )
}

export default TeacherDetailsPage
