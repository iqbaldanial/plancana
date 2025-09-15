// /pages/api/weather/update.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST allowed' });
  }

  const { cropStageId } = req.body;

  if (!cropStageId) {
    return res.status(400).json({ message: 'Missing cropStageId' });
  }

  try {
    const cropStage = await prisma.cropStage.findUnique({
      where: { id: Number(cropStageId) },
    });

    if (!cropStage) {
      return res.status(404).json({ message: 'CropStage not found' });
    }

    const { lat, lng } = cropStage;

    const weatherRes = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
      params: {
        lat,
        lon: lng,
        appid: OPENWEATHER_API_KEY,
        units: 'metric',
      },
    });

    const weather = weatherRes.data;

    const saved = await prisma.weather.create({
      data: {
        cropStageId: cropStage.id,
        main: weather.weather[0].main,
        description: weather.weather[0].description,
        temperature: weather.main.temp,
        humidity: weather.main.humidity,
        windSpeed: weather.wind.speed,
      },
    });

    return res.status(200).json({ message: 'Weather stored', data: saved });
  } catch (error) {
    console.error('Weather API error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
