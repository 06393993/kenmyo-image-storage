const config = {
    imageCreatedTopicArn: process.env.IMAGE_CREATED_TOPIC_ARN,
    imagesMetaTableName: process.env.IMAGES_META_TABLE_NAME,
    imagesS3BucketName: process.env.IMAGES_S3_BUCKET_NAME,
};

if (process.env.KENMYO_ENV.startsWith("TEST:")) {
    config.imageCreatedTopicArn = "arn:aws:sns:us-east-1:123456789012:image-created";
    config.imagesMetaTableName = "image-meta-table";
    config.imagesS3BucketName = "images-s3-bucket";
}

if (process.env.KENMYO_ENV === "TEST:LOCAL_INTEGRATE") {
    // tslint:disable-next-line
    const AWS = require('aws-sdk');
    let dockerHost = "172.17.0.1";
    if (process.platform === "win32") {
        dockerHost = "host.docker.internal";
    }
    AWS.config.dynamodb = {
        ...AWS.config.dynamodb,
        endpoint: `http://${dockerHost}:4569`,
    };
    AWS.config.sns = {
        ...AWS.config.sns,
        endpoint: `http://${dockerHost}:4575`,
    };
    AWS.config.s3 = {
        ...AWS.config.s3,
        endpoint: `http://${dockerHost}:4572`,
        s3ForcePathStyle: true,
    };
}

export { config };
