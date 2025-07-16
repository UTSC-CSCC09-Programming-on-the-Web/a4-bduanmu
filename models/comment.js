import { sequelize } from "../datasource.js";
import { DataTypes } from "sequelize";
import { Image } from "./image.js";

export const Comment = sequelize.define("Comment", {
  author: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
});

Comment.belongsTo(Image);
Image.hasMany(Comment);
