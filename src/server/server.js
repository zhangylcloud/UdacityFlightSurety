import FlightSuretyApp from '../../build/contracts/FlightSuretyApp.json';
import Config from './config.json';
import Web3 from 'web3';
import express from 'express';


let config = Config['localhost'];
let web3 = new Web3(new Web3.providers.WebsocketProvider(config.url.replace('http', 'ws')));
web3.eth.defaultAccount = web3.eth.accounts[0];
let flightSuretyApp = new web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);
//console.log("-----flightSuretyApp is "); 
//console.log(flightSuretyApp); 
//console.log("----------------config.address is ");
//console.log(config.appAddress);
let oracleSim
try{
    oracleSim = new oracleSim(20,
                              [0, 10, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 30, 40, 50, 50],
                              flightSuretyApp,
                              web3);
}
catch(e){
    console.log(e);
}


flightSuretyApp.events.OracleRequest(
    {
        fromBlock: 0
    }, 
    function (error, event) {
        if (error) {
            console.log(error);
            return;
        }
        let airlineAddress = event.returnValues.airlineAddress;
        let flightId = event.returnValues.flightId;
        let index = event.returnValues.index;
        console.log(index);//???????????????check type
        try{
            let flightStatuses = oracleSim.getFlightStatuses(indexes, airlineAddress, flightId);
        }
        catch(e){
            console.log(e);
        }
        for(let i = 0; i < flightStatuses.length; ++i){
            try{
                flightSuretyApp.submitOracleResponse(index, 
                                                     airlineAddress,
                                                     flightId,
                                                     0,
                                                     flightStatuses[i].statusCode); //???????????Need timestamp support
            }
            catch(e){
                console.log(e);
            }
        }
    }
);

const app = express();
app.get('/api', (req, res) => {
    res.send({
      message: 'An API for use with your Dapp!'
    })
})

export default app;


