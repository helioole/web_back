import UserModel from "../models/User.js"
const checkAdmin = async (userId) => {
  try {
    const user = await UserModel.findById(userId); 
    if (!user) {
      throw new Error('User not found');
    }

    return user.role === 'admin';
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

export default checkAdmin;