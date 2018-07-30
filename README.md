# Kenmyo Image Storage

This is the repo for the Image Storage service for the Kenmyo project.

This project relies on following techniques:

* [Netflix Falcor](http://netflix.github.io/falcor/) for data requesting and tranferring
* [RxJS](https://rxjs-dev.firebaseapp.com/) for async events orchestration
* [Typescript](https://www.typescriptlang.org/) for static type safety
* [mocha](https://mochajs.org/) and [should](https://shouldjs.github.io/) for running tests and assertion
* [tslint](https://palantir.github.io/tslint/) for code lint
* [AWS Lambda](https://docs.aws.amazon.com/lambda/latest/dg/welcome.html) for serving the service
* [AWS Api Gateway](https://docs.aws.amazon.com/apigateway/latest/developerguide/welcome.html) for dispatching requests and authentication
* [AWS IAM](https://docs.aws.amazon.com/IAM/latest/UserGuide/introduction.html) for authentication across internal systems and authorization control
* [AWS SAM](https://github.com/awslabs/serverless-application-model) for hosting lambda and apis locally
* [AWS CloudFormation](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/Welcome.html) for deploying and resource management as a whole
* [AWS SNS](https://docs.aws.amazon.com/sns/latest/dg/welcome.html) to send events accross services
* [AWS Dynamodb](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Introduction.html) to store and query the meta data of images
* [AWS S3](https://docs.aws.amazon.com/AmazonS3/latest/dev/Welcome.html) to store base64 encoded png format images

## Progress

- [x] set up the infrastructure by using the CloudFormation
  - [x] create the api gateway that requires IAM authorization
  - [x] create the dynamodb table and pass the arn of the table as the environment variables to the front router lambda
  - [x] set up dynamodb read and write authorization to the front router lambda
  - [x] create the S3 bucket
  - [x] set up S3 read and write authorization to the front router lambda
  - [x] create the two policies: CanAdd and FullReadAccess and pass them as the environment variables to the front router lambda
  - [x] create the front router lambda that triggered by the api gateway
  - [x] create the image publisher lambda that triggered by the dynamodb stream
- [ ] set up local development environment by using localstack, and add localstack to the previous list
- [ ] implement the `add` function with authorization
- [ ] implement the `get` operation with authorization

## Pre-installation

In order to develop this project locally, you have to install the following tools:

* node.js 8.10 or later 8.xx version
* npm 6.1 or higher
* python 2.7 or python 3.6
* pip with the latest version
* docker with the latest version and python library for docker by using the command `pip install docker`
* [aws cli](https://docs.aws.amazon.com/cli/latest/userguide/installing.html) with the latest version
* [aws sam cli](https://github.com/awslabs/aws-sam-cli) with the latest version

## Run it locally

*may change due to the introduction of dynamodb, SNS and S3*

To serve a local host simply run `npm start`. The server will be served at `http://127.0.0.1:3000`.
The only available API endpoint is `/kenmyo.json` as the `template.yaml` defines.
The server will use the exported function `handler` as the lambda handler from the `app` module as the `template.yml` defines.
`npm start` will automatically clean and rebuild the whole project to `/dist` and use aws sam cli to start the server.
It will set the environment variable `KENMYO_ENV` to `TEST:LOCAL_INTEGRATE`. This is especially useful when doing integration tests locally. When this environment is detected, the lambda may want to call a local mock AWS Service rather when needed.

## Build

All source code should be in the `/src` folder and gets written in typescript. To lint and build the source code, run `npm run build`. It will lint the code and compile the source to `/dist` folder. When errors occur during linting, the complie won't happen.
After compiling successfully, this script will copy `/package.json` to `/dist` and install all the packages in the `dependencies` field.
Note that this is done by `npm install --production`, so any packages in `devDependencies` won't be installed.  If the lambda needs a package to work, install it with `--save` rather than `--save-dev`.

Compiling configuration and lint configuration are in `/tsconfig.json` and `/tslint.yaml` respectively.

## Clean

`npm run clean`
This will remove all the complied asset in `/dist`.

## Test

This project uses `mocha` to run the tests and `should` to do the assertion. Unit test and integration test are treated differently.

### Unit test

The unit test should be right beside the module it tests against and name after it.
For example, the unit test for `/src/app.ts` should be `/src/app.test.ts`. The `*.test.ts` files won't get compiled. They are for unit test, so never name a normal module like that.
To run the test, run `npm test` or `npm test unit`. This will execute the `/scripts/test` script.
This will run all the test in `/src` ended in `.test.ts`. It will set the `KENMYO_ENV` environment variable to `TEST:UNIT`, so the source knows it runs under a unit test environment.

### Integration test

The integration test should be in the `/test` folder.
Before running the test script, you should start the local server by using `npm start`. Then, you can use `npm test integrate` to run all the test in `/test` folder.
As mentioned, the `KENMYO_ENV` environment variable will be set to `TEST:LOCAL_INTEGRATE`, so the source knows it runs in a local integration test environment.
The source may connect to some mock services by using tools like `localstack` rather than true services.
`axios` and extensions to `should.js` may be needed to send http requests to the local server and assert the response.

## Deploy

This project can be deployed to two seperate environments: Staging or Prod.
Before deploying, create `/.aws/config.json` which should have the same structure as `/.aws/config.example.json`. This file will include the AWS credentials, so this file won't be commited.
To deploy to Staging, either `npm run deploy` or `npm run deploy Staging` will work.
To deploy to Prod, run `npm run deploy Prod`.
This will rebuild the project and run the `/scripts/deploy` script.
The script will use the AWS account/user/role specifed by `awsAccessKeyId` and `awsSecretAccessKey` in `/.aws/config.json` to run the AWS Cloudformation services and create all the resources the project needs.
It will run `sam package` to package the files in `/dist` and upload to the S3 bucket specified by `S3Bucket` in `/.aws/config.json` according to the given stage name.
After that, `sam deploy` will be run, with parameters in the `/.aws/config.json` according to the given stage name.
When the project is deployed, this project should be found in the CloudFormation console.
