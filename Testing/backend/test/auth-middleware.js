const expect = require('chai').expect;
const jwt = require('jsonwebtoken');
const sinon = require('sinon');

const authMiddleware = require('../middleware/is-auth.js');

describe('Auth middlware', function() {

    it('should throw an error if no authorization header is present', function(){
        const req = {
            get: function(headerName){
                return null; 
            }
        };
        expect(authMiddleware.bind(this, req, {}, () => {})).to.throw('Not Authenticated..!!'); // (this, req, {res}, (cb) => {})
    })
    
    it('should throw an error if the authorization header is only one string', function(){
        const req = {
            get: function(headerName){
                return 'xyz'
            }
        }
        expect(authMiddleware.bind(this, req, {}, () => {})).to.throw()   
    })

    it('should throw an error if the token cannot be verified', function(){
        const req = {
            get: function(headerName){
                return 'Bearer xyz'
            }
        }
        expect(authMiddleware.bind(this, req, {}, () => {})).to.throw()   
    })

    it('should yield a userId after decoding the token', function(){
        const req = {
            get: function(headerName){
                return 'Bearer sdfjkjskfkl'
            }
        } 
        sinon.stub(jwt, 'verify');        //temporarily  replaces original function with this jwt.verify() function
        jwt.verify.returns({ userId: 'abc' });
        authMiddleware(req, {}, () => {});
        expect(req).to.have.property('userId');      // check whether userId is there in req object
        expect(req).to.have.property('userId', 'abc');
        expect(jwt.verify.called).to.be.true;
        jwt.verify.restore();     //restores function to original state 
    })
})
