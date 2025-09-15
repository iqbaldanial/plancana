// api/crop
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import axios from "axios";

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY!;

export async function POST(req: Request) {
  const body = await req.json();

  const {
    name,
    description,
    farmerLat,
    farmerLng,
    processorLat,
    processorLng,
  } = body;

  if (
    !name ||
    !description ||
    farmerLat == null || isNaN(farmerLat) ||
    farmerLng == null || isNaN(farmerLng) ||
    processorLat == null || isNaN(processorLat) ||
    processorLng == null || isNaN(processorLng)
  ) {
    return NextResponse.json({ error: "Missing or invalid fields" }, { status: 400 });
  }

  try {
    // 1. Create crop with two stages
    const crop = await prisma.crop.create({
      data: {
        name,
        description,
        stages: {
          create: [
            { role: "farmer", lat: farmerLat, lng: farmerLng, order: 0 },
            { role: "processor", lat: processorLat, lng: processorLng, order: 1 },
          ],
        },
      },
      include: { stages: true },
    });

    // 2. Fetch weather for each stage and store
    const weatherForStage = async (stage: any) => {
      const res = await axios.get("https://api.openweathermap.org/data/2.5/weather", {
        params: {
          lat: stage.lat,
          lon: stage.lng,
          appid: OPENWEATHER_API_KEY,
          units: "metric",
        },
      });

      const data = res.data;

      await prisma.weather.create({
        data: {
          cropStageId: stage.id,
          main: data.weather[0].main,
          description: data.weather[0].description,
          temperature: data.main.temp,
          humidity: data.main.humidity,
          windSpeed: data.wind.speed,
        },
      });
    };

    await Promise.all(crop.stages.map(weatherForStage));

    return NextResponse.json({ message: "Crop and weather saved", crop });
  } catch (err) {
    console.error("Error creating crop and weather:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// GET /api/crop - Fetch all crops
export async function GET(req: Request) {
  try {
    const crops = await prisma.crop.findMany({
      include: {
        stages: {
          include: {
            weather: {
              orderBy: { recordedAt: 'desc' },
              take: 1 // Get only the most recent weather data for each stage
            }
          },
          orderBy: { order: 'asc' } // Order stages by their order field
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(crops);
  } catch (err) {
    console.error("Error fetching crops:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
