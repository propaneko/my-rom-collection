/*
  Warnings:

  - You are about to drop the column `coverUrl` on the `Metadata` table. All the data in the column will be lost.
  - You are about to drop the column `screenshotUrls` on the `Metadata` table. All the data in the column will be lost.
  - You are about to drop the column `trailerUrl` on the `Metadata` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `Rom` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Metadata" DROP COLUMN "coverUrl",
DROP COLUMN "screenshotUrls",
DROP COLUMN "trailerUrl",
ADD COLUMN     "media" JSONB;

-- AlterTable
ALTER TABLE "Rom" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
