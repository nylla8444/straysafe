import jwt from 'jsonwebtoken';

// Generate a verification token
export function generateVerificationToken(user) {
    // Stringify the ObjectId to ensure consistency
    const userId = user._id.toString();

    return jwt.sign(
        {
            userId: userId,
            email: user.email,
            purpose: 'email-verification'
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' } // Token valid for 24 hours
    );
}

// Verify a token
export function verifyEmailToken(token) {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Make sure this token is for email verification
        if (decoded.purpose !== 'email-verification') {
            console.log('Invalid token purpose:', decoded.purpose);
            throw new Error('Invalid token purpose');
        }

        return decoded;
    } catch (error) {
        console.log('Token verification error:', error.message);
        return null;
    }
}