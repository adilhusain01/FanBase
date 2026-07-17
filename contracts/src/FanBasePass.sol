// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC721} from "openzeppelin-contracts/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "openzeppelin-contracts/contracts/access/Ownable.sol";

/// @notice An organizer-issued allocation credential, never a tradeable ticket NFT.
contract FanBasePass is ERC721, Ownable {
    error NonTransferable();
    error UnknownPass();

    uint256 private _nextTokenId = 1;
    mapping(uint256 => bytes32) public applicationCommitment;

    event PassIssued(uint256 indexed tokenId, address indexed holder, bytes32 indexed applicationCommitment);
    event PassRevoked(uint256 indexed tokenId, bytes32 indexed applicationCommitment);

    constructor(address issuer) ERC721("FanBase Allocation Pass", "FBPASS") Ownable(issuer) {}

    function issue(address holder, bytes32 commitment) external onlyOwner returns (uint256 tokenId) {
        tokenId = _nextTokenId++;
        applicationCommitment[tokenId] = commitment;
        _safeMint(holder, tokenId);
        emit PassIssued(tokenId, holder, commitment);
    }

    function revoke(uint256 tokenId) external onlyOwner {
        if (_ownerOf(tokenId) == address(0)) revert UnknownPass();
        bytes32 commitment = applicationCommitment[tokenId];
        _burn(tokenId);
        emit PassRevoked(tokenId, commitment);
    }

    function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
        address from = _ownerOf(tokenId);
        if (from != address(0) && to != address(0)) revert NonTransferable();
        return super._update(to, tokenId, auth);
    }

    function approve(address, uint256) public pure override { revert NonTransferable(); }

    function setApprovalForAll(address, bool) public pure override { revert NonTransferable(); }
}
