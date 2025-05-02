exports.checkRole = (roles) => {
    return (req, res, next) => {

        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized access - No user found in token'
            });
        }

        if (!roles.includes(req.user.userType)) {
            return res.status(403).json({
                success: false,
                message: `Access denied. Required role: ${roles.join(', ')}, Your role: ${req.user.userType}`
            });
        }

        next();
    };
}; 