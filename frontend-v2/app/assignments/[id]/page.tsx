import Sidebar from '@/components/Sidebar'
import AssignmentOutput from '@/components/AssignmentOutput'

interface AssignmentRoutePageProps {
  params: Promise<{
    id: string
  }>
}

export default async function AssignmentRoutePage({ params }: AssignmentRoutePageProps) {
  const { id } = await params

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <div className="w-64 fixed left-0 top-0 h-screen">
        <Sidebar />
      </div>

      <main className="flex-1 ml-64">
        <AssignmentOutput assignmentId={id} />
      </main>
    </div>
  )
}
