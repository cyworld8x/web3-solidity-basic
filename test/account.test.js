const assert = require('assert');
const Web3 = require('web3');
const ganache = require('ganache-cli');

// Import the compiled contract artifacts
const AccountContract = require('../contracts/Account.sol');

// Create a new instance of the web3 provider
const web3 = new Web3(ganache.provider());

describe('Account Contract', () => {
    let accounts;
    let accountInstance;

    before(async () => {
        // Get a list of accounts from the ganache provider
        accounts = await web3.eth.getAccounts();

        // Deploy the contract
        const accountContract = new web3.eth.Contract(AccountContract.abi);
        accountInstance = await accountContract.deploy().send({ from: accounts[0], gas: '1000000' });
    });

    it('should have an initial balance of 0', async () => {
        const balance = await accountInstance.methods.getBalance().call();
        assert.strictEqual(balance, '0');
    });

    it('should increase balance when deposit is called', async () => {
        const amount = web3.utils.toWei('1', 'ether');
        await accountInstance.methods.deposit().send({ from: accounts[0], value: amount });

        const balance = await accountInstance.methods.getBalance().call();
        assert.strictEqual(balance, amount);
    });

    it('should decrease balance when withdraw is called', async () => {
        const amount = web3.utils.toWei('0.5', 'ether');
        await accountInstance.methods.withdraw(amount).send({ from: accounts[0] });

        const balance = await accountInstance.methods.getBalance().call();
        assert.strictEqual(balance, web3.utils.toWei('0.5', 'ether'));
    });
});
