/*
  Warnings:

  - Made the column `isLocked` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `isVerfiied` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "User" ALTER COLUMN "isLocked" SET NOT NULL,
ALTER COLUMN "isLocked" SET DEFAULT false,
ALTER COLUMN "isVerfiied" SET NOT NULL,
ALTER COLUMN "isVerfiied" SET DEFAULT false;
