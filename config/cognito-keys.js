/**
 *  get yours from https://cognito-idp.us-east-1.amazonaws.com/{pool-id}/.well-known/jwks.json and paste it here
 */
const jsonWebKeys = [{ 
    "alg": "RS256",
    "e": "AQAB",
    "kid": "blahblahblah",
    "kty": "RSA",
    "n": "blahblahblah",
    "use": "sig"
},
{
    "alg": "RS256",
    "e": "AQAB",
    "kid": "blahblahblah",
    "kty": "RSA",
    "n": "blahblahblah",
    "use": "sig"
}];

module.exports.jsonWebKeys = jsonWebKeys;