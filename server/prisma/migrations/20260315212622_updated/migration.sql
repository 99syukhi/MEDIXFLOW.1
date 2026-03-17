-- AlterTable
ALTER TABLE `appointment` ADD COLUMN `notes` TEXT NULL,
    ADD COLUMN `type` VARCHAR(191) NOT NULL DEFAULT 'Consult';
