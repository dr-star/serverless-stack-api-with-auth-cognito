import * as sst from "@serverless-stack/resources";

export default class MyStack extends sst.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);

        // Create a HTTP API
        const api = new sst.Api(this, "Api", {
            defaultAuthorizationType: sst.ApiAuthorizationType.AWS_IAM,
            routes: {
                "GET /private": "src/private.main",
                "GET /public": {
                    function: "src/public.main",
                    authorizationType: sst.ApiAuthorizationType.NONE,
                },
            },
        });

        const auth = new sst.Auth(this, "Auth", {
            cognito: {
                userPool: {
                    userPoolName: "api-auth-cognito-user-pool",
                    signInAliases: {email: true},
                },
            },
        });

        auth.attachPermissionsForAuthUsers([api]);

        // Show the endpoint in the output
        this.addOutputs({
            ApiEndpoint: api.url,
            UserPoolId: auth.cognitoUserPool.userPoolId,
            IdentityPoolId: auth.cognitoCfnIdentityPool.ref,
            UserPoolClientId: auth.cognitoUserPoolClient.userPoolClientId,
        });
    }
}
