/*
  Warnings:

  - You are about to drop the `color_pals` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "color_pals" DROP CONSTRAINT "color_pals_user_id_fkey";

-- DropTable
DROP TABLE "color_pals";

-- DropTable
DROP TABLE "users";

-- CreateTable
CREATE TABLE "ColorPals" (
    "id" TEXT NOT NULL,
    "colors" TEXT[],
    "user_id" TEXT NOT NULL,

    CONSTRAINT "ColorPals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key" ON "Users"("email");

-- AddForeignKey
ALTER TABLE "ColorPals" ADD CONSTRAINT "ColorPals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
