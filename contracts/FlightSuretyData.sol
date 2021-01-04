pragma solidity ^0.4.24;

import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";

contract FlightSuretyData {
    using SafeMath for uint256;

    /********************************************************************************************/
    /*                                       DATA VARIABLES                                     */
    /********************************************************************************************/

    // Smart Contract Control
    address private contractOwner;                                      // Account used to deploy contract
    bool private operational = true;                                    // Blocks all state changes throughout the contract if false
    mapping (address => bool) authorizedAppContractsMap;

    struct Passenger {
        address passengerAddress;
        uint creditedAmount;
    }

    struct Insurance {
        address airlineAddress;
        uint flightId;
        address passengerAddress;
        bool isTriggered;
        uint insuredAmount;
    }

    struct Flight {
        uint flightId;
        address airlineAddress;
        uint departureStatusCode;
        uint256 timestamp;
        address[] passengerInsuredList;
        mapping (address => Insurance) insuranceMap; //Mapping passengerAddress to insurance
    }

    struct Airline {
        address airlineAddress;
        bool isActivated; //Need deposite ether to activate
        mapping(uint => Flight) flightMap; // Map flightId to flight
    }
    mapping(address => Airline) internal airlineMap;
    mapping(address => Passenger) internal passengerMap;

    uint private airlineCount = 0;

    

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
        airlineMap[contractOwner] = Airline(contractOwner, true);
        airlineCount++;
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

    modifier requirePassengerExist(address passengerAddress)
    {
        require(passengerMap[passengerAddress].passengerAddress != address(0), "passenger doesn't exist");
        _;
    }

    modifier requireInsuranceExist(address airlineAddress,
                                   uint flightId, 
                                   address passengerAddress)
    {
        require(airlineMap[airlineAddress].airlineAddress > 0, "airline does not exist, so flight doesn't exist");
        require(airlineMap[airlineAddress].flightMap[flightId].flightId > 0, "flight does not exist");
        require(airlineMap[airlineAddress].flightMap[flightId].insuranceMap[passengerAddress].passengerAddress != address(0),
            "insurance doesn't exist");
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

    // Caller must be airline and must be activated
    modifier requireActivatedAirline(address airlineAddress)
    {
        require(airlineMap[airlineAddress].airlineAddress > address(0), "airline does not exist");
        require(airlineMap[airlineAddress].isActivated == true, "airline is not activated");
        _;
    }

    /********************************************************************************************/
    /*                                       UTILITY FUNCTIONS                                  */
    /********************************************************************************************/

    function authorizeCaller(address contractAddress)
                             external
                             requireIsOperational()
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
                            external 
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
                            requireContractOwner() 
    {
        operational = mode;
    }

    /********************************************************************************************/
    /*                                     SMART CONTRACT FUNCTIONS                             */
    /********************************************************************************************/

    function getAirlineCount() public returns (uint)
    {
        return airlineCount;
    }

   /**
    * @dev Add an airline to the registration queue
    *      Can only be called from FlightSuretyApp contract
    *
    */   
    function registerAirline(address airlineAddress,
                             address callerAddress)
                             external
                             requireIsOperational()
                             requireActivatedAirline(callerAddress)
    {
        airlineMap[airlineAddress] = Airline(airlineAddress, false);
        airlineCount++;
    }

    function setAirlineActivateStatus(address airlineAddress,
                                      bool nextActivateState)
                                      external
                                      requireIsOperational()
                                      requireAirlineExist(airlineAddress)
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

    function isAirline(address airlineAddress)
                       external
                       view
                       returns(bool)
    {
        if(airlineMap[airlineAddress].airlineAddress == address(0)){
            return false;
        }
        else{
            return true;
        }
    }
                                      
    function getFlightInfo(address airlineAddress,
                       uint flightId)
                       external
                       view
                       requireFlightExist(airlineAddress, flightId)
                       returns (uint, address, uint, uint256)
    {
        Flight memory flight = airlineMap[airlineAddress].flightMap[flightId];
        uint flightIdRet = flight.flightId;
        address airlineAddressRet = flight.airlineAddress;
        uint departureStatusCodeRet = flight.departureStatusCode;
        uint256 timestamp = flight.timestamp;
        return(flightIdRet, airlineAddressRet, departureStatusCodeRet, timestamp);
    }

    function addFlight(address airlineAddress,
                       uint flightId,
                       uint statusCode,
                       uint256 timestamp)
                       external
                       requireIsOperational()
                       requireAirlineExist(airlineAddress)
    {
        require(airlineMap[airlineAddress].flightMap[flightId].flightId == 0, "Flight already exist"); //TODO check if this way works
        airlineMap[airlineAddress].flightMap[flightId] = Flight(flightId, airlineAddress, statusCode, timestamp, new address[](0));
    }

    function setFlightStatusCode(address airlineAddress,
                                 uint flightId,
                                 uint newStatusCode)
                                 external
                                 requireIsOperational()
                                 requireFlightExist(airlineAddress, flightId)
    {
        airlineMap[airlineAddress].flightMap[flightId].departureStatusCode = newStatusCode;
    }

    function updateFlightTimestamp(address airlineAddress,
                                   uint flightId,
                                   uint256 newTimestamp)
                                   external
                                   requireIsOperational()
                                   requireFlightExist(airlineAddress, flightId)
    {
        airlineMap[airlineAddress].flightMap[flightId].timestamp = newTimestamp;
    }

    function addInsurance(address airlineAddress,
                          uint flightId,
                          address passengerAddress,
                          uint insuranceAmount)
                          external
                          requireIsOperational()
                          requireFlightExist(airlineAddress, flightId)
                          requirePassengerExist(passengerAddress)
    {
        require(airlineMap[airlineAddress].flightMap[flightId].insuranceMap[passengerAddress].passengerAddress == address(0), "Insurance Already Exist");
        airlineMap[airlineAddress].flightMap[flightId].insuranceMap[passengerAddress] = 
            Insurance(airlineAddress, flightId, passengerAddress, false, insuranceAmount);
        airlineMap[airlineAddress].flightMap[flightId].passengerInsuredList.push(passengerAddress);
    }

    function getInsurance(address airlineAddress,
                          uint flightId,
                          address passengerAddress)
                          external
                          view
                          requireFlightExist(airlineAddress, flightId)
                          returns(address, uint, address, bool, uint)
    {
        require(airlineMap[airlineAddress].flightMap[flightId].insuranceMap[passengerAddress].passengerAddress != address(0), "Insurance Doesn't Exist");
        Insurance memory insurance = airlineMap[airlineAddress].flightMap[flightId].insuranceMap[passengerAddress];
        return(insurance.airlineAddress, 
               insurance.flightId, 
               insurance.passengerAddress, 
               insurance.isTriggered,
               insurance.insuredAmount);
    }

    function addPassenger(address passengerAddress)
                          requireIsOperational()
                          external
    {
        require(passengerMap[passengerAddress].passengerAddress == address(0), "Passenger already exists");
        passengerMap[passengerAddress] = Passenger(passengerAddress, 0);
    }

    function getPassenger(address passengerAddress)
                         external
                         view
                         requirePassengerExist(passengerAddress)
                         returns(address, uint)
    {
        return(passengerMap[passengerAddress].passengerAddress, 
               passengerMap[passengerAddress].creditedAmount);
    }

    function isPassenger(address passengerAddress)
                         external
                         view
                         returns(bool)
    {
        return passengerMap[passengerAddress].passengerAddress != address(0);
    }



    /**
     *  @dev Credits payouts to insurees
    */
    function creditInsuree(address airlineAddress,
                           uint flightId,
                           address passengerAddress,
                           uint insuranceMultipleNumerator,
                           uint insuranceMultipleDenominator)
                           public //TODO
                           requireIsOperational()
                           requirePassengerExist(passengerAddress)
                           requireInsuranceExist(airlineAddress, flightId, passengerAddress)
    {
        require(airlineMap[airlineAddress].flightMap[flightId].insuranceMap[passengerAddress].isTriggered == false, "insurance is already triggered");
        airlineMap[airlineAddress].flightMap[flightId].insuranceMap[passengerAddress].isTriggered = true;
        uint insuredAmount = airlineMap[airlineAddress].flightMap[flightId].insuranceMap[passengerAddress].insuredAmount;
        passengerMap[passengerAddress].creditedAmount = passengerMap[passengerAddress].creditedAmount.add(insuredAmount.mul(insuranceMultipleNumerator).div(insuranceMultipleDenominator));
    }

    function creditAllInsureesOfFlight(address airlineAddress,
                                       uint flightId,
                                       uint insuranceMultipleNumerator,
                                       uint insuranceMultipleDenominator)
                                       external
                                       requireIsOperational()
                                       requireFlightExist(airlineAddress, flightId)
    {
        for(uint i = 0; i < airlineMap[airlineAddress].flightMap[flightId].passengerInsuredList.length; ++i){
            creditInsuree(airlineAddress,
                          flightId,
                          airlineMap[airlineAddress].flightMap[flightId].passengerInsuredList[i],
                          insuranceMultipleNumerator,
                          insuranceMultipleDenominator);
        }
    }


    /**
     *  @dev Transfers eligible payout funds to insuree
     *
    */
    function withdrawMoney(uint amount,
                 address receiverAddress)
                 requireIsOperational()
                 requirePassengerExist(receiverAddress)
                 external
    {
        require(passengerMap[receiverAddress].creditedAmount >= amount, "Balance not enough");
        passengerMap[receiverAddress].creditedAmount = passengerMap[receiverAddress].creditedAmount.sub(amount);
        receiverAddress.transfer(amount);
    }

   /**
    * @dev Initial funding for the insurance. Unless there are too many delayed flights
    *      resulting in insurance payouts, the contract should be self-sustaining
    *
    */   
    function fund() public payable
    {
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

