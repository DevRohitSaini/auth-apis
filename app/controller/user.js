import User from "../model/user.js";

export const users = async (req, res) => {
  try {
    const users = await User.find();
    return res.status(200).json({users})
  } catch (error) {
    console.error("Error fetaching user:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
