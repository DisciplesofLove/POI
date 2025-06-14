import pytest
from web3 import Web3
from eth_account import Account
import os
import json

# Test accounts
OWNER = Account.create()
USER1 = Account.create()
USER2 = Account.create()

@pytest.fixture
def web3():
    return Web3(Web3.HTTPProvider('http://localhost:8545'))

@pytest.fixture
def contracts(web3):
    # Load contract ABIs
    with open('contracts/artifacts/ModelMarketplace.json') as f:
        marketplace_abi = json.load(f)['abi']
    with open('contracts/artifacts/ModelLicense.json') as f:
        license_abi = json.load(f)['abi']
    with open('contracts/artifacts/MarketplaceGovernance.json') as f:
        governance_abi = json.load(f)['abi']
    with open('contracts/artifacts/RevenueLogger.json') as f:
        logger_abi = json.load(f)['abi']
    
    # Deploy contracts
    marketplace = web3.eth.contract(
        abi=marketplace_abi,
        bytecode=marketplace_bytecode
    )
    license_contract = web3.eth.contract(
        abi=license_abi,
        bytecode=license_bytecode
    )
    governance = web3.eth.contract(
        abi=governance_abi,
        bytecode=governance_bytecode
    )
    logger = web3.eth.contract(
        abi=logger_abi,
        bytecode=logger_bytecode
    )
    
    return {
        'marketplace': marketplace,
        'license': license_contract,
        'governance': governance,
        'logger': logger
    }

def test_model_licensing(web3, contracts):
    # Test model registration
    model_id = web3.keccak(text='test_model')
    tx_hash = contracts['marketplace'].functions.registerModel(
        model_id,
        'Test Model',
        'Test Description',
        '1.0',
        'ipfs://metadata',
        'ipfs://docs',
        'ipfs://samples',
        ['test', 'ai'],
        Web3.toWei(1, 'ether')
    ).transact({'from': OWNER.address})
    web3.eth.wait_for_transaction_receipt(tx_hash)
    
    # Test license issuance
    tx_hash = contracts['license'].functions.issueLicense(
        USER1.address,
        model_id,
        0,  # TRANSFERABLE
        86400,  # 1 day duration
        100,  # 100 uses
        'ipfs://license_metadata'
    ).transact({'from': OWNER.address})
    receipt = web3.eth.wait_for_transaction_receipt(tx_hash)
    license_id = receipt.logs[0].args.tokenId
    
    # Test model usage with license
    tx_hash = contracts['marketplace'].functions.useModel(
        model_id,
        web3.keccak(text='execution1'),
        license_id
    ).transact({'from': USER1.address})
    web3.eth.wait_for_transaction_receipt(tx_hash)
    
    # Verify license usage was recorded
    usage_count = contracts['license'].functions.licenses(license_id).call()[4]
    assert usage_count == 1
    
    # Test revenue logging
    revenue_record = contracts['logger'].functions.getRevenueRecord(
        web3.keccak(text='execution1')
    ).call()
    assert revenue_record[0] == model_id
    assert revenue_record[1] == OWNER.address
    assert revenue_record[2] == USER1.address

def test_governance(web3, contracts):
    # Test staking
    amount = Web3.toWei(1000, 'ether')
    tx_hash = contracts['governance'].functions.stake(amount).transact(
        {'from': USER1.address}
    )
    web3.eth.wait_for_transaction_receipt(tx_hash)
    
    # Test proposal creation
    proposal_data = contracts['governance'].encodeABI(
        fn_name='updatePlatformFee',
        args=[300]  # Update fee to 3%
    )
    tx_hash = contracts['governance'].functions.propose(
        'Update platform fee to 3%',
        proposal_data
    ).transact({'from': USER1.address})
    receipt = web3.eth.wait_for_transaction_receipt(tx_hash)
    proposal_id = receipt.logs[0].args.proposalId
    
    # Test voting
    tx_hash = contracts['governance'].functions.vote(
        proposal_id,
        True
    ).transact({'from': USER1.address})
    web3.eth.wait_for_transaction_receipt(tx_hash)
    
    # Fast forward time
    web3.provider.make_request('evm_increaseTime', [7 * 24 * 3600])
    web3.provider.make_request('evm_mine', [])
    
    # Execute proposal
    tx_hash = contracts['governance'].functions.executeProposal(
        proposal_id
    ).transact({'from': USER1.address})
    web3.eth.wait_for_transaction_receipt(tx_hash)
    
    # Verify fee was updated
    new_fee = contracts['governance'].functions.platformFee().call()
    assert new_fee == 300

def test_soulbound_license(web3, contracts):
    # Test soulbound license issuance
    model_id = web3.keccak(text='test_model_2')
    tx_hash = contracts['license'].functions.issueLicense(
        USER2.address,
        model_id,
        1,  # SOULBOUND
        0,  # No duration limit
        0,  # No usage limit
        'ipfs://soulbound_license'
    ).transact({'from': OWNER.address})
    receipt = web3.eth.wait_for_transaction_receipt(tx_hash)
    license_id = receipt.logs[0].args.tokenId
    
    # Try to transfer soulbound license (should fail)
    with pytest.raises(Exception):
        tx_hash = contracts['license'].functions.transferFrom(
            USER2.address,
            USER1.address,
            license_id
        ).transact({'from': USER2.address})
        web3.eth.wait_for_transaction_receipt(tx_hash)