import FlightSuretyApp from '../../build/contracts/FlightSuretyApp.json';
import Config from './config.json';
import Web3 from 'web3';

export default class Contract {
    constructor(network, callback) {
        let config = Config[network];
        this.web3 = new Web3(new Web3.providers.HttpProvider(config.url));
        this.flightSuretyApp = new this.web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);
        this.initialize(callback);
        this.owner = null;
        this.airlines = [];
        this.passengers = [];
    }

    initialize(callback) {
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

    isOperational(callback) {
       let self = this;
       self.flightSuretyApp.methods
            .isOperational()
            .call({ from: self.owner}, callback);
    }

    fetchFlightStatus(airlineAddress, flightId, callback) {
        let self = this;
        let payload = {
            airlineAddress: airlineAddress,
            flightId: flightId,
            //timestamp: Math.floor(Date.now() / 1000)
        } 
        self.flightSuretyApp.methods
            .fetchFlightStatus(payload.airlineAddress, payload.flightId/*, payload.timestamp*/)
            .send({ from: self.owner}, (error, result) => {
                callback(error, payload);
            });
    }

    registerAirline(airlineAddress, fromAddress, callback) {
        let self = this;
        let payload = {
            airlineAddress: airlineAddress,
            fromAddress: fromAddress
        } 
        console.log("----------Airline address is " + airlineAddress);
        console.log("----------From address is " + fromAddress);
        self.flightSuretyApp.methods
            .registerAirline(payload.airlineAddress)
            .send({ from: payload.fromAddress}, (error, result) => {
                console.log(error);
                console.log(result);
                callback(error, result);
            });
    }

    activateAirline(airlineAddress, fromAddress, callback) {
        let self = this;
        let payload = {
            airlineAddress: airlineAddress,
            fromAddress: fromAddress
        } 
        self.flightSuretyApp.methods
            .activateAirline(payload.airlineAddress)
            .send({ from: payload.fromAddress, value: web3.utils.toWei("10", "ether")}, (error, result) => {
                callback(error, payload);
            });
    }

    getAirlineInfo(airlineAddress, callback) {
        let self = this;
        let payload = {
            airlineAddress: airlineAddress,
        } 
        self.flightSuretyApp.methods
            .getAirlineInfo(payload.airlineAddress)
            .call({ from: payload.airlineAddress}, callback);
    }

    registerFlight(airlineAddress, flightId, callback) {
        let self = this;
        let timestamp = Date.now();
        let payload = {
            airlineAddress: airlineAddress,
            flightId: flightId,
            timestamp: timestamp
        } 
        self.flightSuretyApp.methods
            .registerFlight(flightId, 10, timestamp)
            .send({ from: payload.airlineAddress}, (error, result) => {
                callback(error, payload);
            });
    }

    getFlightInfo(airlineAddress, flightId, callback) {
        let self = this;
        let payload = {
            airlineAddress: airlineAddress,
            flightId: flightId,
        } 
        self.flightSuretyApp.methods
            .getFlightInfo(payload.airlineAddress, payload.flightId)
            .call({ from: payload.airlineAddress}, callback);
    }

    addPassenger(passengerAddress, fromAddress, callback){
        let self = this;
        let payload = {
            passengerAddress: passengerAddress,
            fromAddress: fromAddress
        } 
        self.flightSuretyApp.methods
            .addPassenger(passengerAddress)
            .send({ from: fromAddress}, (error, result) => {
                callback(error, payload);
            });
    }

    getPassengerInfo(passengerAddress, callback) {
        let self = this;
        let payload = {
            passengerAddress: passengerAddress,
        } 
        self.flightSuretyApp.methods
            .getPassenger(payload.passengerAddress)
            .call({ from: payload.passengerAddress}, callback);
    }

    buyInsurance(airlineAddress, flightId, passengerAddress, amount, fromAddress, callback){
        let self = this;
        let payload = {
            airlineAddress: airlineAddress,
            flightId: flightId,
            passengerAddress: passengerAddress,
            amount: amount,
            fromAddress: fromAddress
        } 
        self.flightSuretyApp.methods
            .buyInsurance(airlineAddress, flightId, passengerAddress)
            .send({ from: fromAddress, value: web3.utils.toWei(amount.toString(), "ether")}, (error, result) => {
                callback(error, payload);
            });
    }

    getInsurance(airlineAddress, flightId, passengerAddress, callback) {
        let self = this;
        let payload = {
            airlineAddress: airlineAddress,
            flightId: flightId,
            passengerAddress: passengerAddress
        } 
        self.flightSuretyApp.methods
            .getInsurance(payload.airlineAddress, payload.flightId, payload.passengerAddress)
            .call({ from: payload.passengerAddress}, callback);
 
    }

    withdrawMoney(passengerAddress, amount, callback){
        let self = this;
        let payload = {
            passengerAddress: passengerAddress,
            amount: amount
        } 
        self.flightSuretyApp.methods
            .withDrawMoney(passengerAddress, amount)
            .send({ from: passengerAddress}, (error, result) => {
                callback(error, payload);
            });
    }

}