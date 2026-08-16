

export const checkRole = (allowedRoles) => {
    return (req,res ,next) => {
       if(!allowedRoles.includes(req.user.role)){
        return res.status(403).json({
            messgae : "you are not allowed to access this resource"
        })
       }
       next();
    }
}