-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "aicId" TEXT;

-- CreateIndex
CREATE INDEX "Event_aicId_idx" ON "Event"("aicId");

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_aicId_fkey" FOREIGN KEY ("aicId") REFERENCES "Profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
