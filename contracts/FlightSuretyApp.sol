pragma solidity ^0.4.24;

// It's important to avoid vulnerabilities due to numeric overflow bugs
// OpenZeppelin's SafeMath library, when used correctly, protects agains such bugs
// More info: https://www.nccgroup.trust/us/about-us/newsroom-and-events/blog/2018/november/smart-contract-insecurity-bad-arithmetic/

import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";

/************************************************** */
/* FlightSurety Smart Contract                      */
/************************************************** */
contract FlightSuretyApp {
    using SafeMath for uint256; // Allow SafeMath functions to be called for all uint256 types (similar to "prototype" in Javascript)

    /********************************************************************************************/
    /*                                       DATA VARIABLES                                     */
    /********************************************************************************************/
    FlightSuretyData dataContract;

    uint private constant AIRLINE_ACTIVATION_FEE= 10 ether;

    // Flight status codees
    uint8 private constant STATUS_CODE_UNKNOWN = 0;
    uint8 private constant STATUS_CODE_ON_TIME = 10;
    uint8 private constant STATUS_CODE_LATE_AIRLINE = 20;
    uint8 private constant STATUS_CODE_LATE_WEATHER = 30;
    uint8 private constant STATUS_CODE_LATE_TECHNICAL = 40;
    uint8 private constant STATUS_CODE_LATE_OTHER = 50;

    uint private constant AIRLINE_COUNT_THRESHOLD = 5;

    uint private constant MAX_INSURANCE_FEE = 1 ether;

    uint private constant INSURANCE_MULTIPLE_NUMERATOR = 3;
    uint private constant INSURANCE_MULTIPLE_DENOMINATOR = 2;

    address private contractOwner;          // Account used to deploy contract

    //struct Flight {
    //    bool isRegistered;
    //    uint8 statusCode;
    //    uint256 updatedTimestamp;        
    //    address airline;
    //}
    //mapping(bytes32 => Flight) private flights;

    mapping(address => mapping(address => bool)) voteMap; //  mapping(newAirlineAddress => mapping(voterAddress => isVoteYes))
    mapping(address => uint) voteCountMap; // mapping(newAirlineAddress => voteCount)

    event testing(uint num);
 
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
         // Modify to call data contract's status
        require(true, "Contract is currently not operational");  
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

    modifier requireCallerIsAirline()
    {
        require(dataContract.isAirline(msg.sender), "Caller is not airline");
        _;
    }

    modifier requireCallerActivatedAirline()
    {
        require(dataContract.isAirline(msg.sender), "Caller is not airline");
        (address airlineAddress, bool isActivated) = dataContract.getAirlineInfo(msg.sender);
        require(isActivated, "Caller airline is not activated");
        _;
    }


    /********************************************************************************************/
    /*                                       CONSTRUCTOR                                        */
    /********************************************************************************************/

    /**
    * @dev Contract constructor
    *
    */
    constructor(address dataContractAddress)
                public 
    {
        contractOwner = msg.sender;
        dataContract = FlightSuretyData(dataContractAddress);
    }

    /********************************************************************************************/
    /*                                       UTILITY FUNCTIONS                                  */
    /********************************************************************************************/

    function isOperational() 
                            public 
                            pure 
                            returns(bool) 
    {
        return true;  // Modify to call data contract's status
    }

    /********************************************************************************************/
    /*                                     SMART CONTRACT FUNCTIONS                             */
    /********************************************************************************************/

  
   /**
    * @dev Add an airline to the registration queue
    *
    */   
    function registerAirline(address airlineAddress)
                             external
                             requireIsOperational()
                             requireCallerActivatedAirline()
                             returns(bool success, uint256 votes)
    {
        emit testing(1);
        require(!dataContract.isAirline(airlineAddress), "Airline already exist");
        require(voteMap[airlineAddress][msg.sender] == false, "You have already voted");
        emit testing(2);
        voteMap[airlineAddress][msg.sender] == true;
        voteCountMap[airlineAddress] = voteCountMap[airlineAddress] + 1;
        emit testing(3);
        voteMap[airlineAddress][msg.sender] == true;
        uint airlineCount = dataContract.getAirlineCount();
        emit testing(4);
        voteMap[airlineAddress][msg.sender] == true;
        if(airlineCount < AIRLINE_COUNT_THRESHOLD){
            emit testing(5);
            dataContract.registerAirline(airlineAddress, msg.sender);
            emit testing(6);
        }
        else{
            emit testing(7);
            if(voteCountMap[airlineAddress].mul(2) >= airlineCount){
                emit testing(8);
                dataContract.registerAirline(airlineAddress, msg.sender);
                emit testing(9);
            }
        }
        emit testing(10);
        return (success, 0);
    }

    function activateAirline(address airlineAddress)
                             external
                             payable
                             requireIsOperational()
    {
        require(dataContract.isAirline(airlineAddress), "Airline doesn't exist");
        require(msg.value >= AIRLINE_ACTIVATION_FEE, "Airline doesn't pay enough to activate");
        address(dataContract).transfer(AIRLINE_ACTIVATION_FEE);
        dataContract.setAirlineActivateStatus(airlineAddress, true);
        msg.sender.transfer(msg.value - AIRLINE_ACTIVATION_FEE);
    }


   /**
    * @dev Register a future flight for insuring.
    *
    */  
    function registerFlight(uint flightId,
                            uint statusCode,
                            uint256 timestamp)
                            external
                            requireIsOperational()
                            requireCallerActivatedAirline()
    {
        dataContract.addFlight(msg.sender,
                               flightId,
                               statusCode,
                               timestamp);
    }


    function buyInsurance(address airlineAddress,
                          uint flightId,
                          address passengerAddress)
                          external
                          payable
                          requireIsOperational()
    {
        require(msg.value < MAX_INSURANCE_FEE, "Can't buy insurnace larger than insurance cap");
        address(dataContract).transfer(msg.value);
        dataContract.addInsurance(airlineAddress, flightId, passengerAddress, msg.value);
    }
                          

    
   /**
    * @dev Called after oracle has updated flight status
    *
    */  
    function processFlightStatus(address airlineAddress, 
                                 uint flightId, 
                                 uint256 timestamp, 
                                 uint8 statusCode)                                
                                 requireIsOperational()
                                 internal
    {
        dataContract.setFlightStatusCode(airlineAddress, flightId, statusCode);
        dataContract.updateFlightTimestamp(airlineAddress, flightId, timestamp);
        if(statusCode == STATUS_CODE_LATE_AIRLINE){
            dataContract.creditAllInsurees(airlineAddress, flightId, INSURANCE_MULTIPLE_NUMERATOR, INSURANCE_MULTIPLE_DENOMINATOR);
        }
    }


    // Generate a request for oracles to fetch flight information
    function fetchFlightStatus(address airlineAddress,
                               uint flightId)
                               external
    {
        uint8 index = getRandomIndex(msg.sender);

        // Generate a unique key for storing the request
        bytes32 key = keccak256(abi.encodePacked(index, airlineAddress, flightId));
        oracleResponses[key] = ResponseInfo({
                                                requester: msg.sender,
                                                isOpen: true
                                            });
        emit OracleRequest(index, airlineAddress, flightId);
    } 

    function addPassenger(address passengerAddress)
                          external
    {
        require(!dataContract.isPassenger(passengerAddress), "Passenger already exist");
        dataContract.addPassenger(passengerAddress);
    }


// region ORACLE MANAGEMENT
    // Incremented to add pseudo-randomness at various points
    uint8 private nonce = 0;    

    // Fee to be paid when registering oracle
    uint256 public constant REGISTRATION_FEE = 1 ether;

    // Number of oracles that must respond for valid status
    uint256 private constant MIN_RESPONSES = 3;


    struct Oracle {
        bool isRegistered;
        uint8[3] indexes;        
    }

    // Track all registered oracles
    mapping(address => Oracle) private oracles;

    // Model for responses from oracles
    struct ResponseInfo {
        address requester;                              // Account that requested status
        bool isOpen;                                    // If open, oracle responses are accepted
        mapping(uint8 => address[]) responses;          // Mapping key is the status code reported
                                                        // This lets us group responses and identify
                                                        // the response that majority of the oracles
    }

    // Track all oracle responses
    // Key = hash(index, airline, flight)
    mapping(bytes32 => ResponseInfo) private oracleResponses;

    // Event fired each time an oracle submits a response
    event FlightStatusInfo(address airline, uint flightId, uint8 status);

    event OracleReport(address airline, uint flightId, uint256 timestamp, uint8 status);

    // Event fired when flight status request is submitted
    // Oracles track this and if they have a matching index
    // they fetch data and submit a response
    event OracleRequest(uint8 index, address airlineAddress, uint flightId);




    // Register an oracle with the contract
    function registerOracle
                            (
                            )
                            external
                            payable
    {
        // Require registration fee
        require(msg.value >= REGISTRATION_FEE, "Registration fee is required");

        uint8[3] memory indexes = generateIndexes(msg.sender);

        oracles[msg.sender] = Oracle({
                                        isRegistered: true,
                                        indexes: indexes
                                    });
    }

    function getMyIndexes
                            (
                            )
                            view
                            external
                            returns(uint8[3])
    {
        require(oracles[msg.sender].isRegistered, "Not registered as an oracle");

        return oracles[msg.sender].indexes;
    }




    // Called by oracle when a response is available to an outstanding request
    // For the response to be accepted, there must be a pending request that is open
    // and matches one of the three Indexes randomly assigned to the oracle at the
    // time of registration (i.e. uninvited oracles are not welcome)
    function submitOracleResponse
                        (
                            uint8 index,
                            address airlineAddress,
                            uint flightId,
                            uint256 timestamp,
                            uint8 statusCode
                        )
                        external
    {
        require((oracles[msg.sender].indexes[0] == index) || (oracles[msg.sender].indexes[1] == index) || (oracles[msg.sender].indexes[2] == index), "Index does not match oracle request");
        bytes32 key = keccak256(abi.encodePacked(index, airlineAddress, flightId)); 
        require(oracleResponses[key].isOpen, "Flight do not match oracle request");

        oracleResponses[key].responses[statusCode].push(msg.sender);

        // Information isn't considered verified until at least MIN_RESPONSES
        // oracles respond with the *** same *** information
        emit OracleReport(airlineAddress, flightId, timestamp, statusCode);
        if (oracleResponses[key].responses[statusCode].length >= MIN_RESPONSES) {

            emit FlightStatusInfo(airlineAddress, flightId, statusCode);

            // Handle flight status as appropriate
            processFlightStatus(airlineAddress, flightId, timestamp, statusCode);
        }
    }


    //function getFlightKey
    //                    (
    //                        address airline,
    //                        string flight,
    //                        uint256 timestamp
    //                    )
    //                    pure
    //                    internal
    //                    returns(bytes32) 
    //{
    //    return keccak256(abi.encodePacked(airline, flight, timestamp));
    //}

    // Returns array of three non-duplicating integers from 0-9
    function generateIndexes
                            (                       
                                address account         
                            )
                            internal
                            returns(uint8[3])
    {
        uint8[3] memory indexes;
        indexes[0] = getRandomIndex(account);
        
        indexes[1] = indexes[0];
        while(indexes[1] == indexes[0]) {
            indexes[1] = getRandomIndex(account);
        }

        indexes[2] = indexes[1];
        while((indexes[2] == indexes[0]) || (indexes[2] == indexes[1])) {
            indexes[2] = getRandomIndex(account);
        }

        return indexes;
    }

    // Returns array of three non-duplicating integers from 0-9
    function getRandomIndex
                            (
                                address account
                            )
                            internal
                            returns (uint8)
    {
        uint8 maxValue = 10;

        // Pseudo random number...the incrementing nonce adds variation
        uint8 random = uint8(uint256(keccak256(abi.encodePacked(blockhash(block.number - nonce++), account))) % maxValue);

        if (nonce > 250) {
            nonce = 0;  // Can only fetch blockhashes for last 256 blocks so we adapt
        }

        return random;
    }


    //function callDummy() external
    //{
    //    emit testing(10);
    //    dataContract.dummy();
    //}

// endregion

}   

contract FlightSuretyData {
    function authorizeCaller(address) external;
    function isOperational() external view returns(bool);
    function getAirlineCount() public returns (uint);
    function registerAirline(address, address) external;
    function setAirlineActivateStatus(address, bool) external;
    function getAirlineInfo(address) external view returns(address, bool);
    function isAirline(address) external view returns(bool);
    function getFlightInfo(address, uint) external view returns(uint, address, uint);
    function addFlight(address, uint, uint, uint256) external;
    function setFlightStatusCode(address, uint, uint) external;
    function updateFlightTimestamp(address, uint, uint256) external;
    function addInsurance(address, uint, address, uint) external;
    function addPassenger(address) external;
    function getPassenger(address) external view returns(address, uint);
    function isPassenger(address) external view returns(bool);
    //function creditInsurees(address, uint, address, uint) external;
    function creditAllInsurees(address, uint, uint, uint) external;
    function withdrawMoney(uint, address) external;
    function fund() public payable;
    //function dummy() external;
}