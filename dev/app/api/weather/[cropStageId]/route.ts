import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET /api/weather/[cropStageId]
export async function GET(req: NextRequest, { params }: { params: Promise<{ cropStageId: string }> }) {
  // Await the params before accessing properties
  const { cropStageId: cropStageIdParam } = await params;
  const cropStageId = parseInt(cropStageIdParam);

  if (isNaN(cropStageId)) {
    return NextResponse.json({ error: "Invalid crop stage ID" }, { status: 400 });
  }

  try {
    const weatherData = await prisma.weather.findMany({
      where: { cropStageId: cropStageId },
      orderBy: { recordedAt: 'desc' }, // Get most recent weather data first
      take: 5 // Limit to last 5 weather records to avoid overwhelming the popup
    });

    console.log(`Found ${weatherData.length} weather records for crop stage ${cropStageId}`);
    
    return NextResponse.json(weatherData);
  } catch (err) {
    console.error("Error fetching weather data:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}