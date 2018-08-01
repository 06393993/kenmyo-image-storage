require('should');
import AWS = require('aws-sdk');
import * as axios from 'axios';

const host = 'http://127.0.0.1:3000';

describe('my first', function () {
    this.timeout(20000);
    it('should be able to be visited through /images.json', async function () {
        const { data } = await axios.get(`${host}/images.json`);
        console.log(data);
    });
});
