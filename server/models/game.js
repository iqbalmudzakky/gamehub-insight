"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Game extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Game.belongsToMany(models.User, { through: models.Favorite });
    }
  }
  Game.init(
    {
      title: DataTypes.STRING,
      genre: DataTypes.STRING,
      platform: DataTypes.STRING,
      publisher: DataTypes.STRING,
      thumbnail: DataTypes.STRING,
      ApiId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Game",
    }
  );
  return Game;
};
