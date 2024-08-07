import express from "express";
import cors from "cors";
import { config } from "dotenv";
import { getTranslationFunctions } from "./src/utils/get-translations-locale.js";
import { StatusCodes } from "http-status-codes";
import dbConnection from "./src/db/db-connection.js";
import { printLanguage } from "./src/middleware/print-language.js";
import { retrieveLocale } from "./src/middleware/retrieve-locale.js";
import { logger } from "./src/utils/logger.js";
import productRoutes from "./src/application/product/product.routes.js";
import currencyRoutes from "./src/application/currency/currency.routes.js";
import accountRoutes from "./src/application/account/account.routes.js";
import payoutRoutes from "./src/application/payout/payout.route.js";
import userRoutes from "./src/application/user/user.route.js";
import transactionRoutes from "./src/application/transaction/transaction.route.js";
import servicesRoutes from "./src/application/service/service.route.js";
import favoriteAccountRoutes from "./src/application/favorite-accounts/favorite-accounts.route.js";
import adminRoutes from "./src/application/admin/admin.route.js";
import authRoutes from "./src/application/auth/auth.routes.js";
import transferenceRoutes from "./src/application/transference/transference.route.js";
import purchaseRoutes from "./src/application/purchase/purchase.route.js";

if (process.env.NODE_ENV !== "production" && process.env.NODE_ENV !== "test") {
  config({
    path: [".env", ".env.example"],
  });
}

if (process.env.NODE_ENV === "test") {
  config({
    path: [".env.test"],
  });
  // IF NODE_ENV is `test`, we should connect to the test database
  // here, since later on it will be impossible to change the connection
  await dbConnection();
}

export const app = express();

// eslint-disable-next-line @joao-cst/enforce-consistent-return-express
app.use(express.json());
app.use((req, res, next) => {
  logger.request_info(
    {
      METHOD: req.method,
      PATH: req.path,
      "content-type": req.headers["content-type"],
    },
    "Received Request",
  );
  next();
});
app.use(cors());
app.use(retrieveLocale);

app.get("/", (req, res) => {
  const LL = getTranslationFunctions(req.locale);
  res.status(StatusCodes.OK).json({ message: LL.HI(), data: undefined });
});

app.use(printLanguage);

app.use("/product", productRoutes);
app.use("/currency", currencyRoutes);
app.use("/account", accountRoutes);
app.use("/user", userRoutes);
app.use("/payout", payoutRoutes);
app.use("/transaction", transactionRoutes);
app.use("/service", servicesRoutes);
app.use("/favorite-accounts", favoriteAccountRoutes);
app.use("/admin", adminRoutes);
app.use("/auth", authRoutes);
app.use("/transference", transferenceRoutes);
app.use("/purchase", purchaseRoutes);

app.use("*", (req, res) => {
  const locale = (req.headers["accept-language"] || "en").slice(0, 2);
  const LL = getTranslationFunctions(locale);

  res
    .status(StatusCodes.NOT_FOUND)
    .json({ message: LL.GENERAL.ROUTES.ENDPOINT_NOT_FOUND(), data: undefined });
});
