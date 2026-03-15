import { AddOperation,UpdateOperation,DeleteOperation,getAllOperations ,getOperationsGroupedByCategory} from "../controllers/index.js";
import express from "express";
const router = express.Router();
import { validate } from "../middelware/validate.js";
import {addOperationSchema,updateOperationSchema} from "../Validation/OperationValidation.js";
import { verifyToken } from "../middelware/verifyToken.js";


router.post ("/:AccountId",verifyToken,validate(addOperationSchema),AddOperation);

router.put("/:IdOperation", verifyToken,validate(updateOperationSchema),UpdateOperation);//validate(UpdateOperation),

router.delete("/:IdOperation", verifyToken,DeleteOperation);

router.get("/:AccountId", verifyToken,getAllOperations)

router.get("/grouped/:AccountId", verifyToken, getOperationsGroupedByCategory);

export default router;
