const jsonwebtoken = require('jsonwebtoken')
const jwkToPem = require('jwk-to-pem');

const cognitoKeys = require('../../config/cognito-keys')
const jsonWebKeys = cognitoKeys.jsonWebKeys;


module.exports.validate = function (token, callback) {
    const header = decodeTokenHeader(token);
    const jsonWebKey = getJsonWebKeyWithKID(header.kid);
    verifyJsonWebTokenSignature(token, jsonWebKey, (err, decodedToken) => {
        if (err) {
            callback(err, null);
        } else {
            callback(null, decodedToken);
        }
    })
}

function decodeTokenHeader(token) {
    const [headerEncoded] = token.split('.');
    const buff = new Buffer(headerEncoded, 'base64');
    const text = buff.toString('ascii');
    return JSON.parse(text);
}

function getJsonWebKeyWithKID(kid) {
    for (let jwk of jsonWebKeys) {
        if (jwk.kid === kid) {
            return jwk;
        }
    }

    return null
}

function verifyJsonWebTokenSignature(token, jsonWebKey, callback) {
    const pem = jwkToPem(jsonWebKey);
    jsonwebtoken.verify(token, pem, { algorithms: ['RS256'] }, (err, decodedToken) => callback(err, decodedToken))
}