import jwt from 'jsonwebtoken';

// Generate a password reset token
export function generateResetToken(user) {
    return jwt.sign(
        {
            userId: user._id.toString(),
            email: user.email,
            purpose: 'password-reset'
        },
        process.env.JWT_SECRET,
        { expiresIn: '1h' } // Token valid for 1 hour
    );
}

// Verify a reset token
export function verifyResetToken(token) {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Make sure this token is for password reset
        if (decoded.purpose !== 'password-reset') {
            console.log('Invalid token purpose:', decoded.purpose);
            throw new Error('Invalid token purpose');
        }

        return decoded;
    } catch (error) {
        console.log('Token verification error:', error.message);
        return null;
    }
}