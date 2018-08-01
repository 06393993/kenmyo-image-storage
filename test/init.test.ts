const AWSConfig = require('../.aws/config.json');
import { config } from '../src/config/config';
import { promisify } from 'util';
import AWS = require('aws-sdk');

AWS.config.update({
    region: AWSConfig.awsDefaultRegion,
});

const s3 = new AWS.S3();
const sns = new AWS.SNS();
const topicName = config.imageCreatedTopicArn.split(':').slice(-1)[0];

const dynamodb = new AWS.DynamoDB();

before(async function () {
    await promisify(sns.createTopic.bind(sns))({
        Name: topicName,
    });

    await promisify(s3.createBucket.bind(s3))({
        Bucket: config.imagesS3BucketName,
    });

    await promisify(dynamodb.createTable.bind(dynamodb))({
        AttributeDefinitions: [{
            AttributeName: "id",
            AttributeType: "S",
        }],
        KeySchema: [{
            AttributeName: "id",
            KeyType: "HASH",
        }],
        TableName: config.imagesMetaTableName,
        ProvisionedThroughput: {
            ReadCapacityUnits: 5, 
            WriteCapacityUnits: 5
        }, 
    });
});

after(async function () {
    const p = [];
    p.push(promisify(sns.deleteTopic.bind(sns))({
        TopicArn: config.imageCreatedTopicArn,
    }));
    p.push((async () => {
        const { Contents } = await promisify(s3.listObjects.bind(s3))({
            Bucket: config.imagesS3BucketName,
        });
        await promisify(s3.deleteObjects.bind(s3))({
            Bucket: config.imagesS3BucketName,
            Delete: { Objects: Contents.map(({ Key }) => ({ Key })) },
        });
        await promisify(s3.deleteBucket.bind(s3))({
            Bucket: config.imagesS3BucketName,
        });
    })());

    p.push(promisify(dynamodb.deleteTable.bind(dynamodb))({
        TableName: config.imagesMetaTableName,
    }));

    await Promise.all(p);
});
