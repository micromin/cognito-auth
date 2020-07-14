# AWS Cognito and DynamoDB User Authentication Nodejs App

This project is a showcase of using [aws cognito](https://aws.amazon.com/cognito/) as an authentication service with an [angularjs ui](https://github.com/micromin/cognito-ui). 
As you may know, Amazon Cognito lets you add user sign-up, sign-in, and access control to your web and mobile apps quickly and easily. This app stores the users in a dynamodb for a refrence.
I hope, this project can be used as a starter for your next idea.

## Pages
- signup
- login
- change password
- reset password initiate
- confirm user email
- resend email confirmation

## Endpoints
- router.post('/signup', authController.register);
- router.post('/login', authController.login);
- router.post('/logout', authController.isAuthorized, authController.logout); 
- router.post('/confirmUser', authController.confirmUser);
- router.post('/resendVerificationCode', authController.resendVerificationCode);
- router.post('/validateToken', authController.validateToken);
- router.post('/forgotPassword', authController.forgotPassword);
- router.post('/resetPassword', authController.resetPassword);

## Running server

Run `ng run dev` for a dev server. Send you requests to `http://localhost:8000/` using [postman](https://www.postman.com/). The app will automatically reload if you change any of the source files.

## Clone the and Installing Dependencies

Run `git clone https://github.com/micromin/cognito-auth.git` to clone the repo. Then go to the project's directory and run `npm install` to install all the dependencies.

## Setup Cognito
Create a user pool. Choose a name for the pool. In the attributes section of the pool, choose `Email address or phone number` option. In the password policies, choose the combination which is suitable for your app.
In the `App Clients` secition, click on `Add an app client`. Give it a name, and uncheck the `Generate client secret` checkbox. Next, click on the `Create app client` button. Finally, click on the `Save changes` button.

## Setup Env Variables
copy the `.env.dist file` to `.env` file in the project root directory. And populate the `CLIENT_ID`, `REGION`, `USER_POOL_ID` variables.
Don't forget to update the `config\cognito-keys.js` file.

## Setup Dynamodb
You need to create an iam user. Assign `AmazonDynamoDBFullAccess` and `AmazonCognitoDeveloperAuthenticatedIdentities` permissions to it and give it programmatic access. 
Then, set the `ACCESS_KEY_ID`, and `SECRET_ACCESS_KEY` env variables in the .env file. Also, set the `UsersTableName` to the name you want to call your users table. Finally, go to AWS Console, Daynamodb section and create a table with the name you choose for `UsersTableName`. While creating the table, choose `ID` as `Partition key`.

## Docker
You can build the docker image by running `docker build -t tag:version .` in the project's root directory. And then, `docker run -d -p 8000:8000 tag:version`.