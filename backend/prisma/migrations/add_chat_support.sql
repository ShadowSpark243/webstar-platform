-- Migration: add_chat_support
-- Creates the SupportTicket and SupportMessage tables

CREATE TABLE IF NOT EXISTS `SupportTicket` (
  `id`        INT          NOT NULL AUTO_INCREMENT,
  `userId`    INT          NOT NULL,
  `subject`   VARCHAR(191) NOT NULL,
  `status`    ENUM('OPEN','IN_PROGRESS','CLOSED') NOT NULL DEFAULT 'OPEN',
  `createdAt` DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3)  NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `SupportTicket_userId_idx` (`userId`),
  CONSTRAINT `SupportTicket_userId_fkey`
    FOREIGN KEY (`userId`) REFERENCES `User`(`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `SupportMessage` (
  `id`         INT          NOT NULL AUTO_INCREMENT,
  `ticketId`   INT          NOT NULL,
  `senderId`   INT          NOT NULL,
  `senderRole` ENUM('USER','ADMIN') NOT NULL,
  `message`    LONGTEXT     NOT NULL,
  `createdAt`  DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `SupportMessage_ticketId_idx` (`ticketId`),
  INDEX `SupportMessage_senderId_idx` (`senderId`),
  CONSTRAINT `SupportMessage_ticketId_fkey`
    FOREIGN KEY (`ticketId`) REFERENCES `SupportTicket`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `SupportMessage_senderId_fkey`
    FOREIGN KEY (`senderId`) REFERENCES `User`(`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
