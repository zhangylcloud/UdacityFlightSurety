module.exports = class OracleSim {
    constructor(numOracles, 
                statusCodeArray,
                flightSuretyApp,
                web3)
    {
        console.log("-----------------1");
        this.numOracles_ = numOracles;
        this.statusCodeArray_ = statusCodeArray;
        this.contract_ = flightSuretyApp;
        this.web3 = web3;
        this.oracles_ = [];
    }

    async createOracle(address, statusCode){
        console.log("-----------------3");
        //console.log(this.contract_);
        //console.log(address);
        try{
            await this.contract_.registerOracle({
                from: address,
                value: this.web3.utils.toWei("1", "ether")
            });
            console.log("-----3.1");
        }
        catch(e){
            console.log(e);
        }
        let indexes = await this.contract_.getMyIndexes({from: address});
        for(let i = 0; i < indexes.length; ++i){
            console.log("----------1 type of index is ", typeof(indexes[i]));
            indexes[i] = indexes[i].toNumber(); 
            console.log("----------2 type of index is ", typeof(indexes[i]));
        }
        return new Oracle(address, indexes, statusCode);
    }

    async registerOracles(){
        console.log("-----------------2");
        let accounts = await this.web3.eth.getAccounts();
        console.log(accounts);
        for(let i = 0; i < this.numOracles_; ++i){
            let account = accounts[20 + i];
            let oracle;
            console.log("-----2.1")
            if(this.statusCodeArray_[i] != undefined) // Ideally should have statusCodeArray length same size as numOracles
                oracle = await this.createOracle(account, this.statusCodeArray_[i]);
            else
                oracle = await this.createOracle(account, 10);
            this.oracles_.push(oracle);
        }
    }

    async getFlightStatuses(index, airlineAddress, flightId){
        console.log("-----------------6");
        let statuses = [];
        for(let i = 0; i < this.oracles_.length; ++i){
            let oracle = this.oracles_[i];
            let status = oracle.getFlightStatus(index, airlineAddress, flightId);
            console.log(status);
            if(status)
                statuses.push(status);
        }
        return statuses;
    }
    
}

class Oracle {
    constructor(address, indexes, statusCode){
        console.log("-----------------Oracle");
        console.log(statusCode);
        this.address_ = address;
        this.indexes_ = indexes;
        this.statusCode_ = statusCode;
    }
    getFlightStatus(index, airlineAddress, flightId){
        console.log("-----------------Oracle getFlightStatus index is: " + index);
        if(this.indexes_.find(ele => {return ele === index})){
            console.log("-----------------index found for this oracle");
            return {
                airlineAddress: airlineAddress,
                flightId: flightId,
                statusCode: this.statusCode_,
                oracleAddress: this.address_
            };
        }
    }

}