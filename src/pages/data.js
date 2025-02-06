// pages/data.js
import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const DataPage = () => {
    const [file, setFile] = useState(null)
    const [layerName, setLayerName] = useState('')
    const [temporalType, setTemporalType] = useState('')
    const [timePeriod, setTimePeriod] = useState('')
    const [status, setStatus] = useState('')

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0]
        setFile(selectedFile)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setStatus('Uploading...')

        try {
            const reader = new FileReader()
            reader.onload = async (e) => {
                const geojsonData = JSON.parse(e.target.result)
                
                const response = await fetch('/api/layers', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        layerName,
                        temporalType,
                        timePeriod,
                        geojsonData
                    }),
                })

                if (!response.ok) {
                    throw new Error('Upload failed')
                }

                setStatus('Upload successful!')
                // Reset form
                setFile(null)
                setLayerName('')
                setTemporalType('')
                setTimePeriod('')
            }

            reader.readAsText(file)
        } catch (error) {
            console.error('Error:', error)
            setStatus('Error uploading file: ' + error.message)
        }
    }

    return (
        <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow">
                <h1 className="text-2xl font-bold mb-6">Upload GeoJSON Layer</h1>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            GeoJSON File
                        </label>
                        <input
                            type="file"
                            accept=".geojson,application/json"
                            onChange={handleFileChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Layer Name
                        </label>
                        <input
                            type="text"
                            value={layerName}
                            onChange={(e) => setLayerName(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            placeholder="e.g., wave_height"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Temporal Type
                        </label>
                        <select
                            value={temporalType}
                            onChange={(e) => setTemporalType(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            required
                        >
                            <option value="">Select type...</option>
                            <option value="current">Current</option>
                            <option value="monthly_average">Monthly Average</option>
                            <option value="historical">Historical</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Time Period
                        </label>
                        <input
                            type="text"
                            value={timePeriod}
                            onChange={(e) => setTimePeriod(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            placeholder="e.g., january_2024"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={!file}
                        className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:bg-gray-400"
                    >
                        Upload Layer
                    </button>
                </form>

                {status && (
                    <div className="mt-4 p-4 rounded-md bg-gray-50">
                        {status}
                    </div>
                )}
            </div>
        </div>
    )
}

export default DataPage