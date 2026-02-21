import {updateAccount,AddAccount,getAccount,getAllAccounts,deleteAccount} from "../controllers/index.js"
import express from "express";

import { validate } from "../middelware/validate.js";
import { addAccountSchema, updateAccountSchema } from "../Validation/AccountValidation.js";

const router = express.Router();

router.get("/",getAllAccounts);

router.get("/:id", getAccount);

router.post("/", validate(addAccountSchema), AddAccount);

router.put("/:id", validate(updateAccountSchema), updateAccount);

router.delete("/:id",deleteAccount);

export default  router;
