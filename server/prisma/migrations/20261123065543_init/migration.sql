-- CreateEnum
CREATE TYPE "Category" AS ENUM ('TWK', 'TIU', 'TKP');

-- CreateTable
CREATE TABLE "Question" (
    "id" SERIAL NOT NULL,
    "category" "Category" NOT NULL,
    "subCategory" TEXT,
    "text" TEXT NOT NULL,
    "explanation" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Option" (
    "id" SERIAL NOT NULL,
    "questionId" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "score" INTEGER NOT NULL,

    CONSTRAINT "Option_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attempt" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalQuestions" INTEGER NOT NULL,
    "twkScore" INTEGER NOT NULL,
    "tiuScore" INTEGER NOT NULL,
    "tkpScore" INTEGER NOT NULL,
    "totalScore" INTEGER NOT NULL,

    CONSTRAINT "Attempt_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Option" ADD CONSTRAINT "Option_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;
