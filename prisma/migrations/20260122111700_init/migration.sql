-- CreateTable
CREATE TABLE "Rom" (
    "id" SERIAL NOT NULL,
    "ino" INTEGER NOT NULL,
    "name" TEXT,
    "parentPath" TEXT NOT NULL,
    "fullPath" TEXT NOT NULL,
    "size" INTEGER,

    CONSTRAINT "Rom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Metadata" (
    "id" SERIAL NOT NULL,
    "romId" INTEGER NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "year" INTEGER,
    "genres" TEXT[],
    "coverUrl" TEXT,
    "screenshotUrls" TEXT[],
    "trailerUrl" TEXT,
    "developer" TEXT,
    "publisher" TEXT,
    "region" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Metadata_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Rom_ino_key" ON "Rom"("ino");

-- CreateIndex
CREATE UNIQUE INDEX "Rom_fullPath_key" ON "Rom"("fullPath");

-- CreateIndex
CREATE UNIQUE INDEX "Metadata_romId_key" ON "Metadata"("romId");

-- AddForeignKey
ALTER TABLE "Metadata" ADD CONSTRAINT "Metadata_romId_fkey" FOREIGN KEY ("romId") REFERENCES "Rom"("id") ON DELETE CASCADE ON UPDATE CASCADE;
