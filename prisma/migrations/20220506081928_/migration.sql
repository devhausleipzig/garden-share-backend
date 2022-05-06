/*
  Warnings:

  - A unique constraint covering the columns `[taskId]` on the table `Booking` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `taskId` to the `Booking` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT "Task_bookingId_fkey";

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "taskId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Booking_taskId_key" ON "Booking"("taskId");

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("identifier") ON DELETE RESTRICT ON UPDATE CASCADE;
