"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Users", "role", {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: "customer",
    });

    await queryInterface.removeColumn("Users", "GoogleId");
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Users", "role");

    await queryInterface.addColumn("Users", "GoogleId", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },
};
