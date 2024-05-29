import { Schema, model } from "mongoose";
import { L } from "../../i18n/i18n-node.js";

const [ACTIVE, INACTIVE] = ["ACTIVE", "INACTIVE"];

const productSchema = new Schema({
  name: {
    type: String,
    required: [true, L.en.DB_NAME_REQUIRED()],
  },
  description: {
    type: String,
    required: [true, L.en.DB_DESCRIPTION_REQUIRED()],
  },
  price: {
    type: Number,
    required: [true, L.en.DB_PRICE_REQUIRED()],
  },
  currency: {
    type: Schema.Types.ObjectId,
    ref: "Currency",
    required: [true, L.en.DB_CURRENCY_REQUIRED()],
  },
  stock: {
    type: Number,
    required: [true, L.en.DB_STOCK_REQUIRED()],
  },
  created_at: {
    type: Date,
    default: Date.now,
    required: [true, L.en.DB_CREATED_AT_REQUIRED()],
  },
  updated_at: {
    type: Date,
    default: Date.now,
    required: [true, L.en.DB_UPDATED_AT_REQUIRED()],
  },
  tp_status: {
    type: String,
    required: [true, L.en.DB_TP_STATUS_REQUIRED()],
    enum: [ACTIVE, INACTIVE],
    default: ACTIVE,
  },
});

const productModel = model("Product", productSchema);

export default productModel;
