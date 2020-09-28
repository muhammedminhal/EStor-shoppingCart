const crypto = require('crypto')
const passport = require('passport')

function genPassword(password){
    var salt = crypto.randomBytes(32).toString('hex')
    var genHash = crypto.pbkdf2Sync(password,salt,10000,64,'sha512').toString('hex')


    return {
        salt:salt,
        Hash:genHash
    }
};


function validPassword(password,hash,salt){
    var hashVerify = crypto.pbkdf2Sync(password,salt,10000,64,"sha512").toString("hex")
    return hash ===hashVerify
}

module.exports.validPassword = validPassword;
module.exports.genPassword = genPassword;