const truffleAssert = require('truffle-assertions');
var Test = require('../config/testConfig.js');
//var BigNumber = require('bignumber.js');

contract('Oracles', async (accounts) => {

    // Watch contract events
    const STATUS_CODE_UNKNOWN = 0;
    const STATUS_CODE_ON_TIME = 10;
    const STATUS_CODE_LATE_AIRLINE = 20;
    const STATUS_CODE_LATE_WEATHER = 30;
    const STATUS_CODE_LATE_TECHNICAL = 40;
    const STATUS_CODE_LATE_OTHER = 50;

    const TEST_ORACLES_COUNT = 1;
    var config;
    before('setup contract', async () => {
        config = await Test.Config(accounts);
    });


    it('can register oracles', async () => {
        // ARRANGE
        let fee = await config.flightSuretyApp.REGISTRATION_FEE.call();
        // ACT
        try{
            for(let a=0; a<TEST_ORACLES_COUNT; a++) {      
                let oracleAcct = 20 + a + 1;
                await config.flightSuretyApp.registerOracle({ from: accounts[oracleAcct], value: fee });
                let result = await config.flightSuretyApp.getMyIndexes.call({from: accounts[oracleAcct]});
                console.log(`Oracle Registered: ${result[0]}, ${result[1]}, ${result[2]}`);
            }
        }
        catch(e){
            console.log(e);
        }
    });

    it('Register an insurance', async () => {
        await config.flightSuretyApp.registerAirline(accounts[1], {from: accounts[0]});
        await config.flightSuretyApp.activateAirline(accounts[1], {from: accounts[0], value: web3.utils.toWei("10", "ether")});
        await config.flightSuretyApp.registerFlight(1, 10, Date.now(), {from: accounts[1]});
        await config.flightSuretyApp.addPassenger(accounts[11], {from: accounts[0]});
        await config.flightSuretyApp.buyInsurance(accounts[1], 1, accounts[11], {from: accounts[11], value: web3.utils.toWei("0.5", "ether")});

        let result = await config.flightSuretyApp.getInsurance(accounts[1], 1, accounts[11], {from: accounts[11]});
        console.log("-----------------result is ");
        console.log(result);

        await config.flightSuretyApp.fetchFlightStatus(accounts[1], 1);
        let oracleIndexes = await config.flightSuretyApp.getMyIndexes({ from: accounts[21]});
        console.log("------------oracle indexes is ");
        console.log(oracleIndexes);

        try {
            //let result11 = await config.flightSuretyApp.submitOracleResponse(1, accounts[1], 1, STATUS_CODE_LATE_AIRLINE, { from: accounts[21] });
            let result11 = await config.flightSuretyData.creditInsuree(accounts[1], 
                                                                       1, 
                                                                       accounts[11], 
                                                                       3, 
                                                                       2,
                                                                       { from: accounts[1] });
            truffleAssert.eventEmitted(result11, 'testing', (ev) => {
                console.log("-----------events are ");
                console.log(ev);
                return true;
            });
            let result1= await config.flightSuretyApp.getInsurance(accounts[1], 1, accounts[11], {from: accounts[11]});
            console.log("-----------------result1 is ");
            console.log(result1);
        }
        catch(e) {
            console.log(e);
        }
        try {
            let result2= await config.flightSuretyApp.getPassenger(accounts[11], {from: accounts[11]});
            console.log("-----------------result2 is ");
            console.log(result2);
        }
        catch(e) {
            console.log(e);
        }
    });

    //it('can request flight status', async () => {

    //    // ARRANGE
    //    let flight = 1; 
    //    let timestamp = Math.floor(Date.now() / 1000);

    //    // Submit a request for oracles to get status information for a flight
    //    await config.flightSuretyApp.fetchFlightStatus(config.firstAirline, flight);
    //    //console.log("submitted fetchFlightStatus");
    //    //truffleAssert.eventEmitted(result1, 'OracleRequest', (ev) => {
    //    //    console.log(ev);
    //    //    return true;
    //    //});
    //    // ACT

    //    // Since the Index assigned to each test account is opaque by design
    //    // loop through all the accounts and for each account, all its Indexes (indices?)
    //    // and submit a response. The contract will reject a submission if it was
    //    // not requested so while sub-optimal, it's a good test of that feature
    //    for(let a=1; a<TEST_ORACLES_COUNT; a++) {

    //      // Get oracle information
    //        let oracleIndexes = await config.flightSuretyApp.getMyIndexes.call({ from: accounts[a]});
    //        for(let idx=0;idx<3;idx++) {
    //            try {
    //                // Submit a response...it will only be accepted if there is an Index match
    //                await config.flightSuretyApp.submitOracleResponse(oracleIndexes[idx], config.firstAirline, flight, timestamp, STATUS_CODE_ON_TIME, { from: accounts[a] });

    //            }
    //            catch(e) {
    //                // Enable this when debugging
    //                //console.log(e);
    //                console.log('\nError', idx, oracleIndexes[idx].toNumber(), flight, timestamp);
    //            }
    //        }
    //    }


    //});


 
});
