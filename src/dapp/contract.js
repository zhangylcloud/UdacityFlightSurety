import FlightSuretyApp from '../../build/contracts/FlightSuretyApp.json';
import Config from './config.json';
import Web3 from 'web3';
const TruffleContract = require("truffle-contract");

export default class Contract {
    constructor(network, callback) {
        this.config = Config[network];
        let web3provider = new Web3.providers.WebsocketProvider(this.config.url.replace('http', 'ws'));
        this.web3 = new Web3(web3provider);
        //this.flightSuretyApp = new this.web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);
        this.flightSuretyApp = TruffleContract(FlightSuretyApp);
        this.flightSuretyApp.setProvider(web3provider);
        this.initialize(callback);
        this.owner = null;
        this.airlines = [];
        this.passengers = [];
    }

    async initialize(callback) {
        this.web3.eth.getAccounts((error, accts) => {
           
            this.owner = accts[0];

            let counter = 1;
            
            while(this.airlines.length < 5) {
                this.airlines.push(accts[counter++]);
            }

            while(this.passengers.length < 5) {
                this.passengers.push(accts[counter++]);
            }

            callback();
        });
    }

    //isOperational(callback) {
    //   let self = this;
    //   self.flightSuretyApp.methods
    //        .isOperational()
    //        .call({ from: self.owner}, callback);
    //}

    //fetchFlightStatus(airlineAddress, flightId, callback) {
    //    let self = this;
    //    let payload = {
    //        airlineAddress: airlineAddress,
    //        flightId: flightId,
    //        //timestamp: Math.floor(Date.now() / 1000)
    //    } 
    //    self.flightSuretyApp.methods
    //        .fetchFlightStatus(payload.airlineAddress, payload.flightId/*, payload.timestamp*/)
    //        .send({ from: self.owner}, (error, result) => {
    //            callback(error, payload);
    //        });
    //}

    async registerAirline(airlineAddress, fromAddress) {
        let self = this;
        //let payload = {
        //    airlineAddress: airlineAddress,
        //    fromAddress: fromAddress
        //} 
        let instance = await this.flightSuretyApp.at(this.config.appAddress);
        console.log("----------Airline address is " + airlineAddress);
        console.log("----------From address is " + fromAddress);
        return await instance.registerAirline(airlineAddress, {from: fromAddress});
        //self.flightSuretyApp.methods
        //    .registerAirline(payload.airlineAddress)
        //    .send({ from: payload.fromAddress}, (error, result) => {
        //        console.log(error);
        //        console.log(result);
        //        callback(error, result);
        //    });
    }

    async activateAirline(airlineAddress, fromAddress) {
        let instance = await this.flightSuretyApp.at(this.config.appAddress);
        return await instance.activateAirline(airlineAddress, {from: fromAddress, value: this.web3.utils.toWei("10", "ether")});
        //self.flightSuretyApp.methods
        //    .activateAirline(payload.airlineAddress)
        //    .send({ from: payload.fromAddress, value: this.web3.utils.toWei("10", "ether")}, (error, result) => {
        //        callback(error, payload);
        //    });
    }

    async getAirlineInfo(airlineAddress) {
        let instance = await this.flightSuretyApp.at(this.config.appAddress);
        return await instance.getAirlineInfo(airlineAddress, {from: airlineAddress});
    }

    //registerFlight(airlineAddress, flightId, callback) {
    //    let self = this;
    //    let timestamp = Date.now();
    //    let payload = {
    //        airlineAddress: airlineAddress,
    //        flightId: parseInt(flightId),
    //        timestamp: timestamp
    //    } 
    //    console.log(payload);
    //    self.flightSuretyApp.methods
    //        .registerFlight(payload.flightId, 10, payload.timestamp)
    //        .send({ from: payload.airlineAddress}, (error, result) => {
    //            callback(error, result);
    //        });
    //}

    //getFlightInfo(airlineAddress, flightId, callback) {
    //    let self = this;
    //    let payload = {
    //        airlineAddress: airlineAddress,
    //        flightId: parseInt(flightId),
    //    } 
    //    self.flightSuretyApp.methods
    //        .getFlightInfo(payload.airlineAddress, payload.flightId)
    //        .call({ from: payload.airlineAddress}, callback);
    //}

    //addPassenger(passengerAddress, fromAddress, callback){
    //    let self = this;
    //    let payload = {
    //        passengerAddress: passengerAddress,
    //        fromAddress: fromAddress
    //    } 
    //    self.flightSuretyApp.methods
    //        .addPassenger(passengerAddress)
    //        .send({ from: fromAddress}, (error, result) => {
    //            callback(error, result);
    //        });
    //}

    //getPassengerInfo(passengerAddress, callback) {
    //    let self = this;
    //    let payload = {
    //        passengerAddress: passengerAddress,
    //    } 
    //    self.flightSuretyApp.methods
    //        .getPassenger(payload.passengerAddress)
    //        .call({ from: payload.passengerAddress}, callback);
    //}

    //buyInsurance(airlineAddress, flightId, passengerAddress, amount, fromAddress, callback){
    //    let self = this;
    //    let payload = {
    //        airlineAddress: airlineAddress,
    //        flightId: flightId,
    //        passengerAddress: passengerAddress,
    //        amount: amount,
    //        fromAddress: fromAddress
    //    } 
    //    self.flightSuretyApp.methods
    //        .buyInsurance(airlineAddress, flightId, passengerAddress)
    //        .send({ from: fromAddress, value: this.web3.utils.toWei(amount.toString(), "ether")}, (error, result) => {
    //            callback(error, result);
    //        });
    //}

    //getInsurance(airlineAddress, flightId, passengerAddress, callback) {
    //    let self = this;
    //    let payload = {
    //        airlineAddress: airlineAddress,
    //        flightId: flightId,
    //        passengerAddress: passengerAddress
    //    } 
    //    self.flightSuretyApp.methods
    //        .getInsurance(payload.airlineAddress, payload.flightId, payload.passengerAddress)
    //        .call({ from: payload.passengerAddress}, callback);
 
    //}

    //withdrawMoney(passengerAddress, amount, callback){
    //    let self = this;
    //    let payload = {
    //        passengerAddress: passengerAddress,
    //        amount: amount
    //    } 
    //    self.flightSuretyApp.methods
    //        .withDrawMoney(passengerAddress, amount)
    //        .send({ from: passengerAddress}, (error, result) => {
    //            callback(error, result);
    //        });
    //}

    //callDummy(callback){
    //    let self = this;
    //    self.flightSuretyApp.methods
    //        .callDummy()
    //        .send({ from: self.owner}, (error, result) => {
    //            callback(error, result);
    //        });
    //}
}