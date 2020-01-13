
import DOM from './dom';
import Contract from './contract';
import './flightsurety.css';
const truffleAssert = require('truffle-assertions');

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
            let result = await contract.fetchFlightStatus(airlineAddress, flightId);
            console.log(result);
            //contract.fetchFlightStatus(airline, flight, (error, result) => {
            //    display('status', 'Oracles', 'Trigger oracles', [ { label: 'Fetch Flight Status', error: error, value: result.airline + ' ' + result.flight + ' ' + result.timestamp} ]);
            //});
        })

        // Register Airlines
        DOM.elid('airline-register-btn').addEventListener('click', async () => {
            let airlineAddress = DOM.elid('airline-address').value;
            let fromAddress = DOM.elid('airline-register-address').value;
            let result = await contract.registerAirline(airlineAddress, fromAddress);
            console.log(result);
        })

        // Activate Airlines
        DOM.elid('airline-activation-btn').addEventListener('click', async () => {
            let airlineAddress = DOM.elid('airline-address').value;
            let fromAddress = DOM.elid('airline-register-address').value;
            let result = await contract.activateAirline(airlineAddress, fromAddress);
            console.log(result);
        })

        // Activate Airlines
        DOM.elid('airline-get-btn').addEventListener('click', async () => {
            let airlineAddress = DOM.elid('airline-address').value;
            let result = await contract.getAirlineInfo(airlineAddress);
            console.log(result);
        })

        // Add Flight 
        DOM.elid('flight-register-btn').addEventListener('click', async () => {
            let airlineAddress = DOM.elid('airline-address-flight').value;
            let flightId = DOM.elid('flight-id').value;
            // Write transaction
            let result = await contract.registerFlight(airlineAddress, flightId);
            console.log(result);
                //display('airline', 'Oracles', 'Trigger oracles', [ { label: 'Fetch Flight Status', error: error, value: result.airline + ' ' + result.flight + ' ' + result.timestamp} ]);
        })

        // Get Flight 
        DOM.elid('flight-get-btn').addEventListener('click', async () => {
            let airlineAddress = DOM.elid('airline-address-flight').value;
            let flightId = DOM.elid('flight-id').value;
            // Write transaction
            let result = await contract.getFlightInfo(airlineAddress, flightId);
            console.log(result);
                //display('airline', 'Oracles', 'Trigger oracles', [ { label: 'Fetch Flight Status', error: error, value: result.airline + ' ' + result.flight + ' ' + result.timestamp} ]);
        })


        // Add Passenger 
        DOM.elid('passenger-register-btn').addEventListener('click', async () => {
            let passengerAddress = DOM.elid('passenger-address').value;
            let result = await contract.addPassenger(passengerAddress);
            console.log(result);
        })

        // Get Passenger 
        DOM.elid('passenger-get-btn').addEventListener('click', async () => {
            let passengerAddress = DOM.elid('passenger-address').value;
            let result = await contract.getPassengerInfo(passengerAddress);
            console.log(result);
        })

        // Buy insurance 
        DOM.elid('insurance-register-btn').addEventListener('click', async () => {
            let airlineAddress = DOM.elid('airline-address-insurance').value;
            let flightId = DOM.elid('flight-id-insurance').value;
            let passengerAddress = DOM.elid('passenger-address-insurance').value;
            let amount = DOM.elid('amount-insurance').value;

            let result = await contract.buyInsurance(airlineAddress, 
                                                     flightId, 
                                                     passengerAddress, 
                                                     amount);
            console.log(result);
        })

        // Buy insurance 
        DOM.elid('insurance-get-btn').addEventListener('click', async () => {
            let airlineAddress = DOM.elid('airline-address-insurance').value;
            let flightId = DOM.elid('flight-id-insurance').value;
            let passengerAddress = DOM.elid('passenger-address-insurance').value;

            let result = await contract.getInsurance(airlineAddress, 
                                                     flightId, 
                                                     passengerAddress);
            console.log(result);
        })

        // withdraw money 
        DOM.elid('withdraw-btn').addEventListener('click', async () => {
            let passengerAddress = DOM.elid('passenger-address-insurance').value;
            let amount = DOM.elid('amount-insurance').value;
            let result = await contract.withdrawMoney(passengerAddress, amount);
            console.log(result);
        })

        DOM.elid('operational-status-btn').addEventListener('click', async () => {
            let result = await contract.isOperational();
            console.log(result);
        })
    });
    

})();


function display(displaySurfix, title, description, results) {
    let displayDiv = DOM.elid("display-wrapper-" + displaySurfix);
    console.log("display-wrapper-" + displaySurfix);
    let section = DOM.section();
    section.appendChild(DOM.h2(title));
    section.appendChild(DOM.h5(description));
    results.map((result) => {
        let row = section.appendChild(DOM.div({className:'row'}));
        row.appendChild(DOM.div({className: 'col-sm-4 field'}, result.label));
        row.appendChild(DOM.div({className: 'col-sm-8 field-value'}, result.error ? String(result.error) : String(result.value)));
        section.appendChild(row);
    })
    displayDiv.append(section);

}







