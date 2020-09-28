const jwtMiddleware = function verifyToken(req,res,next){
  let authHeader = req.headers.authorization;
  if(authHeader==undefined){
    res.status(401).send({error:"No token Found"})
  }else{
    let token = authHeader.split(" ")
    let authHeadToken =token[1]
    jwt.verify(authHeadToken,"secret",(err,Decode)=>{
      if(err){
        res.status(500).send("Authentication failed")
      }else{
    next()
      }
    })
  }
}




module.exports ={
  jwtMiddleware:jwtMiddleware
}