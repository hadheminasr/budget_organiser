import { AddOperation,UpdateOperation,DeleteOperation,getAllOperations } from "../controllers/index.js";
import express from "express";
const router = express.Router();
import { validate } from "../middelware/validate.js";
import {addOperationSchema,updateOperationSchema} from "../Validation/OperationValidation.js";

router.post ("/:AccountId",validate(addOperationSchema),AddOperation);

router.put("/:IdOperation",validate(updateOperationSchema),UpdateOperation);//validate(UpdateOperation),

router.delete("/:IdOperation",DeleteOperation);

router.get("/:AccountId",getAllOperations)


export default router;
