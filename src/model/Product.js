import { Schema, model } from "mongoose";

const productSchema = new Schema(
  {
    titulo: {
      type: String,
      required: true,
    },
    precio: {
      type: String,
      required: true,
    },
    imagenURL: {
      type: String,
      required: false,
    },
    local: {
      type: String,
      required: true,
    },
    localURL: {
      type: String,
      required: true,
    },
    mes: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default model("Product", productSchema);