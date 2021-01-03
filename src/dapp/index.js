
import DOM from './dom';
import Contract from './contract';
import './flightsurety.css';

(async() => {

    let result = null;

    let contract = new Contract('localhost', async () => {

        // Handle tab bar switches
        let airlineSwitch = DOM.elid('airline-tab-switch');
        let flightSwitch = DOM.elid('flight-tab-switch');
        let passengerSwitch = DOM.elid('passenger-tab-switch');
        let insuranceSwitch = DOM.elid('insurance-tab-switch');
        let statusSwitch = DOM.elid('status-tab-switch');

        let switchList = 
        [
            airlineSwitch, 
            flightSwitch, 
            passengerSwitch,
            insuranceSwitch,
            statusSwitch
        ]

        let airlineSection = DOM.elid('airline-section');
        let flightSection = DOM.elid('flight-section');
        let passengerSection = DOM.elid('passenger-section');
        let insuranceSection = DOM.elid('insurance-section');
        let statusSection = DOM.elid('status-section');

        let sectionList = 
        [
            airlineSection,
            flightSection,
            passengerSection,
            insuranceSection,
            statusSection
        ]

        for(let i = 0; i < switchList.length; ++i){
            let curSwitch = switchList[i];
            let curSection = sectionList[i];
            curSwitch.addEventListener("click", () => {
                for(let j = 0; j < switchList.length; ++j){
                    sectionList[j].style.display = "none";
                }
                curSection.style.display = "block";
            });
        }

         


        // Read transaction
        //var result1;
        //try{
        //    console.log("---------1")
        //    result1 = await contract.isOperational();
        //}
        //catch(e){
        //    console.log(e);
        //    display('status', 'Operational Status', 'Check if contract is operational', [ { label: 'Operational Status', value: result1} ]);
        //}
        //contract.isOperational((error, result) => {
        //    console.log(error,result);
        //    display('status', 'Operational Status', 'Check if contract is operational', [ { label: 'Operational Status', error: error, value: result} ]);
        //});

        // User-submitted transaction
        DOM.elid('submit-oracle-btn').addEventListener('click', async () => {
            let airlineAddress = DOM.elid('airline-address-status').value;
            let flightId = DOM.elid('flight-number').value;
            try{
                await contract.fetchFlightStatus(airlineAddress, flightId);
            }
            catch(e){
                DOM.elid('status-text').innerHTML = "Fail to submit request to oracles";
                console.log(e);
                return;
            }
        })

        // Register Airlines
        DOM.elid('airline-register-btn').addEventListener('click', async () => {
            let airlineAddress = DOM.elid('airline-address').value;
            let fromAddress = DOM.elid('airline-register-address').value;
            let result;
            try{
                result = await contract.registerAirline(airlineAddress, fromAddress);
            }
            catch(e){
                DOM.elid('airline-text').innerHTML = "Fail to register airline";
                console.log(e);
                return;
            }
            try{
                result = await contract.getAirlineInfo(airlineAddress);
            }
            catch(e){
                DOM.elid('airline-text').innerHTML = "This address is invalid or not a registered airline";
                console.log(e);
                return;
            }
            let airlineAddressRet = result[0];
            let airlineActivated = result[1];
            DOM.elid('airline-text').innerHTML = "Airline address: " + airlineAddressRet + "<br>";
            DOM.elid('airline-text').innerHTML += "Airline activated: " + airlineActivated + "\n";
        })

        // Activate Airlines
        DOM.elid('airline-activation-btn').addEventListener('click', async () => {
            let airlineAddress = DOM.elid('airline-address').value;
            let fromAddress = DOM.elid('airline-register-address').value;
            let result;
            try{
                result = await contract.activateAirline(airlineAddress, fromAddress);
            }
            catch(e){
                DOM.elid('airline-text').innerHTML = "Fail to activate airline";
                console.log(e);
                return;
            }
            try{
                result = await contract.getAirlineInfo(airlineAddress);
            }
            catch(e){
                DOM.elid('airline-text').innerHTML = "This address is invalid or not a registered airline";
                console.log(e);
                return;
            }
            let airlineAddressRet = result[0];
            let airlineActivated = result[1];
            DOM.elid('airline-text').innerHTML = "Airline address: " + airlineAddressRet + "<br>";
            DOM.elid('airline-text').innerHTML += "Airline activated: " + airlineActivated + "\n";
        })

        // Get Airlines
        DOM.elid('airline-get-btn').addEventListener('click', async () => {
            let airlineAddress = DOM.elid('airline-address').value;
            let result = {};
            try{
                result = await contract.getAirlineInfo(airlineAddress);
            }
            catch(e){
                DOM.elid('airline-text').innerHTML = "This address is invalid or not a registered airline";
                console.log(e);
                return;
            }
            let airlineAddressRet = result[0];
            let airlineActivated = result[1];
            DOM.elid('airline-text').innerHTML = "Airline address: " + airlineAddressRet + "<br>";
            DOM.elid('airline-text').innerHTML += "Airline activated: " + airlineActivated + "<br>";
            console.log(result);
        })

        // Add Flight 
        DOM.elid('flight-register-btn').addEventListener('click', async () => {
            let airlineAddress = DOM.elid('airline-address-flight').value;
            let flightId = DOM.elid('flight-id').value;
            // Write transaction
            try{
                await contract.registerFlight(airlineAddress, flightId);
            }
            catch(e){
                DOM.elid('flight-text').innerHTML = "Fail to register flight";
                console.log(e);
                return;
            }
            let result = {};
            try{
                result = await contract.getFlightInfo(airlineAddress, flightId);
            }
            catch(e){
                DOM.elid('flight-text').innerHTML = "Fail to get flight info";
                console.log(e);
                return;
            }
            let flightIdRet= result[0];
            let airlineAddressRet = result[1];
            let statusCode = result[2];
            let timestamp = result[3];
            DOM.elid('flight-text').innerHTML = "Airline address: " + airlineAddressRet + "<br>";
            DOM.elid('flight-text').innerHTML += "Flight ID: " + flightIdRet + "<br>";
            DOM.elid('flight-text').innerHTML += "Flight Status: " + statusCode + "<br>";
            DOM.elid('flight-text').innerHTML += "Flight Timestamp: " + timestamp + "<br>";
        })

        // Get Flight 
        DOM.elid('flight-get-btn').addEventListener('click', async () => {
            let airlineAddress = DOM.elid('airline-address-flight').value;
            let flightId = DOM.elid('flight-id').value;
            let result = {};
            try{
                result = await contract.getFlightInfo(airlineAddress, flightId);
            }
            catch(e){
                DOM.elid('flight-text').innerHTML = "Fail get flight info";
                console.log(e);
                return;
            }
            let flightIdRet= result[0];
            let airlineAddressRet = result[1];
            let statusCode = result[2];
            let timestamp = result[3];
            DOM.elid('flight-text').innerHTML = "Airline address: " + airlineAddressRet + "<br>";
            DOM.elid('flight-text').innerHTML += "Flight ID: " + flightIdRet + "<br>";
            DOM.elid('flight-text').innerHTML += "Flight Status: " + statusCode + "<br>";
            DOM.elid('flight-text').innerHTML += "Flight Timestamp: " + timestamp + "<br>";
            console.log(result);
        })

        // update flight status, will trigger oracle 
        //DOM.elid('flight-update-btn').addEventListener('click', async () => {
        //    let airlineAddress = DOM.elid('airline-address-flight').value;
        //    let flightId = DOM.elid('flight-id').value;
        //    // Write transaction
        //    console.log("before calling updateFlightStatus");
        //    let result = await contract.updateFlightStatus(airlineAddress, flightId);
        //    console.log(result);
        //        //display('airline', 'Oracles', 'Trigger oracles', [ { label: 'Fetch Flight Status', error: error, value: result.airline + ' ' + result.flight + ' ' + result.timestamp} ]);
        //})


        // Add Passenger 
        DOM.elid('passenger-register-btn').addEventListener('click', async () => {
            let passengerAddress = DOM.elid('passenger-address').value;
            let result = {};
            try{
                result = await contract.addPassenger(passengerAddress);
            }
            catch(e){
                DOM.elid('passenger-text').innerHTML = "Fail to add passenger";
                console.log(e);
                return;
            }
            try{
                result = await contract.getPassengerInfo(passengerAddress);
            }
            catch(e){
                DOM.elid('passenger-text').innerHTML = "Fail to get passenter info";
                console.log(e);
                return;
            }
            let passengerAddressRet = result[0];
            let creditedAmount = result[1] / 1000000000000000000;
            DOM.elid('passenger-text').innerHTML = "Passenger address: " + passengerAddressRet + "<br>";
            DOM.elid('passenger-text').innerHTML += "Credited amount: " + creditedAmount + "<br>";
            console.log(result);
        })

        // Get Passenger 
        DOM.elid('passenger-get-btn').addEventListener('click', async () => {
            let passengerAddress = DOM.elid('passenger-address').value;
            let result = {};
            try{
                result = await contract.getPassengerInfo(passengerAddress);
            }
            catch(e){
                DOM.elid('passenger-text').innerHTML = "Fail to get passenter info";
                console.log(e);
                return;
            }
            let passengerAddressRet = result[0];
            let creditedAmount = result[1] / 1000000000000000000;
            DOM.elid('passenger-text').innerHTML = "Passenger address: " + passengerAddressRet + "<br>";
            DOM.elid('passenger-text').innerHTML += "Credited amount: " + creditedAmount + "<br>";
            console.log(result);
        })

        // Buy insurance 
        DOM.elid('insurance-register-btn').addEventListener('click', async () => {
            let airlineAddress = DOM.elid('airline-address-insurance').value;
            let flightId = DOM.elid('flight-id-insurance').value;
            let passengerAddress = DOM.elid('passenger-address-insurance').value;
            let amount = DOM.elid('amount-insurance').value;
            let result;
            try{
                result = await contract.buyInsurance(airlineAddress, 
                                                     flightId, 
                                                     passengerAddress, 
                                                     amount);
            }
            catch(e){
                DOM.elid('insurance-text').innerHTML = "Fail to buy insurance";
                console.log(e);
                return;
            }
            try{
                result = await contract.getInsurance(airlineAddress, 
                                                     flightId, 
                                                     passengerAddress);
            }
            catch(e){
                DOM.elid('insurance-text').innerHTML = "Fail to get insurance info";
                console.log(e);
                return;
            }
            let airlineAddressRet = result[0];
            let flightIdRet = result[1];
            let passengerAddressRet = result[2];
            let isTriggered = result[3];
            let insuredAmount = result[4];

            DOM.elid('insurance-text').innerHTML = "Airline address: " + airlineAddressRet + "<br>";
            DOM.elid('insurance-text').innerHTML += "FlightId: " + flightIdRet + "<br>";
            DOM.elid('insurance-text').innerHTML += "Passenger Address: " + passengerAddressRet + "<br>";
            DOM.elid('insurance-text').innerHTML += "Triggered: " + isTriggered + "<br>";
            DOM.elid('insurance-text').innerHTML += "Insured Amount: " + insuredAmount / 1000000000000000000 + " ether" + "<br>";
            console.log(result);
        })

        // Buy insurance 
        DOM.elid('insurance-get-btn').addEventListener('click', async () => {
            let airlineAddress = DOM.elid('airline-address-insurance').value;
            let flightId = DOM.elid('flight-id-insurance').value;
            let passengerAddress = DOM.elid('passenger-address-insurance').value;
            let result = {};
            try{
                result = await contract.getInsurance(airlineAddress, 
                                                     flightId, 
                                                     passengerAddress);
            }
            catch(e){
                DOM.elid('insurance-text').innerHTML = "Fail to get insurance info";
                console.log(e);
                return;
            }
            let airlineAddressRet = result[0];
            let flightIdRet = result[1];
            let passengerAddressRet = result[2];
            let isTriggered = result[3];
            let insuredAmount = result[4];

            DOM.elid('insurance-text').innerHTML = "Airline address: " + airlineAddressRet + "<br>";
            DOM.elid('insurance-text').innerHTML += "FlightId: " + flightIdRet + "<br>";
            DOM.elid('insurance-text').innerHTML += "Passenger Address: " + passengerAddressRet + "<br>";
            DOM.elid('insurance-text').innerHTML += "Triggered: " + isTriggered + "<br>";
            DOM.elid('insurance-text').innerHTML += "Insured Amount: " + insuredAmount / 1000000000000000000 + " ether" + "<br>";
        })

        // withdraw money 
        DOM.elid('withdraw-btn').addEventListener('click', async () => {
            let passengerAddress = DOM.elid('passenger-address-insurance').value;
            let amount = DOM.elid('amount-insurance').value;
            try{
                await contract.withdrawMoney(passengerAddress, amount);
            }
            catch(e){
                DOM.elid('insurance-text').innerHTML = "Fail to withdraw money";
                console.log(e);
                return;
            }
            let result = {};
            try{
                result = await contract.getPassengerInfo(passengerAddress);
            }
            catch(e){
                DOM.elid('insurance-text').innerHTML = "Fail to get credit amount of the passenger";
                console.log(e);
                return;
            }
            let passengerAddressRet = result[0];
            let creditedAmount = result[1] / 1000000000000000000;
            DOM.elid('insurance-text').innerHTML = "Passenger address: " + passengerAddressRet + "<br>";
            DOM.elid('insurance-text').innerHTML += "Remaining credited amount: " + creditedAmount + "<br>";
        })

        DOM.elid('operational-status-btn').addEventListener('click', async () => {
            let result;
            try{
                result = await contract.isOperational();
            }
            catch(e){
                DOM.elid('status-text').innerHTML = "Fail to get contract operational status";
                console.log(e);
                return;
            }
            DOM.elid('status-text').innerHTML = "Contract operational status: " + result;
        })
    });
    

})();


//function display(displaySurfix, title, description, results) {
//    let displayDiv = DOM.elid("display-wrapper-" + displaySurfix);
//    console.log("display-wrapper-" + displaySurfix);
//    let section = DOM.section();
//    section.appendChild(DOM.h2(title));
//    section.appendChild(DOM.h5(description));
//    results.map((result) => {
//        let row = section.appendChild(DOM.div({className:'row'}));
//        row.appendChild(DOM.div({className: 'col-sm-4 field'}, result.label));
//        row.appendChild(DOM.div({className: 'col-sm-8 field-value'}, result.error ? String(result.error) : String(result.value)));
//        section.appendChild(row);
//    })
//    displayDiv.append(section);
//
//}







