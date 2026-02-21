import { AddOperation } from "../controllers/index.js";
import express from "express";
const router = express.Router();
import { validate } from "../middelware/validate.js";
import {addOperationSchema} from "../Validation/OperationValidation.js";

router.post ("/",validate(addOperationSchema),AddOperation);
export default router;
