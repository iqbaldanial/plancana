/*
  Warnings:

  - You are about to drop the column `latitude` on the `Crop` table. All the data in the column will be lost.
  - You are about to drop the column `longitude` on the `Crop` table. All the data in the column will be lost.
  - Made the column `description` on table `Crop` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Crop" DROP COLUMN "latitude",
DROP COLUMN "longitude",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "description" SET NOT NULL;

-- CreateTable
CREATE TABLE "CropStage" (
    "id" SERIAL NOT NULL,
    "cropId" INTEGER NOT NULL,
    "role" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "CropStage_pkey" PRIMARY KEY ("id")
);

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
ALTER TABLE "CropStage" ADD CONSTRAINT "CropStage_cropId_fkey" FOREIGN KEY ("cropId") REFERENCES "Crop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Weather" ADD CONSTRAINT "Weather_cropStageId_fkey" FOREIGN KEY ("cropStageId") REFERENCES "CropStage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
