-- AlterTable
ALTER TABLE `appointment` ADD COLUMN `status` VARCHAR(191) NOT NULL DEFAULT 'GEPLAND';

-- AlterTable
ALTER TABLE `user` ADD COLUMN `insuranceCompany` VARCHAR(191) NULL,
    ADD COLUMN `insuranceExpiry` VARCHAR(191) NULL,
    ADD COLUMN `insuranceNumber` VARCHAR(191) NULL;
