import { response } from "express";
import Currency, { INACTIVE } from "./currency.model.js";
import { getTranslationFunctions } from "../../utils/get-translations-locale.js";
import { logger } from "../../utils/logger.js";
import { StatusCodes } from "http-status-codes";
import { CurrencyNotFound } from "./currency.error.js";
import { cleanObject } from "../../utils/clean-object.js";
import { handleResponse } from "../../utils/handle-reponse.js";

export const getAllCurrencies = async (req, res = response) => {
  const LL = getTranslationFunctions(req.locale);
  try {
    logger.info("Starting get all currencies");

    const { limit = 0, page = 0 } = req.query;
    const [total, currency] = await Promise.all([
      Currency.countDocuments(),
      Currency.find()
        .limit(limit)
        .skip(limit * page),
    ]);

    res.status(StatusCodes.OK).json({
      message: LL.CURRENCY.CONTROLLER.MULTIPLE_RETRIEVED_SUCCESSFULLY(),
      data: currency,
      total,
    });

    logger.info("Currencies retrieved successfully");
  } catch (error) {
    logger.error("Get all currencies controller error of type: ", error.name);
    handleResponse(res, error, LL);
  }
};

export const createCurrency = async (req, res) => {
  const LL = getTranslationFunctions(req.locale);
  try {
    logger.info("Starting create currency");

    const { symbol, name, key } = req.body;

    const currency = new Currency(
      cleanObject({
        symbol,
        name,
        key,
      }),
    );

    await currency.save();

    res.status(StatusCodes.CREATED).json({
      message: LL.CURRENCY.CONTROLLER.CREATED(),
      data: currency,
    });

    logger.info("Currency created successfully", currency);
  } catch (error) {
    logger.error("Create currency controller error of type: ", error.name);
    handleResponse(res, error, LL);
  }
};

export const updateCurrency = async (req, res) => {
  const LL = getTranslationFunctions(req.locale);
  try {
    logger.info("Starting update currency");

    const { id } = req.params;
    const { symbol, name, key } = req.body;

    const currency = await Currency.findByIdAndUpdate(
      id,
      cleanObject({ symbol, name, key }),
      { new: true },
    );

    if (!currency) {
      throw new CurrencyNotFound(LL.CURRENCY.ERROR.NOT_FOUND());
    }

    res.status(StatusCodes.OK).json({
      message: LL.CURRENCY.CONTROLLER.UPDATED(),
      data: currency,
    });

    logger.info("Currency created successfully", currency);
  } catch (error) {
    logger.error("Update currency controller error of type: ", error.name);
    handleResponse(res, error, LL);
  }
};

export const deleteCurrencyById = async (req, res) => {
  const LL = getTranslationFunctions(req.locale);
  try {
    logger.info("Starting delete currency by id");

    const { id } = req.params;
    const currency = await Currency.findByIdAndUpdate(
      id,
      { tp_status: INACTIVE },
      { new: true },
    );
    res.status(StatusCodes.OK).json({
      message: LL.CURRENCY.CONTROLLER.DELETED(),
      data: currency,
    });

    logger.info("Currency deleted successfully", currency);
  } catch (error) {
    logger.error("Delete currency controller error of type: ", error.name);
    handleResponse(res, error, LL);
  }
};
