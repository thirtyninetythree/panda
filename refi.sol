// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import '@chainlink/contracts/src/v0.8/ChainlinkClient.sol';
import '@chainlink/contracts/src/v0.8/ConfirmedOwner.sol';

contract ReFi is ChainlinkClient, ConfirmedOwner {
    using Chainlink for Chainlink.Request;

    uint256 public volume;
    uint256 public nvri;
    uint256 public areaInHectares;
    uint256 public carbonCredits;
    bytes32 private jobId;
    uint256 private fee;

    event RequestNVRI(bytes32 indexed requestId, uint256 nvri);

    constructor() ConfirmedOwner(msg.sender) {
        // fantom testnet 
        setChainlinkToken(0xfaFedb041c0DD4fA2Dc0d87a6B0979Ee6FA7af5F);
        setChainlinkOracle(0xCC79157eb46F5624204f47AB42b3906cAA40eaB7);
        jobId = 'ca98366cc7314957b8c012c72f05aeeb';
        fee = (1 * LINK_DIVISIBILITY) / 10; // 0,1 * 10**18 (Varies by network and job)
    }

    /**
     * Create a Chainlink request to retrieve API response, find the target
     * data, then multiply by 1000000000000000000 (to remove decimal places from data).
     */
    function requestNVRI() public returns (bytes32 requestId) {
        Chainlink.Request memory req = buildChainlinkRequest(jobId, address(this), this.fulfill.selector);

        // Set the URL to perform the GET request on
        req.add('get', 'http://api.agromonitoring.com/agro/1.0/ndvi/history?start=1530336000&end=1534976000&polyid=6370ef3e5c2911000750f13c&appid=<YOUR_API_KEY>');

       
        req.add('path', '0,data,mean'); // Chainlink nodes 1.0.0 and later support this format

        // Multiply the result by 1000000000000000000 to remove decimals
        int256 timesAmount = 10**18;
        req.addInt('times', timesAmount);

        // Sends the request
        return sendChainlinkRequest(req, fee);
    }

    function fulfill(bytes32 _requestId, uint256 _nvri) public recordChainlinkFulfillment(_requestId) {
        emit RequestNVRI(_requestId, _nvri);
        nvri = _nvri;
    }

    /**
     * Allow withdraw of Link tokens from the contract
     */
    function withdrawLink() public onlyOwner {
        LinkTokenInterface link = LinkTokenInterface(chainlinkTokenAddress());
        require(link.transfer(msg.sender, link.balanceOf(address(this))), 'Unable to transfer');
    }

    function setAreaInHectares(uint256 _area) public {
        areaInHectares = _area;
    }

    function calculateCarbonCreditFromNVRI() public {
        carbonCredits = ( nvri / 10 ** 18 ) * areaInHectares * 11 * 600;
    }
    function getNVRI() public view returns(uint256) {
        return nvri;
    }
     function getCarbonCreditsAmount() public view returns(uint256) {
        return nvri;
    }
}
