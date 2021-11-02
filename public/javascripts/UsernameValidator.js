
const validator = /^[a-z0-9]+(-[a-z0-9]+)*$/
function isUsernameValid(username){
    return validator.test(username)
}

module.exports.isUsernameValid = isUsernameValid