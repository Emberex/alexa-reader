# alexa-bookreader

## Setup

Create a `.env` file in the lambda folder

    $ cp .env.example .env

Configure your AWS credentials: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_ROLE_ARN`.

* `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` can be found or created [here](https://console.aws.amazon.com/iam/home?region=us-east-1#/security_credential) under "Access keys".
* For `AWS_ROLE_ARN`, you may need to create a new role [here](https://console.aws.amazon.com/iam/home?region=us-east-1#/roles). Use the "Lambda" service and the "AWSLambdaBasicExecutionRole" permission policy.

Deploy the Lambda function with `npm run deploy`. Add the "Alexa Skills Kit" trigger to the resulting function.

Next, create a new Alexa skill [here](https://developer.amazon.com/edw/home.html#/skills).

* Skill type: Custom Interaction Model
* Use the contents of the `intent-schema.json`, `slots`, and `sample-utterences` files in the "Interaction Model" step.
* In the "Configuration" step, set the "service endpoint type" to "AWS Lambda ARN" and use the ARN of your [lambda function](https://console.aws.amazon.com/lambda/home?region=us-east-1#/functions).

Setup the postgres database using the `scripts/setup_db.sql` and `scripts/seed_db.js` scripts.

Start the skill server by running `npm run start` (or `npm run watch` during development).
