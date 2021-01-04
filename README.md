# FlightSurety

FlightSurety is a sample application project for Udacity's Blockchain course.

## Install

This repository contains Smart Contract code in Solidity (using Truffle), tests (also using Truffle), dApp scaffolding (using HTML, CSS and JS) and server app scaffolding.

To install, download or clone the repo, then:
`npm install`

## Test Steps
### set up the environment
1. Run local blockchain network `ganache-cli --accounts=100 -e 1000 -m "candy maple cake sugar pudding cream honey rich smooth crumble sweet treat"` Copy and paste the accounts address (i.e. address 0 - 39) to a place to facilitate other tests. Address 0-9 are for airlines. Address 10-19 are for passengers.
Address 20-39 are for oracles.
2. Compile smart contract and deploy by running `truffle migrate`
3. Run Oracle server `npm run server`, wait for about 20 seconds, 20 oracles (simulator) will be registered
4. Run Dapp `npm run dapp`, available at http://localhost:8000


###  Testing each project spec
1. Register airlines
    1. In the dapp UI, switch to Airline tab, fill the first box with address 1, and then fill the second box with the address 0 (address 0 is automatically registered as an activated airline when contract is deployed). Click "Register Airline". Then copy and paste address 1 to the second box as well and then click actiave airline, so the airline can pay for its activation.
    2. repeat the above step 3 times, each time use an activated airline as caller to register new airline, but use the new airline itself as caller to activate itself, to register and activate address 2-4 as new airlines.
    3. Repeat the above step for address 5, we will get a error message: "This address is invalid or not a registered airline". That's because starting from the 6 airline, new airline need a consensus of the old airlines to register. Use another 2 activated airline address as caller and click register, the second time it will work because it reaches a majority consensus.
2. Register Flight
    1. Switch to flight tab. Fill in an activated airline's address to the first box and fill in a integer as flight ID in the second box. And then click "Register Flight" button to register a new flight.
3. Register Passenger
    1. Switch to passenger tab. Fill in address 10 (or any address between address 10-19) in the entry box and then click "Register Passenger" to register a passenger.
4. Buy Insurance
    1. Switch to insurance tab. Filling an activated airline address in the first box. Fill in an registered flight Id in the second box. Filling a registered passenger address in the third box. Fill in a insurance amount in the forth box (must <= 1 ether). Click "Buy Insurance" button to buy insurance. In the text area below we will see the insurance is not trigger in the beginning.
    2. Switch to Status tab. Fill in the airline address of the insurance in the first box, and then fill in the flight Id of the insurance in the second box. click "Submit to Oracles" button to send a event to the oracles server(This is not very stable. Sometimes the Oracle server doesn't catch the event. In such case, just click again).  Oracles server will send a simulated responses back by calling submitOracleResponse in the app contract to update the flight status. At this time, if flight is late, the insurance will be triggered. 
    3. Switch back to Insurance tab, click "Get Insurance Info" button. We will see if the insurance is triggered. 
    4. If Insurance is triggered, switch back to Passenger tab. Click Get Passenger Info Tab, we should see Credited amount = 1.5 * insurance amount in the text area below. 
    5. Switch back to Insurance tab, click Withdraw Money to withdraw amount < Credited amount. We can see the remaining credited amount in the text area below.
6. Check if contract is operational
    1. Switch to Status tab, click Get Operational Status to check if contract is operational.


