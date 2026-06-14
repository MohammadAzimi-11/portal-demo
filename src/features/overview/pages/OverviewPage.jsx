/**
 * OverviewPage.jsx
 * Main teacher dashboard showing all classes and their subject statuses
 */
import { useState, useEffect } from 'react'
import { getOverview } from '../api/overviewApi'
import OverviewTable from '../components/OverviewTable'

const OverviewPage = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchOverview = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await getOverview()
      setData(response.data)
    } catch (err) {
      setError(err.message || 'Failed to load overview')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOverview()
  }, [])

  return (
    <div className="p-3 sm:p-4 lg:p-6">
      <div className="mb-4 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Subject Overview</h1>
        <button
          onClick={fetchOverview}
          className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 sm:w-auto"
        >
          Refresh
        </button>
      </div>

      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {!loading && !error && <OverviewTable data={data} onRefresh={fetchOverview} />}
    </div>
  )
}

export default OverviewPage
