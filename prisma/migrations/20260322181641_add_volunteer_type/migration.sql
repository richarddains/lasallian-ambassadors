/*
  Warnings:

  - Added the required column `volunteerType` to the `EventRegistration` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "VolunteerType" AS ENUM ('LAMB', 'DOCULAMB');

-- AlterTable
ALTER TABLE "EventRegistration" ADD COLUMN     "volunteerType" "VolunteerType" NOT NULL;
