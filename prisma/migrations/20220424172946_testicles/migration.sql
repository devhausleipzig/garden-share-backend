/*
  Warnings:

  - You are about to drop the `Test` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Test";

-- CreateTable
CREATE TABLE "Garden" (
    "identifier" TEXT NOT NULL,

    CONSTRAINT "Garden_pkey" PRIMARY KEY ("identifier")
);

-- CreateTable
CREATE TABLE "Task" (
    "identifier" TEXT NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("identifier")
);

-- CreateTable
CREATE TABLE "User" (
    "identifier" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("identifier")
);
