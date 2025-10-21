// lib/handlers/authHandler.js
import User from '@/lib/models/User';
import { generateToken } from '@/lib/utils/auth';
import dbConnect from '@/lib/utils/dbConnect';

export async function loginUser(email, password) {
    await dbConnect();

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
        return {
            success: false,
            error: 'The email you entered is not registered, please check again',
            field: 'email'
        };
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
        return {
            success: false,
            error: 'The password you provided is incorrect. Please try again.',
            field: 'password'
        };
    }

    // Generate token
    const token = await generateToken({
        userId: user._id.toString(),
        email: user.email,
        userType: user.userType
    });

    return {
        success: true,
        token,
        user: {
            userId: user._id,
            email: user.email,
            name: user.name,
            avatar: user.avatar
        }
    };
}