import { storage } from "../server/storage";

async function main() {
  console.log("Seeding database with initial data...");
  
  // Force seeding by passing true
  await storage.seedInitialData(true);
  
  console.log("Database seeding completed");
  process.exit(0);
}

main().catch(error => {
  console.error("Error seeding database:", error);
  process.exit(1);
});