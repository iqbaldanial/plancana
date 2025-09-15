'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ArcGISMap from '@/components/geolocation';
import { useSession } from 'next-auth/react';

type WeatherData = {
  main: string;
  description: string;
  temp: number;
} | null;

type Weather = {
  id: number;
  temperature: number;
  main: string;
  description: string;
  humidity: number;
  windSpeed: number;
  recordedAt: string;
};

type Stage = {
  id: number;
  cropId: number;
  role: string;
  lat: number;
  lng: number;
  order: number;
  weather?: Weather[];
};

type Crop = {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  stages: Stage[];
};

export default function BatchListPage() {
  const [crops, setCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCropId, setSelectedCropId] = useState<number | null>(null);
  const [newStage, setNewStage] = useState({
    role: '',
    lat: '',
    lng: ''
  });
  const [stageWeather, setStageWeather] = useState<WeatherData>(null);
  const [addingStage, setAddingStage] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchCrops();
  }, []);

  const fetchWeather = async (lat: string, lng: string) => {
    if (!lat || !lng) return null;
    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY}&units=metric`
      );
      const data = await res.json();
      if (data.cod !== 200) return null;
      return {
        main: data.weather?.[0]?.main,
        description: data.weather?.[0]?.description,
        temp: data.main?.temp
      };
    } catch (err) {
      console.error('Weather fetch failed:', err);
      return null;
    }
  };

  useEffect(() => {
    const updateStageWeather = async () => {
      const weatherData = await fetchWeather(newStage.lat, newStage.lng);
      setStageWeather(weatherData);
    };
    updateStageWeather();
  }, [newStage.lat, newStage.lng]);

  const fetchCrops = () => {
    fetch('/api/crop')
      .then(res => res.json())
      .then(data => {
        setCrops(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch crops:', err);
        setLoading(false);
      });
  };

  const handleViewCrop = (id: number) => {
    router.push(`/map/${id}`);
  };

  const handleAddLocation = (cropId: number) => {
    setSelectedCropId(cropId);
    setShowAddModal(true);
    setNewStage({ role: '', lat: '', lng: '' });
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setSelectedCropId(null);
    setNewStage({ role: '', lat: '', lng: '' });
    setStageWeather(null);
  };

  const handleSubmitNewStage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCropId || !newStage.role || !newStage.lat || !newStage.lng) {
      alert('Please fill in all fields');
      return;
    }

    setAddingStage(true);

    try {
      const response = await fetch(`/api/crop/${selectedCropId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role: newStage.role,
          lat: parseFloat(newStage.lat),
          lng: parseFloat(newStage.lng),
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Stage added successfully:', result);
        
        // Refresh the crops list
        fetchCrops();
        
        // Close modal
        handleCloseModal();
        
        alert('New stage added successfully!');
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error adding stage:', error);
      alert('Failed to add new stage. Please try again.');
    } finally {
      setAddingStage(false);
    }
  };

  const renderWeatherInfo = (data: WeatherData) => {
    if (!data) return <p className="text-gray-500 italic">No weather data</p>;
    return (
      <div className="text-sm text-gray-800 space-y-1">
        <p><strong>{data.main}</strong> — {data.description}</p>
        <p>🌡 {data.temp}°C</p>
      </div>
    );
  };

  if (loading) return <p className="text-center p-4">Loading...</p>;

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white">
      <h1 className="text-3xl font-bold mb-6 text-green-800">Batch List</h1>

      {crops.length === 0 ? (
        <p>No batches found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 border border-gray-300 shadow-md">
            <thead className="bg-green-800 text-white">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">Batch ID</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Name</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Description</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Created At</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Stages</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {crops.map((crop, index) => (
                <tr key={crop.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-700">{index + 1}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{crop.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{crop.description}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {new Date(crop.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    <ol className="list-decimal list-inside space-y-1">
                      {crop.stages
                        .sort((a, b) => a.order - b.order)
                        .map(stage => (
                          <li key={stage.id}>
                            <span className="font-semibold">{stage.role}</span> — Lat: {stage.lat.toFixed(4)}, Lng: {stage.lng.toFixed(4)}
                          </li>
                        ))}
                    </ol>
                  </td>
                  <td className="px-4 py-3 text-sm space-y-2">
                    <div className="flex flex-col space-y-1">
                      <button
                        onClick={() => handleViewCrop(crop.id)}
                        className="bg-green-800 hover:bg-green-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors duration-200"
                      >
                        View Map
                      </button>
                      <button
                        onClick={() => handleAddLocation(crop.id)}
                        className="bg-green-800 hover:bg-green-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors duration-200"
                      >
                        Add Location
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Location Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-green-800 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-gray-800">
              Add New Stage to Crop ID: {selectedCropId}
            </h2>
            
            <form onSubmit={handleSubmitNewStage}>
              <div className="mb-4">
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                  Role/Stage Type
                </label>
                <select
                  id="role"
                  value={newStage.role}
                  onChange={(e) => setNewStage({ ...newStage, role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a role</option>
                  <option value="farmer">Farmer</option>
                  <option value="processor">Processor</option>
                  <option value="distributor">Distributor</option>
                  <option value="retailer">Retailer</option>
                  <option value="warehouse">Warehouse</option>
                  <option value="transport">Transport Hub</option>
                </select>
              </div>

              <div className="mb-6">
                <div className="flex gap-6 items-start">
                  <div className="flex-1">
                    <ArcGISMap
                      label={`${newStage.role ? newStage.role.charAt(0).toUpperCase() + newStage.role.slice(1) : 'Stage'} Location`}
                      latField="lat"
                      lngField="lng"
                      form={newStage}
                      setForm={setNewStage}
                    />
                  </div>
                  <div className="mt-5 w-48 h-32 border rounded p-3 bg-blue-100">
                    <h4 className="font-semibold text-sm mb-2">Weather Info</h4>
                    {renderWeatherInfo(stageWeather)}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200"
                  disabled={addingStage}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-800 text-white rounded-md hover:bg-green-700 transition-colors duration-200 disabled:opacity-50"
                  disabled={addingStage}
                >
                  {addingStage ? 'Adding...' : 'Add Stage'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}