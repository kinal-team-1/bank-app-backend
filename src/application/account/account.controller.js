import { response } from "express";
import Account, { ACTIVE, INACTIVE } from "./account.model.js";
import { getTranslationFunctions } from "../../utils/get-translations-locale.js";
import { logger } from "../../utils/logger.js";
import { StatusCodes } from "http-status-codes";
import { AccountNotFound } from "./account.error.js";
import { cleanObject } from "../../utils/clean-object.js";
import { handleResponse } from "../../utils/handle-reponse.js";
import { getUsage } from "./account.utils.js";

export const getAllAccounts = async (req, res = response) => {
  const LL = getTranslationFunctions(req.locale);
  try {
    logger.info("Starting get all accounts");

    const { limit = 0, page = 0 } = req.query;
    const query = { tp_status: ACTIVE };
    const [total, accounts] = await Promise.all([
      Account.countDocuments(query),

      Account.find(query)
        .limit(limit)
        .skip(limit * page),
    ]);

    res.status(StatusCodes.OK).json({
      message: LL.ACCOUNT.CONTROLLER.MULTIPLE_RETRIEVED_SUCCESSFULLY(),
      data: accounts,
      total,
    });

    logger.info("Accounts retrieved successfully");
  } catch (error) {
    logger.error("Get all accounts controller error of type: ", error.name);
    handleResponse(res, error, LL);
  }
};

export const getAllAccountsByUserId = async (req, res = response) => {
  const LL = getTranslationFunctions(req.locale);
  try {
    logger.info("Starting get all accounts by user ID");

    const { userId } = req.params;
    const { limit = 0, page = 0 } = req.query;
    const query = { owner: userId, tp_status: ACTIVE };
    const [total, accounts] = await Promise.all([
      Account.countDocuments(query),
      Account.find(query)
        .populate("currency")
        .limit(limit)
        .skip(limit * page),
    ]);

    res.status(StatusCodes.OK).json({
      message: LL.ACCOUNT.CONTROLLER.MULTIPLE_RETRIEVED_SUCCESSFULLY(),
      data: accounts,
      total,
    });

    logger.info("Accounts retrieved successfully by user ID");
  } catch (error) {
    logger.error(
      "Get all accounts by user ID controller error of type: ",
      error.name,
    );
    handleResponse(res, error, LL);
  }
};

export const createAccount = async (req, res) => {
  const LL = getTranslationFunctions(req.locale);
  try {
    logger.info("Starting create account");

    const { owner, currency, balance } = req.body;

    const account = new Account(
      cleanObject({
        owner,
        currency,
        balance,
      }),
    );

    await account.save();

    res.status(StatusCodes.CREATED).json({
      message: LL.ACCOUNT.CONTROLLER.CREATED(),
      data: account,
    });

    logger.info("Account created successfully", account);
  } catch (error) {
    logger.error("Create account controller error of type:", error.name);
    handleResponse(res, error, LL);
  }
};

export const updateAccountCurrency = async (req, res) => {
  const LL = getTranslationFunctions(req.locale);
  try {
    logger.info("Starting update account");

    const { id } = req.params;
    const { currency } = req.body;

    const updateData = cleanObject({
      currency,
      updated_at: new Date(),
    });

    const account = await Account.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!account) {
      throw new AccountNotFound(LL.ACCOUNT.ERROR.NOT_FOUND());
    }

    res.status(StatusCodes.OK).json({
      message: LL.ACCOUNT.CONTROLLER.UPDATED(),
      data: account,
    });

    logger.info("Account updated successfully", account);
  } catch (error) {
    logger.error("Update account controller error of type:", error.name);
    handleResponse(res, error, LL);
  }
};

export const deleteAccountById = async (req, res = response) => {
  const LL = getTranslationFunctions(req.locale);
  try {
    logger.info("Starting delete account by id");

    const { id } = req.params;
    const account = await Account.findByIdAndUpdate(
      id,
      { tp_status: INACTIVE },
      { new: true },
    );
    res.status(StatusCodes.OK).json({
      message: LL.ACCOUNT.CONTROLLER.DELETED(),
      data: account,
    });

    logger.info("Account deleted successfully", account);
  } catch (error) {
    logger.error("Delete account controller error of type:", error.name);
    handleResponse(res, error, LL);
  }
};

export const getAccountsAscendant = async (req, res = response) => {
  const LL = getTranslationFunctions(req.locale);
  try {
    logger.info("Starting get all accounts ascendant");

    const accounts = await Account.find({ tp_status: ACTIVE }).sort({
      balance: 1,
    });

    res.status(StatusCodes.OK).json({
      message: LL.ACCOUNT.CONTROLLER.MULTIPLE_RETRIEVED_SUCCESSFULLY(),
      data: accounts,
    });

    logger.info("Accounts retrieved successfully");
  } catch (error) {
    logger.error(
      "Get all accounts ascendant controller error of type:",
      error.name,
    );
    handleResponse(res, error, LL);
  }
};

export const getAccountsDescendant = async (req, res = response) => {
  const LL = getTranslationFunctions(req.locale);
  try {
    logger.info("Starting get all accounts descendant");

    const accounts = await Account.find({ tp_status: ACTIVE }).sort({
      balance: -1,
    });

    res.status(StatusCodes.OK).json({
      message: LL.ACCOUNT.CONTROLLER.MULTIPLE_RETRIEVED_SUCCESSFULLY(),
      data: accounts,
    });

    logger.info("Accounts retrieved successfully");
  } catch (error) {
    logger.error(
      "Get all accounts descendant controller error of type:",
      error.name,
    );
    handleResponse(res, error, LL);
  }
};

export const getAccountsDescendantUsage = async (req, res = response) => {
  const LL = getTranslationFunctions(req.locale);
  try {
    logger.info("Starting get all accounts descendant");
    const accounts = await Account.find({ tp_status: ACTIVE });

    const promises = accounts.map((account) => getUsage(account));

    const accountUsage = await Promise.all(promises);

    accountUsage.sort((a, b) => b.totalUsage - a.totalUsage);

    const responseData = accountUsage.map((item) => ({
      account: item.account,
      totalUsage: item.totalUsage,
    }));

    res.status(StatusCodes.OK).json({
      message: LL.ACCOUNT.CONTROLLER.MULTIPLE_RETRIEVED_SUCCESSFULLY(),
      data: responseData,
    });

    logger.info("Accounts retrieved successfully");
  } catch (error) {
    logger.error(
      "Get all accounts descendant controller error of type:",
      error.name,
    );
    handleResponse(res, error, LL);
  }
};

export const getAccountsAscendantUsage = async (req, res = response) => {
  const LL = getTranslationFunctions(req.locale);
  try {
    logger.info("Starting get all accounts descendant");
    const accounts = await Account.find({ tp_status: ACTIVE });

    const promises = accounts.map((account) => getUsage(account));

    const accountUsage = await Promise.all(promises);

    accountUsage.sort((a, b) => a.totalUsage - b.totalUsage);

    const responseData = accountUsage.map((item) => ({
      account: item.account,
      totalUsage: item.totalUsage,
    }));

    res.status(StatusCodes.OK).json({
      message: LL.ACCOUNT.CONTROLLER.MULTIPLE_RETRIEVED_SUCCESSFULLY(),
      data: responseData,
    });

    logger.info("Accounts retrieved successfully");
  } catch (error) {
    logger.error(
      "Get all accounts descendant controller error of type:",
      error.name,
    );
    handleResponse(res, error, LL);
  }
};
