require('should');
import * as axios from 'axios';

const host = 'http://127.0.0.1:3000';

describe('my first', function () {
    this.timeout(20000);
    it('should be able to be visited through /kenmyo.json', async function () {
        await axios.get(`${host}/kenmyo.json`);
    });
});
