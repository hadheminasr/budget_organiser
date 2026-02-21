import express from "express";
import { deleteUser,updateUser,AddUser,getUser,getAllUsers } from "../controllers/index.js";
import { validate } from "../middelware/validate.js";
import { addUserSchema, updateUserSchema } from "../Validation/UserValidation.js";

const router = express.Router();

router.get("/", getAllUsers);

router.get("/:id", getUser);

router.post("/", validate(addUserSchema), AddUser);

router.put("/:id",validate(updateUserSchema),updateUser);


router.delete("/:id", deleteUser);

export default router;
