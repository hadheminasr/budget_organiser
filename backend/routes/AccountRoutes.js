import {updateAccount,AddAccount,getAccount,getAllAccounts,deleteAccount,removeMember,getMyAccount,joinAccountByCode,getSharingCode,regenererateSharingCode,getDashboardData,resetMensuel,getReport} from "../controllers/index.js"
import express from "express";

import { validate } from "../middelware/validate.js";
import { verifyToken } from "../middelware/verifyToken.js";
import { addAccountSchema, updateAccountSchema } from "../Validation/AccountValidation.js";

const router = express.Router();

router.get("/",getAllAccounts);

router.get("/:id", getAccount);

router.post("/", validate(addAccountSchema), AddAccount);


router.put("/:id", validate(updateAccountSchema), updateAccount);

router.delete("/:id",deleteAccount);

router.get("/my/:AccountId",getMyAccount);
 
router.delete("/:AccountId/members", verifyToken, removeMember);

router.post("/join",verifyToken,joinAccountByCode);

router.get("/sharingCode/:accountId",verifyToken,getSharingCode);

router.put("/:id/regenerate-code", verifyToken, regenererateSharingCode );

router.get("/:accountId/dashboard", verifyToken, getDashboardData);

router.post("/:id/monthly-reset", verifyToken, resetMensuel);

router.get("/:accountId/report", verifyToken, getReport);
export default  router;
