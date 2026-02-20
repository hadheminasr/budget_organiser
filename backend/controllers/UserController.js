import {UserService} from "../service/index.js";
export const getUser = async (req, res) => {
  try {
    const {id}=req.params;
    const user = await UserService.getUser(id);
    return res.status(200).json({ sucess: true, user });
  } catch (error) {
    console.error("Error in getUser", error);
    return res.status(500).json({ sucess: false, message: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const { activeBol } = req.query;
    console.log("REQ.QUERY =", req.query);
console.log("activeBol =", req.query.activeBol);

    const users = await UserService.getAllUsers({activeBol});
    return res.status(200).json({ sucess: true, users });
  } catch (error) {
    console.error("Error in getAllUsers", error);
    return res.status(500).json({ sucess: false, message: "server error" });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body?.body ?? req.body;
    const user = await UserService.updateUser(req.params.id, updates);
    return res.json({ success: true, user });
  } catch (error) {
    console.error("Error in updateUser", error);
    return res.status(500).json({ sucess: false, message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    await UserService.deleteUser(id);
    return res.status(200).json({ sucess: true, message: "User deleted successfully" });
  } catch (error) {
    console.error("Error in deleteUser", error);
    return res.status(500).json({ sucess: false, message: error.message });
  }
};

export const AddUser = async (req, res) => {
  try {
    const createdUser = await UserService.addUser(req.body, res);
    return res.status(201).json({
      sucess: true,
      message: "user created successfully",
      user: createdUser,
    });
  } catch (error) {
    return res.status(400).json({ sucess: false, message: error.message });
  }
};
