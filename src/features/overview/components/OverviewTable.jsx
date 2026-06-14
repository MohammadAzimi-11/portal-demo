/**
 * OverviewTable.jsx
 * Renders aggregated class/subject overview with status and actions
 */
import StatusBadge from './StatusBadge'
import SubjectActions from './SubjectActions'

const OverviewTable = ({ data, onRefresh }) => {
  if (!data || data.length === 0) {
    return <div className="text-center py-8 text-gray-500">No classes found</div>
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {data.map((item) => (
        <div key={item.class.id} className="bg-white rounded-lg shadow overflow-hidden">
          {/* Class Header */}
          <div className="bg-gray-50 px-4 py-4 border-b sm:px-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <h3 className="text-lg font-medium text-gray-900">
                  {item.class.cycle.name} - Class #{item.class.id}
                </h3>
                <p className="text-sm text-gray-600">
                  {item.class.location.name} • {item.class.teacher.name} {item.class.teacher.lastname}
                </p>
              </div>
              <div className="text-left text-sm text-gray-600 sm:text-right">
                <p>{new Date(item.class.start_date).toLocaleDateString()} - {new Date(item.class.end_date).toLocaleDateString()}</p>
                <p>{item.class.time_start} - {item.class.time_end}</p>
              </div>
            </div>
          </div>

          {/* Subjects Table */}
          <div className="overflow-x-auto">
            <table className="min-w-[720px] divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subject
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Start Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    End Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {item.subjects.map((subjectItem) => (
                  <tr key={subjectItem.subject.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{subjectItem.subject.name}</div>
                      {subjectItem.subject.duration && (
                        <div className="text-xs text-gray-500">{subjectItem.subject.duration} hours</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={subjectItem.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {subjectItem.date_start
                        ? new Date(subjectItem.date_start).toLocaleDateString()
                        : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {subjectItem.date_end
                        ? new Date(subjectItem.date_end).toLocaleDateString()
                        : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <SubjectActions
                        subjectActivateId={subjectItem.activation?.id}
                        currentStatus={subjectItem.status}
                        onActionComplete={onRefresh}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  )
}

export default OverviewTable
