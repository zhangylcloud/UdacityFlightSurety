pragma solidity ^0.4.24;

import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";

contract FlightSuretyData {
    using SafeMath for uint256;

    /********************************************************************************************/
    /*                                       DATA VARIABLES                                     */
    /********************************************************************************************/

    uint insurancePrice = 1 ether;

    // Smart Contract Control
    address private contractOwner;                                      // Account used to deploy contract
    bool private operational = true;                                    // Blocks all state changes throughout the contract if false
    mapping (address => bool) authorizedAppContractsMap;

    struct Passenger {
        address passengerAddress;
        uint passengerId;
    }

    struct Insurance {
        uint insuranceId;
        address airlineAddress;
        uint flightId;
        address passengerAddress;
        bool isTriggered;
        bool isPaid;
    }

    struct Flight {
        uint flightId;
        address airlineAddress;
        uint departureStatusCode;
        mapping (uint => Insurance) insuranceMap; //Mapping insurance id to insurance
    }

    struct Airline {
        address airlineAddress;
        bool isActivated; //Need deposite ether to activate
        mapping(uint => Flight) flightMap; // Map flightId to flight
    }
    mapping(address => Airline) internal airlineMap;
    mapping(address => Passenger) internal passengerMap;

    

    /********************************************************************************************/
    /*                                       EVENT DEFINITIONS                                  */
    /********************************************************************************************/


    /**
    * @dev Constructor
    *      The deploying account becomes contractOwner
    */
    constructor
                                (
                                ) 
                                public 
    {
        contractOwner = msg.sender;
    }

    /********************************************************************************************/
    /*                                       FUNCTION MODIFIERS                                 */
    /********************************************************************************************/

    // Modifiers help avoid duplication of code. They are typically used to validate something
    // before a function is allowed to be executed.

    /**
    * @dev Modifier that requires the "operational" boolean variable to be "true"
    *      This is used on all state changing functions to pause the contract in 
    *      the event there is an issue that needs to be fixed
    */
    modifier requireIsOperational() 
    {
        require(operational, "Contract is currently not operational");
        _;  // All modifiers require an "_" which indicates where the function body will be added
    }

    /**
    * @dev Modifier that requires the "ContractOwner" account to be the function caller
    */
    modifier requireContractOwner()
    {
        require(msg.sender == contractOwner, "Caller is not contract owner");
        _;
    }

    modifier requireAirlineExist(address airlineAddress)
    {
        require(airlineMap[airlineAddress].airlineAddress > 0, "airline does not exist");
        _;
    }

    modifier requireFlightExist(address airlineAddress,
                                uint flightId)
    {
        require(airlineMap[airlineAddress].airlineAddress > 0, "airline does not exist, so flight doesn't exist");
        require(airlineMap[airlineAddress].flightMap[flightId].flightId > 0, "flight does not exist");
        _;
    }

    modifier payingEnough(uint amount)
    {
        require(msg.value >= amount, "not paying enough");
        _;
    }

    modifier returnChange(uint requiredAmount)
    {
        _;
        require(msg.value >= requiredAmount, "not paying enough");
        uint amountToReturn = msg.value - requiredAmount;
        msg.sender.transfer(amountToReturn);
    }
    /********************************************************************************************/
    /*                                       UTILITY FUNCTIONS                                  */
    /********************************************************************************************/

    function authorizeCaller(address contractAddress)
                             external
    {
        require(msg.sender == contractOwner, "only contract owner can authorize app contract");
        authorizedAppContractsMap[contractAddress] = true;
    }

    /**
    * @dev Get operating status of contract
    *
    * @return A bool that is the current operating status
    */      
    function isOperational() 
                            public 
                            view 
                            returns(bool) 
    {
        return operational;
    }


    /**
    * @dev Sets contract operations on/off
    *
    * When operational mode is disabled, all write transactions except for this one will fail
    */    
    function setOperatingStatus
                            (
                                bool mode
                            ) 
                            external
                            requireContractOwner 
    {
        operational = mode;
    }

    /********************************************************************************************/
    /*                                     SMART CONTRACT FUNCTIONS                             */
    /********************************************************************************************/

   /**
    * @dev Add an airline to the registration queue
    *      Can only be called from FlightSuretyApp contract
    *
    */   
    function registerAirline(address airlineAddress)
                             external
    {
        airlineMap[airlineAddress] = Airline(airlineAddress, false);
    }

    function setAirlineActivateStatus(address airlineAddress,
                                      bool nextActivateState)
                                      external
    {
        airlineMap[airlineAddress].isActivated = nextActivateState;
    }

    function getAirlineInfo(address airlineAddress)
                            external
                            view
                            requireAirlineExist(airlineAddress)
                            returns(address, bool)
    {
        Airline memory airline = airlineMap[airlineAddress];
        return(airline.airlineAddress,
               airline.isActivated);
    }
                                      
    function getFlightInfo(address airlineAddress,
                       uint flightId)
                       external
                       requireFlightExist(airlineAddress, flightId)
                       returns (uint, address, uint)
    {
        Flight memory flight = airlineMap[airlineAddress].flightMap[flightId];
        uint flightIdRet = flight.flightId;
        address airlineAddressRet = flight.airlineAddress;
        uint departureStatusCodeRet = flight.departureStatusCode;
        return(flightIdRet, airlineAddressRet, departureStatusCodeRet);
    }

    function addFlight(address airlineAddress,
                       uint flightId,
                       uint statusCode)
                       external
                       requireAirlineExist(airlineAddress)
    {
        require(airlineMap[airlineAddress].flightMap[flightId].flightId > 0, "Flight already exist"); //TODO check if this way works
        airlineMap[airlineAddress].flightMap[flightId] = Flight(flightId, airlineAddress, statusCode);
    }

    function addInsurance(uint insuranceId,
                          address airlineAddress,
                          uint flightId,
                          address passengerAddress)
                          external
                          requireFlightExist(airlineAddress, flightId)
                          payingEnough(insurancePrice)
                          returnChange(insurancePrice)
    {
        require(airlineMap[airlineAddress].flightMap[flightId].insuranceMap[insuranceId].insuranceId == 0, "Insurance Already Exist");
        airlineMap[airlineAddress].flightMap[flightId].insuranceMap[insuranceId] = 
            Insurance(insuranceId, airlineAddress, flightId, passengerAddress, false, false);
    }

    function getInsurance(uint insuranceId,
                          address airlineAddress,
                          uint flightId)
                          external
                          requireFlightExist(airlineAddress, flightId)
                          returns(uint, address, uint, address, bool, bool)
    {
        require(airlineMap[airlineAddress].flightMap[flightId].insuranceMap[insuranceId].insuranceId != 0, "Insurance Doesn't Exist");
        Insurance memory insurance = airlineMap[airlineAddress].flightMap[flightId].insuranceMap[insuranceId];
        return(insurance.insuranceId, 
               insurance.airlineAddress, 
               insurance.flightId, 
               insurance.passengerAddress, 
               insurance.isTriggered,
               insurance.isPaid);
    }



   /**
    * @dev Buy insurance for a flight
    *
    */   
    function buy
                            (                             
                            )
                            external
                            payable
    {

    }

    /**
     *  @dev Credits payouts to insurees
    */
    function creditInsurees
                                (
                                )
                                external
                                pure
    {
    }
    

    /**
     *  @dev Transfers eligible payout funds to insuree
     *
    */
    function pay
                            (
                            )
                            external
                            pure
    {
    }

   /**
    * @dev Initial funding for the insurance. Unless there are too many delayed flights
    *      resulting in insurance payouts, the contract should be self-sustaining
    *
    */   
    function fund
                            (   
                            )
                            public
                            payable
    {
    }

    function getFlightKey
                        (
                            address airline,
                            string memory flight,
                            uint256 timestamp
                        )
                        pure
                        internal
                        returns(bytes32) 
    {
        return keccak256(abi.encodePacked(airline, flight, timestamp));
    }

    /**
    * @dev Fallback function for funding smart contract.
    *
    */
    function() 
                            external 
                            payable 
    {
        fund();
    }


}

