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
    const userId = req.user._id;
    const Account = await AccountService.updateAccount(id, updates, userId);
    return res.status(200).json({ sucess: true, Account });
  } catch (error) {
    console.error("Error in update Account", error);
    return res.status(500).json({ sucess: false, message: error.message });
  }
};

export const deleteAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    await AccountService.deleteAccount(id,userId);
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

export const getMyAccount= async (req,res)=>{
  const {AccountId}=req.params;
  const userId = req.user._id;
  try{
    const account = await AccountService.getMyAccount(AccountId,userId);
    res.status(200).json({success:true,account});
  }catch(error){
    console.error("error in get my account ",error)
    res.status(500).json({success:false,message:error.message})
  } 
};

export const removeMember=async (req,res)=>{
  const {AccountId}=req.params;
  const userId = req.user._id;
  const {memberIdToRemove}=req.body;
  try{
    await AccountService.removeMember(AccountId,userId,memberIdToRemove);
    res.status(200).json({sucess:true,message:"member removed with sucess"});
  }catch(error){
    console.error("error in remove member ",error)
    res.status(500).json({sucess:false,message:error.message})
  }
  };

  export const joinAccountByCode = async (req, res) => {
  try {
    const { code } = req.body;
    const userId   = req.user._id;
    const account  = await AccountService.joinAccountByCode(code, userId);
    return res.status(200).json({ sucess: true, account });
  } catch (error) {
    return res.status(error.status || 500).json({ sucess: false, message: error.message });
  }
};

export const getSharingCode = async (req,res) => {
    const { accountId } = req.params;
    try {
    const sharingCode = await AccountService.getSharingCode(accountId);
    return res.status(200).json({ success: true, sharingCode });
  } catch (error) {    
    console.error("Error in getSharingCode", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const regenerateSharingCode = async (req,res) => {
    const { accountId } = req.params;
    const userId = req.user._id;  
    try {
    const newCode = await AccountService.regenererateSharingCode(accountId, userId);
    return res.status(200).json({ success: true, sharingCode: newCode });
  } catch (error) {    
    console.error("Error in regenerateSharingCode", error);
    return res.status(500).json({ success: false, message: error.message });  
  }
};
export const regenererateSharingCode = async (req,res) => {
    const { id } = req.params;
    const userId = req.user._id;
    console.log("id reçu :", id);
    console.log("userId reçu :", userId);
    try {    
    const newCode = await AccountService.regenererateSharingCode(id, userId);
    return res.status(200).json({ success: true, sharingCode: newCode });
  } catch (error) {    
    console.error("Error in regenerateSharingCode", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getDashboardData = async (req, res) => {
  const { accountId } = req.params;
  try {
    const dashboardData = await AccountService.getDashboardData(accountId);
    return res.status(200).json({ success: true, dashboardData });
  } catch (error) {
    console.error("Error in getDashboardData", error);
    return res.status(500).json({ success: false, message: error.message });
  } 
};

export const resetMensuel = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const result = await AccountService.resetMensuel(id, userId, req.body);
    res.json({ success: true, result });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};


