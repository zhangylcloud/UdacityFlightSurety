
var Test = require('../config/testConfig.js');
var BigNumber = require('bignumber.js');
const truffleAssert = require('truffle-assertions');


contract('Flight Surety Tests', async (accounts) => {
    console.log(accounts[0]);
    console.log(accounts[1]);
    console.log(accounts[2]);
    console.log(accounts[3]);
    console.log(accounts[4]);
    console.log(accounts[5]);

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
            await config.flightSuretyData.registerAirline(accounts[2], accounts[0]);
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
      
        // ACT
        try {
            await config.flightSuretyData.registerAirline(accounts[1], accounts[0], {from: accounts[0]});
            await config.flightSuretyData.registerAirline(accounts[2], accounts[1], {from: accounts[1]});
        }
        catch(e) {
        }
        let result = await config.flightSuretyData.isAirline.call(accounts[2]); 

        // ASSERT
        assert.equal(result, false, "Airline should not be able to register another airline if it hasn't provided funding");

    });

    it('(airline) can register an Airline using registerAirline() if it is funded', async () => {
      
        // ACT
        try {
            await config.flightSuretyData.setAirlineActivateStatus(accounts[1], true, {from: accounts[0]});
            let result = await config.flightSuretyData.getAirlineInfo.call(accounts[1]); 
            await config.flightSuretyData.registerAirline(accounts[2], accounts[1], {from: accounts[1]/*, nonce: await web3.eth.getTransactionCount(config.firstAirline)*/});
            await config.flightSuretyData.setAirlineActivateStatus(accounts[2], true, {from: accounts[0]});
        }
        catch(e) {
        }
        let result = await config.flightSuretyData.isAirline.call(accounts[2]); 

        // ASSERT
        assert.equal(result, true, "Airline can register another airline if it is funded");

    });
//
//
    //it('dummy test', async () => {
    //  
    //    try {
    //        await config.flightSuretyApp.callDummy();
    //    }
    //    catch(e) {
    //        console.log(e);

    //    }
    //    // ASSERT
    //    assert.equal(true, true, "Dummy");
    //});

    it('(airline) can register an Airline from App contract', async () => {
      
        // ARRANGE

        // ACT
        try {
            let result1 = await config.flightSuretyApp.registerAirline(accounts[3], {from: accounts[0]});
            //truffleAssert.eventEmitted(result1, 'testing', (ev) => {
            //    console.log(ev);
            //    return true;
            //});
            await config.flightSuretyApp.activateAirline(accounts[3], {from: accounts[0], value: web3.utils.toWei("10", "ether")});
        }
        catch(e) {
        }
        let result = await config.flightSuretyData.isAirline.call(accounts[3]); 

        // ASSERT
        assert.equal(result, true, "(airline) can register an Airline from App contract");
    });


    it('above threshold, airline can only be registered after vote', async () => {
        let result1 = result4 = false;
        let result2 = result3 = true;

        try {
            await config.flightSuretyApp.registerAirline(accounts[4], {from: accounts[0]});
            result1 = await config.flightSuretyData.isAirline.call(accounts[4]); 
            await config.flightSuretyApp.activateAirline(accounts[4], {from: accounts[0], value: web3.utils.toWei("10", "ether")});

            await config.flightSuretyApp.registerAirline(accounts[5], {from: accounts[0]});
            result2 = await config.flightSuretyData.isAirline.call(accounts[5]); 

            await config.flightSuretyApp.registerAirline(accounts[5], {from: accounts[1]});
            result3 = await config.flightSuretyData.isAirline.call(accounts[5]); 

            await config.flightSuretyApp.registerAirline(accounts[5], {from: accounts[2]});
            result4 = await config.flightSuretyData.isAirline.call(accounts[5]); 

            await config.flightSuretyApp.activateAirline(accounts[5], {from: accounts[0], value: web3.utils.toWei("10", "ether")});
        }
        catch(e) {
            console.log(e);
        }
        assert.equal(result1, true, "The fifth airline can be registered directly without vote");
        assert.equal(result2, false, "The sixth airline should be registered via vote");
        assert.equal(result3, false, "2/5 votes not enough");
        assert.equal(result4, true, "3/5 votes should work, sixth airline registered");

    });

    it('Can add passenger', async () => {
      
        try {
            await config.flightSuretyApp.addPassenger(accounts[8], {from: accounts[0]});
        }
        catch(e) {
        }
        let result = await config.flightSuretyData.isPassenger.call(accounts[8]); 

        // ASSERT
        assert.equal(result, true, "Can add passenger");
    });

    it('Airline can add flight', async () => {
        try {
            await config.flightSuretyApp.registerFlight(1, 10, Date.now(), {from: accounts[1]});
        }
        catch(e) {
        }
        let result = await config.flightSuretyApp.getFlightInfo.call(accounts[1], 1); 

        // ASSERT
        assert.equal(result[0], 1, "Airline can add flight");
    });

    it('Passenger can buy insurance', async () => {
        try {
            await config.flightSuretyApp.buyInsurance(accounts[1], 1, accounts[8], {from: accounts[8], value: web3.utils.toWei("0.5", "ether")});
        }
        catch(e) {
            console.log(e);
        }
        let result = await config.flightSuretyApp.getInsurance.call(accounts[1], 1, accounts[8]); 

        // ASSERT
        assert.equal(result[1], 1, "Passenger can buy insurance");
        assert.equal(result[4], web3.utils.toWei("0.5", "ether"), "Passenger can buy insurance");
    });

});
