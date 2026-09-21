-- RenameForeignKey
ALTER TABLE "Message" RENAME CONSTRAINT "MessageSenderRef" TO "Message_senderId_fkey";

-- RenameForeignKey
ALTER TABLE "Message" RENAME CONSTRAINT "Message_senderId_fkey" TO "MessageSenderRef";
