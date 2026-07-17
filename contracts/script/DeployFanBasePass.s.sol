// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script} from "forge-std/Script.sol";
import {FanBasePass} from "../src/FanBasePass.sol";

contract DeployFanBasePass is Script {
    function run() external returns (FanBasePass pass) {
        address issuer = vm.envAddress("FANBASE_ISSUER");
        vm.startBroadcast();
        pass = new FanBasePass(issuer);
        vm.stopBroadcast();
    }
}
