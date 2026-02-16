-- AlterTable
ALTER TABLE "User" ADD COLUMN     "preferredDensity" TEXT DEFAULT 'comfortable',
ADD COLUMN     "preferredFontScale" TEXT DEFAULT 'md',
ADD COLUMN     "preferredTheme" TEXT DEFAULT 'default';
