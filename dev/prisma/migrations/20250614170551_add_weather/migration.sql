-- CreateTable
CREATE TABLE "Weather" (
    "id" SERIAL NOT NULL,
    "cropStageId" INTEGER NOT NULL,
    "temperature" DOUBLE PRECISION NOT NULL,
    "main" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "humidity" INTEGER NOT NULL,
    "windSpeed" DOUBLE PRECISION NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Weather_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Weather" ADD CONSTRAINT "Weather_cropStageId_fkey" FOREIGN KEY ("cropStageId") REFERENCES "CropStage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
