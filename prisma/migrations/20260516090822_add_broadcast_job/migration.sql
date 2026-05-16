-- CreateTable
CREATE TABLE "BroadcastJob" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "sendAt" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "sentCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BroadcastJob_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BroadcastJob_userId_status_idx" ON "BroadcastJob"("userId", "status");

-- CreateIndex
CREATE INDEX "BroadcastJob_status_sendAt_idx" ON "BroadcastJob"("status", "sendAt");

-- AddForeignKey
ALTER TABLE "BroadcastJob" ADD CONSTRAINT "BroadcastJob_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
