// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {FanBasePass} from "../src/FanBasePass.sol";

contract FanBasePassTest is Test {
    FanBasePass pass;
    address issuer = makeAddr("issuer");
    address fan = makeAddr("fan");
    address scalper = makeAddr("scalper");
    bytes32 commitment = keccak256("fanbase-application");

    function setUp() public { pass = new FanBasePass(issuer); }

    function testOnlyIssuerCanIssue() public {
        vm.prank(fan);
        vm.expectRevert();
        pass.issue(fan, commitment);
    }

    function testHolderCannotTransferOrApprove() public {
        vm.prank(issuer);
        uint256 tokenId = pass.issue(fan, commitment);
        vm.startPrank(fan);
        vm.expectRevert(FanBasePass.NonTransferable.selector);
        pass.transferFrom(fan, scalper, tokenId);
        vm.expectRevert(FanBasePass.NonTransferable.selector);
        pass.approve(scalper, tokenId);
        vm.stopPrank();
    }

    function testIssuerCanRevokeAndReissue() public {
        vm.startPrank(issuer);
        uint256 firstPass = pass.issue(fan, commitment);
        pass.revoke(firstPass);
        uint256 replacement = pass.issue(scalper, commitment);
        vm.stopPrank();
        assertEq(pass.ownerOf(replacement), scalper);
        vm.expectRevert();
        pass.ownerOf(firstPass);
    }
}
