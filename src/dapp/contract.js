import FlightSuretyApp from '../../build/contracts/FlightSuretyApp.json';
import Config from './config.json';
import Web3 from 'web3';
const TruffleContract = require("truffle-contract");
const util = require('util');

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
            console.log(this.airlines);

            while(this.passengers.length < 5) {
                this.passengers.push(accts[counter++]);
            }
            console.log(this.passengers);

            callback();
        });
    }

    async isOperational() {
        console.log("------------2");
        let instance = await this.flightSuretyApp.at(this.config.appAddress);
        console.log("------------3");
        console.log("this owner is " + this.owner);
        return await instance.isOperational({from: this.owner});
    }

    async fetchFlightStatus(airlineAddress, flightId) {
        let instance = await this.flightSuretyApp.at(this.config.appAddress);
        return await instance.fetchFlightStatus(airlineAddress, flightId, {from: airlineAddress});
    }

    async registerAirline(airlineAddress, fromAddress) {
        let instance = await this.flightSuretyApp.at(this.config.appAddress);
        return await instance.registerAirline(airlineAddress, {from: fromAddress});
    }

    async activateAirline(airlineAddress, fromAddress) {
        let instance = await this.flightSuretyApp.at(this.config.appAddress);
        return await instance.activateAirline(airlineAddress, {from: fromAddress, value: this.web3.utils.toWei("10", "ether")});
    }

    async getAirlineInfo(airlineAddress) {
        let instance = await this.flightSuretyApp.at(this.config.appAddress);
        return await instance.getAirlineInfo(airlineAddress, {from: airlineAddress});
    }

    async registerFlight(airlineAddress, flightId) {
        let timestamp = Date.now();
        let instance = await this.flightSuretyApp.at(this.config.appAddress);
        return await instance.registerFlight(flightId, 
                                             10, 
                                             timestamp,
                                             {from: airlineAddress});
    }

    async getFlightInfo(airlineAddress, flightId) {
        let instance = await this.flightSuretyApp.at(this.config.appAddress);
        return await instance.getFlightInfo(airlineAddress, flightId);
    }

    //async updateFlightStatus(airlineAddress, flightId) {
    //    let instance = await this.flightSuretyApp.at(this.config.appAddress);
    //    console.log("-----calling fetch flight status")
    //    return await instance.fetchFlightStatus(airlineAddress, flightId, {from: airlineAddress});
    //}

    async addPassenger(passengerAddress){
        let instance = await this.flightSuretyApp.at(this.config.appAddress);
        return await instance.addPassenger(passengerAddress, {from: passengerAddress});
    }

    async getPassengerInfo(passengerAddress) {
        let instance = await this.flightSuretyApp.at(this.config.appAddress);
        return await instance.getPassenger(passengerAddress, {from: passengerAddress});
    }

    async buyInsurance(airlineAddress, flightId, passengerAddress, amount){
        let instance = await this.flightSuretyApp.at(this.config.appAddress);
        return await instance.buyInsurance(airlineAddress,
                                           flightId,
                                           passengerAddress,
                                           {from: passengerAddress,
                                           value: this.web3.utils.toWei(amount, "ether")});
    }

    async getInsurance(airlineAddress, flightId, passengerAddress) {
        let instance = await this.flightSuretyApp.at(this.config.appAddress);
        return await instance.getInsurance(airlineAddress,
                                           flightId,
                                           passengerAddress,
                                           {from: passengerAddress});
    }

    async withdrawMoney(passengerAddress, amount){
        let instance = await this.flightSuretyApp.at(this.config.appAddress);
        return await instance.withdrawMoney(passengerAddress,
                                            this.web3.utils.toWei(amount, "ether"),
                                            {from: passengerAddress});
    }
}