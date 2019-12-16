
var Test = require('../config/testConfig.js');
var BigNumber = require('bignumber.js');
const truffleAssert = require('truffle-assertions');

contract('Flight Surety Tests', async (accounts) => {

    var config;
    before('setup contract', async () => {
        config = await Test.Config(accounts);
        await config.flightSuretyData.authorizeCaller(config.flightSuretyApp.address);
    });

    /****************************************************************************************/
    /* Operations and Settings                                                              */
    /****************************************************************************************/

    it(`(multiparty) has correct initial isOperational() value`, async function () {

        // Get operating status
        let status = await config.flightSuretyData.isOperational.call();
        assert.equal(status, true, "Incorrect initial operating status value");
  
    });

    it(`(multiparty) can block access to setOperatingStatus() for non-Contract Owner account`, async function () {

        // Ensure that access is denied for non-Contract Owner account
        let accessDenied = false;
        try 
        {
            await config.flightSuretyData.setOperatingStatus(false, { from: config.testAddresses[2] });
        }
        catch(e) {
            accessDenied = true;
        }
        assert.equal(accessDenied, true, "Access not restricted to Contract Owner");
              
    });

    it(`(multiparty) can allow access to setOperatingStatus() for Contract Owner account`, async function () {

        // Ensure that access is allowed for Contract Owner account
        let accessDenied = false;
        try 
        {
            await config.flightSuretyData.setOperatingStatus(false);
        }
        catch(e) {
            accessDenied = true;
        }
        assert.equal(accessDenied, false, "Access not restricted to Contract Owner");
        
    });

    it(`(multiparty) can block access to functions using requireIsOperational when operating status is false`, async function () {

        await config.flightSuretyData.setOperatingStatus(false);

        let reverted = false;
        try 
        {
            await config.flightSuretyData.registerAirline(accounts[2]);
        }
        catch(e) {
            //console.log(e);
            reverted = true;
        }
        assert.equal(reverted, true, "Access not blocked for requireIsOperational");      

        // Set it back for other tests to work
        await config.flightSuretyData.setOperatingStatus(true/*, {nonce: await web3.eth.getTransactionCount(accounts[0])}*/);

    });

    it('(airline) cannot register an Airline using registerAirline() if it is not funded', async () => {
      
        // ARRANGE
        let newAirline = accounts[2];

        // ACT
        try {
            await config.flightSuretyData.registerAirline(config.firstAirline, {from: config.owner});
            await config.flightSuretyData.registerAirline(newAirline, {from: config.firstAirline});
        }
        catch(e) {

        }
        let result = await config.flightSuretyData.isAirline.call(newAirline); 

        // ASSERT
        assert.equal(result, false, "Airline should not be able to register another airline if it hasn't provided funding");

    });

    it('(airline) can register an Airline using registerAirline() if it is funded', async () => {
      
        // ARRANGE
        let newAirline = accounts[2];

        // ACT
        try {
            await config.flightSuretyData.setAirlineActivateStatus(config.firstAirline, true, {from: config.owner});
            let result = await config.flightSuretyData.getAirlineInfo.call(config.firstAirline); 
            await config.flightSuretyData.registerAirline(newAirline, {from: config.firstAirline/*, nonce: await web3.eth.getTransactionCount(config.firstAirline)*/});
        }
        catch(e) {
            console.log(e);

        }
        let result = await config.flightSuretyData.isAirline.call(newAirline); 

        // ASSERT
        assert.equal(result, true, "Airline can register another airline if it is funded");

    });

    it('(airline) can register an Airline from App contract', async () => {
      
        // ARRANGE
        let newAirline = accounts[3];
        console.log(newAirline);


        // ACT
        try {
            console.log('----------1');
            await config.flightSuretyApp.registerAirline(newAirline, {from: config.owner});
            console.log('----------2');
            await config.flightSuretyApp.activateAirline(newAirline, true, {from: config.owner});
            console.log('----------3');
            let result = await config.flightSuretyData.getAirlineInfo.call(newAirline); 
            console.log('----------4');
        }
        catch(e) {
            console.log(e);

        }
        let result = await config.flightSuretyData.isAirline.call(newAirline); 

        // ASSERT
        assert.equal(result, true, "(airline) can register an Airline from App contract");

    });

});
