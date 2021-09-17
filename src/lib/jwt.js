const jsonwebtoken = require("jsonwebtoken");

const jwt = {
    //create token
    issueJWT: async user => {
       console.log(user)
        let payload = {    
        id : user.id,   
        };
        const options = {
        expiresIn: '365d'
        };
        const jwtToken = await jsonwebtoken.sign(payload, 'KEy', options);
        return jwtToken;
    },
    //verify Token 
    verifyTokenFn: async (req, res, next) => {
      var token=req.headers.authorization                     
        await jsonwebtoken.verify(token, 'KEy', function(err, decoded) {                     
            if (err) {                    
                return res.json({
                    status:400,
                    success: false,
                    message: "Token not found",
                });
            }   else {                               
                req.user = {
                    id: decoded.id,  
                    //company_id:decoded.company_id                 
                }
                
                console.log(req.user)
                return next();
            }
            
        });
    }
};
module.exports = jwt;