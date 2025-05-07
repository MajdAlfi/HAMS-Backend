const jwt = require('jsonwebtoken')
const config = process.env
const verifyToken = async(req ,res,next)=>{
    const {token,uid} = req.headers

    // req.body.token || req.query.token || 
    if(!token || !uid) {
        return res.status(403).send("A token/uid is required for authentication!");
    }
    try{
      const decoded = await JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString())
        if(uid == decoded['user_id']){
        const decode = jwt.verify(token,config.TOKEN_KEY)
        if(decode.user_id == uid){
           req.user = decode 
//           res.status(200).send('okk')
        }else{
             res.status(401).send("Invalid_Token/userId")
        }
    }else{
        res.status.send('uid does not match with the token')
    }
    }catch(e){ return res.status(401).send("Invalid_Token");}
    return next();
}
module.exports = verifyToken;