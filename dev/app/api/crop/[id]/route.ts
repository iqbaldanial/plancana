// api/crop/[id]/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import axios from "axios";

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY!;

// GET /api/crop/[id] - Fetch a specific crop with all its stages
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  // Await the params before using them
  const { id } = await params;
  const cropId = parseInt(id);

  if (isNaN(cropId)) {
    return NextResponse.json({ error: "Invalid crop ID" }, { status: 400 });
  }

  try {
    const crop = await prisma.crop.findUnique({
      where: { id: cropId },
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
      }
    });

    if (!crop) {
      return NextResponse.json({ error: "Crop not found" }, { status: 404 });
    }

    return NextResponse.json(crop);
  } catch (err) {
    console.error("Error fetching crop:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/crop/[id] - Add a new stage to an existing crop
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const cropId = parseInt(params.id);

  if (isNaN(cropId)) {
    return NextResponse.json({ error: "Invalid crop ID" }, { status: 400 });
  }

  const body = await req.json();
  const { role, lat, lng } = body;

  // Validate required fields
  if (!role || lat == null || isNaN(lat) || lng == null || isNaN(lng)) {
    return NextResponse.json({ 
      error: "Missing or invalid fields. Required: role, lat, lng" 
    }, { status: 400 });
  }

  try {
    // Check if crop exists
    const existingCrop = await prisma.crop.findUnique({
      where: { id: cropId },
      include: { stages: true }
    });

    if (!existingCrop) {
      return NextResponse.json({ error: "Crop not found" }, { status: 404 });
    }

    // Get the next order number for the new stage
    const maxOrder = existingCrop.stages.length > 0 
      ? Math.max(...existingCrop.stages.map(stage => stage.order))
      : -1;
    const nextOrder = maxOrder + 1;

    // Create the new stage
    const newStage = await prisma.cropStage.create({
      data: {
        cropId,
        role,
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        order: nextOrder
      }
    });

    // Fetch weather data for the new stage
    try {
      const weatherRes = await axios.get("https://api.openweathermap.org/data/2.5/weather", {
        params: {
          lat: newStage.lat,
          lon: newStage.lng,
          appid: OPENWEATHER_API_KEY,
          units: "metric",
        },
      });

      const weatherData = weatherRes.data;

      // Store weather data
      await prisma.weather.create({
        data: {
          cropStageId: newStage.id,
          main: weatherData.weather[0].main,
          description: weatherData.weather[0].description,
          temperature: weatherData.main.temp,
          humidity: weatherData.main.humidity,
          windSpeed: weatherData.wind.speed,
        },
      });
    } catch (weatherErr) {
      console.error("Error fetching weather data:", weatherErr);
      // Continue without weather data - the stage is still created
    }

    // Return the updated crop with all stages
    const updatedCrop = await prisma.crop.findUnique({
      where: { id: cropId },
      include: {
        stages: {
          include: {
            weather: {
              orderBy: { recordedAt: 'desc' },
              take: 1
            }
          },
          orderBy: { order: 'asc' }
        }
      }
    });

    return NextResponse.json({ 
      message: "Stage added successfully", 
      crop: updatedCrop,
      newStage: newStage 
    });

  } catch (err) {
    console.error("Error adding stage to crop:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT /api/crop/[id] - Update crop details (optional)
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const cropId = parseInt(params.id);

  if (isNaN(cropId)) {
    return NextResponse.json({ error: "Invalid crop ID" }, { status: 400 });
  }

  const body = await req.json();
  const { name, description } = body;

  if (!name && !description) {
    return NextResponse.json({ 
      error: "At least one field (name or description) is required" 
    }, { status: 400 });
  }

  try {
    // Check if crop exists
    const existingCrop = await prisma.crop.findUnique({
      where: { id: cropId }
    });

    if (!existingCrop) {
      return NextResponse.json({ error: "Crop not found" }, { status: 404 });
    }

    // Update crop
    const updatedCrop = await prisma.crop.update({
      where: { id: cropId },
      data: {
        ...(name && { name }),
        ...(description && { description })
      },
      include: {
        stages: {
          include: {
            weather: {
              orderBy: { recordedAt: 'desc' },
              take: 1
            }
          },
          orderBy: { order: 'asc' }
        }
      }
    });

    return NextResponse.json({ 
      message: "Crop updated successfully", 
      crop: updatedCrop 
    });

  } catch (err) {
    console.error("Error updating crop:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/crop/[id] - Delete a crop (optional)
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const cropId = parseInt(params.id);

  if (isNaN(cropId)) {
    return NextResponse.json({ error: "Invalid crop ID" }, { status: 400 });
  }

  try {
    // Check if crop exists
    const existingCrop = await prisma.crop.findUnique({
      where: { id: cropId }
    });

    if (!existingCrop) {
      return NextResponse.json({ error: "Crop not found" }, { status: 404 });
    }

    // Delete crop (cascade will handle stages and weather)
    await prisma.crop.delete({
      where: { id: cropId }
    });

    return NextResponse.json({ message: "Crop deleted successfully" });

  } catch (err) {
    console.error("Error deleting crop:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}