// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract EvidenceLocker {

    struct Evidence {
        string hashValue;
        string cid;
        uint256 timestamp;
    }

    mapping(uint256 => Evidence) public evidences;
    uint256 public evidenceCount;

    event EvidenceStored(uint256 indexed id, string hashValue, string cid, uint256 timestamp);

    function storeEvidence(string memory _hash, string memory _cid) public {
        evidenceCount++;
        evidences[evidenceCount] = Evidence(
            _hash,
            _cid,
            block.timestamp
        );
        emit EvidenceStored(evidenceCount, _hash, _cid, block.timestamp);
    }

    function getEvidence(uint256 _id)
        public
        view
        returns (string memory, string memory, uint256)
    {
        Evidence memory e = evidences[_id];
        return (e.hashValue, e.cid, e.timestamp);
    }
}
