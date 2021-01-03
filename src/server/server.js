import FlightSuretyApp from '../../build/contracts/FlightSuretyApp.json';
import Config from './config.json';
import Web3 from 'web3';
import express from 'express';
const OracleSim = require('./oracleSim');
const TruffleContract = require("truffle-contract");
const fs = require("fs");

let config = Config['localhost'];
let web3provider = new Web3.providers.WebsocketProvider(config.url.replace('http', 'ws'));
let web3 = new Web3(web3provider);
web3.eth.defaultAccount = web3.eth.accounts[0];
//let FlightSuretyAppABI = JSON.parse(fs.readFileSync('../../build/contracts/FlightSuretyApp.json'));
let flightSuretyApp = TruffleContract(FlightSuretyApp);
flightSuretyApp.setProvider(web3provider);
let flightSuretyAppInstance;
var oracleSim;

async function startServer()
{
    flightSuretyAppInstance = await flightSuretyApp.at(config.appAddress);
    await initializeOracles();


    flightSuretyAppInstance.OracleRequest().on("data", async event =>{
        //console.log(event);
        console.log("-----------------4");
        
        let airlineAddress = event.returnValues.airlineAddress;
        let flightId = event.returnValues.flightId;
        let index = parseInt(event.returnValues.index, 10);
        let flightStatuses;
        try{
            console.log("-----------------5");
            flightStatuses = await oracleSim.getFlightStatuses(index, airlineAddress, flightId);
            console.log(flightStatuses);
        }
        catch(e){
            console.log(e);
        }
        for(let i = 0; i < flightStatuses.length; ++i){
            try{
                console.log("-----submitting oracle responses status code is ", flightStatuses[i].statusCode, 
                    " oracle address is ", flightStatuses[i].oracleAddress);
                await flightSuretyAppInstance.submitOracleResponse(index, 
                                                                   airlineAddress,
                                                                   flightId,
                                                                   flightStatuses[i].statusCode,
                                                                   {from: flightStatuses[i].oracleAddress}); 
            }
            catch(e){
                console.log(e);
            }
        }
    });
       
}
startServer();

async function initializeOracles()
{
    try{
        oracleSim = new OracleSim(20,
                                  [0, 10, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 30, 40, 50, 50],
                                  flightSuretyAppInstance,
                                  web3);
        //oracleSim = new OracleSim(20,
        //                          [20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20],
        //                          flightSuretyAppInstance,
        //                          web3);
        await oracleSim.registerOracles();
    }
    catch(e){
        console.log(e);
    }
}


const app = express();
app.get('/api', (req, res) => {
    res.send({
      message: 'An API for use with your Dapp!'
    })
})

export default app;


