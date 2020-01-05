
import DOM from './dom';
import Contract from './contract';
import './flightsurety.css';


(async() => {

    let result = null;

    let contract = new Contract('localhost', () => {

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
        contract.isOperational((error, result) => {
            console.log(error,result);
            display('status', 'Operational Status', 'Check if contract is operational', [ { label: 'Operational Status', error: error, value: result} ]);
        });

        // User-submitted transaction
        DOM.elid('submit-oracle').addEventListener('click', () => {
            let airline = DOM.elid('airline-address-status').value;
            let flight = DOM.elid('flight-number').value;
            // Write transaction
            contract.fetchFlightStatus(airline, flight, (error, result) => {
                display('status', 'Oracles', 'Trigger oracles', [ { label: 'Fetch Flight Status', error: error, value: result.airline + ' ' + result.flight + ' ' + result.timestamp} ]);
            });
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







