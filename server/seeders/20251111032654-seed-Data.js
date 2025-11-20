"use strict";

const axios = require("axios");

const FREETOGAME_API = "https://www.freetogame.com/api/games";

/**
 * Seeder untuk mengisi tabel Games dari FreeToGame API
 * Run: npx sequelize-cli db:seed:all
 * Undo: npx sequelize-cli db:seed:undo:all
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      console.log("🎮 Fetching games from FreeToGame API...");

      // Fetch data dari FreeToGame API
      const response = await axios.get(FREETOGAME_API);
      const gamesFromAPI = response.data;

      if (!Array.isArray(gamesFromAPI)) {
        throw new Error("Invalid response format from FreeToGame API");
      }

      console.log(`📊 Found ${gamesFromAPI.length} games from API`);

      // Transform data dari API ke format database
      const gamesToInsert = gamesFromAPI.map((game) => ({
        title: game.title || "Unknown",
        genre: game.genre || "Other",
        platform: game.platform || "PC",
        publisher: game.publisher || "Unknown Publisher",
        thumbnail: game.thumbnail || null,
        ApiId: game.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      // Insert ke database
      console.log(
        `💾 Inserting ${gamesToInsert.length} games into database...`
      );
      await queryInterface.bulkInsert("Games", gamesToInsert, {});

      console.log(`✅ Successfully seeded ${gamesToInsert.length} games!`);
    } catch (error) {
      console.error("❌ Error seeding games:", error.message);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    /**
     * Hapus semua data dari tabel Games
     */
    try {
      console.log("🗑️  Removing all games from database...");
      await queryInterface.bulkDelete("Games", null, {});
      console.log("✅ Successfully removed all games!");
    } catch (error) {
      console.error("❌ Error removing games:", error.message);
      throw error;
    }
  },
};
