require('should');
import { handler } from './app';

describe('abcd', function () {
    it('should have handler as a function', function () {
        handler.should.be.a.Function();
    });

    it('should fail', function () {
        (1).should.be.eql(2);
    });
});
