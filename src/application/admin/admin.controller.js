import { getTranslationFunctions } from "../../utils/get-translations-locale.js";
import { logger } from "../../utils/logger.js";
import Admin, { ACTIVE } from "./admin.model.js";
import { handleResponse } from "../../utils/handle-reponse.js";
import { StatusCodes } from "http-status-codes";

export const createAdmin = async (req, res) => {
  const LL = getTranslationFunctions(req.locale);
  try {
    logger.info("Start create admin");

    const { email, username, password, name, last_name } = req.body;

    // Create admin
    const admin = new Admin({
      email,
      username,
      password,
      name,
      last_name,
    });

    await admin.save();

    res.status(StatusCodes.CREATED).json({
      data: admin,
      message: LL.ADMIN.CONTROLLER.CREATED(),
    });

    logger.info("Admin created successfully");
  } catch (error) {
    logger.error("Create admin controller error of type: ", error.name);
    handleResponse(res, error, LL);
  }
};

export const getAllAdmins = async (req, res) => {
  const LL = getTranslationFunctions(req.locale);
  try {
    logger.info("Start get all admins");

    const { limit = 0, page = 0 } = req.query;

    const query = {
      tp_status: ACTIVE,
    };

    const [total, admins] = await Promise.all([
      Admin.countDocuments(query),
      Admin.find(query)
        .limit(limit)
        .skip(limit * page),
    ]);

    res.status(StatusCodes.OK).json({
      data: admins,
      message: LL.ADMIN.CONTROLLER.MULTIPLE_RETRIEVED_SUCCESSFULLY(),
      total,
    });

    logger.info("Get all admins successfully");
  } catch (error) {
    logger.error("Get all admins controller error of type: ", error.name);
    handleResponse(res, error, LL);
  }
};