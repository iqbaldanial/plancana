'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ArcGISMap from '@/components/geolocation';

type WeatherData = {
  main: string;
  description: string;
  temp: number;
} | null;

export default function AddCropPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    description: '',
    farmerLat: '',
    farmerLng: '',
    processorLat: '',
    processorLng: ''
  });

  const [weather, setWeather] = useState<{
    farmer: WeatherData;
    processor: WeatherData;
  }>({
    farmer: null,
    processor: null
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

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
    const updateFarmerWeather = async () => {
      const weatherData = await fetchWeather(form.farmerLat, form.farmerLng);
      setWeather(prev => ({ ...prev, farmer: weatherData }));
    };
    updateFarmerWeather();
  }, [form.farmerLat, form.farmerLng]);

  useEffect(() => {
    const updateProcessorWeather = async () => {
      const weatherData = await fetchWeather(form.processorLat, form.processorLng);
      setWeather(prev => ({ ...prev, processor: weatherData }));
    };
    updateProcessorWeather();
  }, [form.processorLat, form.processorLng]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/crop', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name,
        description: form.description,
        farmerLat: parseFloat(form.farmerLat),
        farmerLng: parseFloat(form.farmerLng),
        processorLat: parseFloat(form.processorLat),
        processorLng: parseFloat(form.processorLng),
      }),
    });

    const result = await res.json();
    console.log("API response:", result);

    if (!res.ok) {
      alert("Error: " + result.error);
      return;
    }

    router.push(`/map/${result.crop.id}`);
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

  return (
    <div className="min-h-screen w-full px-30 py-10 bg-white">
      <h1 className="text-2xl font-bold mb-4 text-green-800">Add Crop Route</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <input name="name" placeholder="Crop Name" value={form.name} onChange={handleChange} className="w-full border p-2" required />
        <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} className="w-full border p-2" required />

        {/* Farmer Section */}
        <div>
          <div className="flex gap-6 items-start">
            <div className="flex-1">
              <ArcGISMap
                label="Farmer Location"
                latField="farmerLat"
                lngField="farmerLng"
                form={form}
                setForm={setForm}
              />
            </div>
            <div className="mt-5 w-40 h-65 border rounded p-2 bg-blue-300">
              {renderWeatherInfo(weather.farmer)}
            </div>
          </div>
        </div>

        {/* Processor Section */}
        <div>
          <div className="flex gap-6 items-start">
            <div className="flex-1">
              <ArcGISMap
                label="Processor Location"
                latField="processorLat"
                lngField="processorLng"
                form={form}
                setForm={setForm}
              />
            </div>
            <div className="mt-5 w-40 h-65 border rounded p-2 bg-blue-300">
              {renderWeatherInfo(weather.processor)}
            </div>
          </div>
        </div>

        <button type="submit" className="bg-green-800 text-white px-4 py-2 rounded">Submit</button>
      </form>
    </div>
  );
}
