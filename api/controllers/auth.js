global.fetch = require('node-fetch');
global.navigator = () => null;
var AWS = require('aws-sdk');

AWS.config.update({
    region: process.env.REGION,
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY
});

var docClient = new AWS.DynamoDB.DocumentClient();

const tableName = "Cognito-Users";

const tokeHelper = require('../helper/token-validator')

const UserPoolId = process.env.USER_POOL_ID;
const ClientId = process.env.CLIENT_ID;
const AmazonCognitoIdentity = require('amazon-cognito-identity-js');

const poolData = {
    UserPoolId: UserPoolId,
    ClientId: ClientId
};

const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

function getResponse(code, message, data) {
    return {
        'code': code,
        'message': message,
        'data': data
    };
}

module.exports.register = function (req, res, next) {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;

    if (!email)
        return next(new Error("email is missing."));

    if (!password)
        return next(new Error("password is missing."));

    if (!name)
        return next(new Error("name is missing."));

    var attributeList = [];
    attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({ Name: "email", Value: email }));
    attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({ Name: "name", Value: name }));

    userPool.signUp(email, password, attributeList, null, function (err, result) {
        if (err) {
            return res.status(400).json(errorResponse(401, err));
        }
        var cognitoUser = result.user;
        
        var params = {
            TableName: tableName,
            Item: {
                "ID": result.userSub,
                "email": cognitoUser.username,
                "userData": cognitoUser,
                "CreateDate": new Date().getTime()
            }
        };

        docClient.put(params, function(err, data) {
            if (err) {
                console.log(err);
            }
        });
        
        return res.status(201).json(getResponse(201, 'signed up successfully.', cognitoUser));
    });
}

module.exports.login = function (req, res, next) {
    const email = req.body.email;
    if (!email)
        return next(new Error("email is missing."));

    const password = req.body.password;
    if (!password)
        return next(new Error("password is missing."));

    var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails({
        Username: email,
        Password: password
    });
    var userData = {
        Username: email,
        Pool: userPool
    }

    const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
    cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: function (result) {
            console.log(result);
            let credentials = {
                'accesstoken': {
                    "token" : result.getAccessToken().getJwtToken(),
                    "payload" : result.getAccessToken().payload
                },
                "idToken": {
                    "token" : result.idToken.jwtToken,
                    "payload" : result.idToken.payload
                },
                "refreshToken": result.getRefreshToken().getToken(),
            };
            return res.status(200).json(getResponse(200, 'logged in successfully.', credentials));
        },
        onFailure: (function (err) {
            return res.status(401).json(errorResponse(401, err));
        })
    });
}

module.exports.logout = function (req, res, next) {
    const email = req.body.email;

    if (!email)
        return next(new Error("email is missing."));

    var userData = {
        Username: email,
        Pool: userPool
    }

    const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
    cognitoUser.signOut();

    return res.status(200).json(getResponse(200, 'logged out successfully.'));
}

module.exports.confirmUser = async function (req, res, next) {
    const email = req.body.email;
    const verificationCode = req.body.verificationCode;

    if (!email)
        return next(new Error("email is missing."));

    if (!verificationCode)
        return next(new Error("verification code is missing."));

    var userData = {
        Username: email,
        Pool: userPool
    }

    var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
    cognitoUser.confirmRegistration(verificationCode, true, function (err, result) {
        if (err) {
            return res.status(401).json(errorResponse(401, err));
        }

        return res.status(200).json(getResponse(200, 'registeration confirmed successfully.'));
    });
}

module.exports.forgotPassword = function (req, res, next) {
    const email = req.body.email;

    if (!email)
        return next(new Error("email is missing."));

    var userData = {
        Username: email,
        Pool: userPool
    }

    var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
    cognitoUser.forgotPassword({
        onSuccess: function (data) {
            return res.status(200).json(getResponse(200, 'successfully initiated reset password request.', data));
        },
        onFailure: function (err) {
            return res.status(401).json(errorResponse(401, err));
        },
    });
}

module.exports.resetPassword = function (req, res, next) {
    const email = req.body.email;
    const newPassword = req.body.newPassword;
    const verificationCode = req.body.verificationCode;

    if (!email)
        return next(new Error("email is missing."));

    if (!newPassword)
        return next(new Error("password is missing."));

    if (!verificationCode)
        return next(new Error("verification code is missing."));

    var userData = {
        Username: email,
        Pool: userPool
    }

    var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
    cognitoUser.confirmPassword(verificationCode, newPassword, {
        onSuccess: function (data) {
            return res.status(200).json(getResponse(200, 'password change confirmed.', data));
        },
        onFailure: function (err) {
            return res.status(401).json(errorResponse(401, err));
        },
    });
}

module.exports.resendVerificationCode = function (req, res, next) {
    const email = req.body.email;

    if (!email)
        return next(new Error("email is missing."));

    var userData = {
        Username: email,
        Pool: userPool
    }

    var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
    cognitoUser.resendConfirmationCode(function (err, result) {
        if (err) {
            return res.status(400).json(errorResponse(400, err));
        }

        console.log(result);
        let destination = email;
        try {
            destination = result.CodeDeliveryDetails.Destination
        } catch (e) {
        }
        return res.status(200).json(getResponse(200, `verification code sent to ${destination} successfully. please check your email.`));
    });
}


module.exports.validateToken = function (req, res, next) {
    const token = req.body.token;

    if (!token)
        return next(new Error("token is missing."));

    tokeHelper.validate(token, (err, result) => {
        if (err) {
            return res.status(400).json(errorResponse(400, err));
        }

        return res.status(200).json(getResponse(200, `token is valid.`, result));
    });
}

module.exports.isAuthorized = function (req, res, next) {
    const token = req.headers['authorization'] || '';

    if (!token) {
        return next(new Error('token is missing.'));
    }


    tokeHelper.validate(token, (err, result) => {
        if (err) {
            return next(err);
        }

        return next();
    });
}

function errorResponse(code, err) {
    if (!err || !err.message) {
        err = new Error('failed to process the request.');
    }

    return getResponse(code, err.message.toLowerCase());
}

module.exports.errorResponse = errorResponse;