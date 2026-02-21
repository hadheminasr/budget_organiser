import { AccountService } from "../service/index.js";

export const getAccount = async (req, res) => {
  try {
    const {id}=req.params;
    const account = await AccountService.getAccount(id);
    return res.status(200).json({ sucess: true, account});
  } catch (error) {
    console.error("Error in getAccount", error);
    return res.status(500).json({ sucess: false, message: error.message });
  }
};

export const getAllAccounts = async (req, res) => {
  try {
    const {  BlockedBool } = req.query;
    const Accounts = await AccountService.getAllAccounts( BlockedBool);
    return res.status(200).json({ sucess: true, Accounts });
  } catch (error) {
    console.error("Error in getAllAccounts", error);
    return res.status(500).json({ sucess: false, message: "server error" });
  }
};

export const updateAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const Account = await AccountService.updateAccount(id, updates);
    return res.status(200).json({ sucess: true, Account });
  } catch (error) {
    console.error("Error in update Account", error);
    return res.status(500).json({ sucess: false, message: error.message });
  }
};

export const deleteAccount = async (req, res) => {
  try {
    const { id } = req.params;

    await AccountService.deleteAccount(id);
    return res.status(200).json({ sucess: true, message: "Account deleted successfully" });
  } catch (error) {
    console.error("Error in delete Account", error);
    return res.status(500).json({ sucess: false, message: error.message });
  }
};

export const AddAccount = async (req, res) => {
  try {
    console.log("REQ.USER =", req.user);
console.log("REQ.USER._ID =", req.user?._id);
console.log("COOKIE TOKEN EXISTS =", !!req.cookies?.token);

    const userId = req.user?._id;
    const createdAccount = await AccountService.addAccount(req.body, userId);
    return res.status(201).json({
      sucess: true,
      message: "Account created successfully",
      user: createdAccount,
    });
  } catch (error) {
    return res.status(400).json({ sucess: false, message: error.message });
  }
};

