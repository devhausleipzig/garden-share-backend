-- CreateEnum
CREATE TYPE "TaskType" AS ENUM ('HARVESTING', 'WATERING', 'PRUNING', 'SEEDING', 'BUILDING', 'WEEDING');

-- CreateEnum
CREATE TYPE "Repeats" AS ENUM ('NONE', 'DAILY', 'WEEKLY', 'MONTHLY');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'USER');

-- CreateTable
CREATE TABLE "User" (
    "identifier" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "role" "Role" NOT NULL DEFAULT E'USER',
    "email" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "passwordSalt" TEXT NOT NULL,
    "profilePicture" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("identifier")
);

-- CreateTable
CREATE TABLE "Message" (
    "identifier" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "image" TEXT,
    "userId" TEXT,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("identifier")
);

-- CreateTable
CREATE TABLE "Task" (
    "identifier" TEXT NOT NULL,
    "bookingId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "type" "TaskType" NOT NULL,
    "deadline" TIMESTAMP(3) NOT NULL,
    "steps" TEXT NOT NULL,
    "repeating" "Repeats" NOT NULL DEFAULT E'NONE',

    CONSTRAINT "Task_pkey" PRIMARY KEY ("identifier")
);

-- CreateTable
CREATE TABLE "Booking" (
    "identifier" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "start" TIMESTAMP(3) NOT NULL,
    "end" TIMESTAMP(3) NOT NULL,
    "private" BOOLEAN NOT NULL DEFAULT false,
    "overnight" BOOLEAN NOT NULL DEFAULT false,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "title" TEXT,
    "userId" TEXT,
    "messageId" TEXT,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("identifier")
);

-- CreateTable
CREATE TABLE "Garden" (
    "identifier" TEXT NOT NULL,

    CONSTRAINT "Garden_pkey" PRIMARY KEY ("identifier")
);

-- CreateTable
CREATE TABLE "Reaction" (
    "identifier" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "emoji" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reaction_pkey" PRIMARY KEY ("identifier")
);

-- CreateTable
CREATE TABLE "_ReactionToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Booking_messageId_key" ON "Booking"("messageId");

-- CreateIndex
CREATE UNIQUE INDEX "_ReactionToUser_AB_unique" ON "_ReactionToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_ReactionToUser_B_index" ON "_ReactionToUser"("B");

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("identifier") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("identifier") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("identifier") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("identifier") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reaction" ADD CONSTRAINT "Reaction_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("identifier") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ReactionToUser" ADD FOREIGN KEY ("A") REFERENCES "Reaction"("identifier") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ReactionToUser" ADD FOREIGN KEY ("B") REFERENCES "User"("identifier") ON DELETE CASCADE ON UPDATE CASCADE;
