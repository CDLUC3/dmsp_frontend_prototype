import {Amplify} from "aws-amplify";

const awsConfig = {
  Auth: {
    Cognito: {
      userPoolId: process.env.NEXT_PUBLIC_USER_POOL_ID,
      region:process.env.NEXT_PUBLIC_REGION,
      userPoolClientId: process.env.NEXT_PUBLIC_POOL_APP_CLIENT_ID,
      loginWith: {
        username: 'true'
      }
    }

  }
} 

export default awsConfig