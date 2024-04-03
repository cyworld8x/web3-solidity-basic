const assert = require('assert');
const { Web3 } = require('web3');
const ganache = require('ganache');
const { Lottery } = require('../compile');

// Create a new instance of the web3 provider using Ganache
const provider = ganache.provider();
const web3 = new Web3(provider);

let accounts;
let lottery;

beforeEach(async () => {
    // Get a list of accounts from the web3 provider
    accounts = await web3.eth.getAccounts();

    // Deploy the Lottery contract
    lottery = await new web3.eth.Contract(Lottery.abi)
        .deploy({ data: Lottery.evm.bytecode.object })
        .send({ from: accounts[0], gas: '1000000' });

    // Set the provider for the contract instance
    lottery.setProvider(provider);
});

describe('Lottery', () => {
    it('deploys a lottery contract', () => {
        assert.ok(lottery.options.address);
    });

    it('allows one account to enter', async () => {
        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('0.02', 'ether')
        });

        const players = await lottery.methods.getPlayers().call({
            from: accounts[0]
        });

        assert.strictEqual(accounts[0], players[0]);
        assert.strictEqual(1, players.length);
    });

    it('requires a minimum amount of ether to enter', async () => {
        try {
            await lottery.methods.enter().send({
                from: accounts[0],
                value: web3.utils.toWei('0.001', 'ether')
            });
            assert(false);
        } catch (err) {
            assert(err);
        }
    });

    it('only manager can call pickWinner', async () => {
        try {
            await lottery.methods.pickWinner().send({
                from: accounts[1]
            });
            assert(false);
        } catch (err) {
            assert(err);
        }
    });

    it('sends money to the winner and resets the players array', async () => {
        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('2', 'ether')
        });

        const initialBalance = await web3.eth.getBalance(accounts[0]);

        await lottery.methods.pickWinner().send({ from: accounts[0] });

        const finalBalance = await web3.eth.getBalance(accounts[0]);
        const difference = finalBalance - initialBalance;

        assert(difference > web3.utils.toWei('1.8', 'ether'));
    });
});
