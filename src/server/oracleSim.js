module.exports = class OracleSim {
    constructor(numOracles, 
                statusCodeArray,
                flightSuretyApp,
                web3)
    {
        this.numOracles_ = numOracles;
        this.statusCodeArray_ = statusCodeArray;
        this.contract_ = flightSuretyApp;
        this.web3 = web3;
        this.oracles_ = [];
    }

    async createOracle(address, statusCode){
        try{
            await this.contract_.registerOracle({
                from: address,
                value: this.web3.utils.toWei("1", "ether");
            });
        }
        catch(e){
            console.log(e);
        }
        let indexes = await this.contract_.getMyIndexes({from: address});
        for(let i = 0; i < indexes.length; ++i){
            indexes[i] = indexes[i].toNumber(); //??????????????????/
        }
        return new Oracle(address, indexes, statusCode);
    }

    async registerOracles(){
        let accounts = await this.web3.eth.getAccounts();
        for(let i = 0; i < this.numOracles_; ++i){
            let account = accounts[10 + i];
            let oracle;
            if(this.statusCodeArray_[i]) // Ideally should have statusCodeArray length same size as numOracles
                oracle = await this.createOracle(account, this.statusCodeArray_[i]);
            else
                oracle = await this.createOracle(account, 10);
            this.oracles_.push(oracle);
        }
    }

    async getFlightStatuses(index, airlineAddress, flightId){
        let statuses = [];
        for(let i = 0; i < this.oracles_.length; ++i){
            let oracle = this.oracles_[i];
            let status = oracle.getFlightStatus(index, airlineAddress, flightId);
            if(status)
                statuses.push(status);
        }
        return statuses;
    }
}

class Oracle {
    constructor(address, indexes, statusCode){
        this.address_ = address;
        this.indexes_ = indexes;
        this.statusCode_ = statusCode;
    }
    getFlightStatus(index, airlineAddress, flightId){
        if(this.indexes_.find(ele => {return ele === index}))
            return {
                airlineAddress: airlineAddress,
                flightId: flightId,
                statusCode: this.statusCode_,
                oracleAddress: this.address
            };
    }

}