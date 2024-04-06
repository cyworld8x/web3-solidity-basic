const assert = require('assert');
const { Web3 }  = require('web3');
const ganache = require('ganache');

const web3 = new Web3(ganache.provider());

const { Campaign } = require('../compile');

let campaign;
let accounts;

beforeEach(async () => {
    // Deploy a new instance of the Campaign contract

     // Get a list of accounts from the web3 provider
     accounts = await web3.eth.getAccounts();

     // Deploy the Lottery contract
     campaign = await new web3.eth.Contract(Campaign.abi)
         .deploy({ data: Campaign.evm.bytecode.object, arguments: [web3.utils.toWei('0', 'ether')]})
         .send({ from: accounts[0], gas: '10000000' });
});

describe('Campaign', () => {
    it('deploys a contract', () => {
        assert.ok(campaign.options.address);
    });

    it('allows people to contribute money and marks them as approvers', async () => {
        await campaign.methods.contribute().send({
            value: '200',
            from: accounts[1]
        });

        const isContributor = await campaign.methods.contributors(accounts[1]).call();
        assert(isContributor);
    });

    it('requires a minimum contribution', async () => {
        try {
            await campaign.methods.contribute().send({
                value: '5',
                from: accounts[1]
            });
            assert(false);
        } catch (err) {
            assert(err);
        }
    });

    it('allows a manager to make a payment request', async () => {
        const valueOfRequest = web3.utils.toWei('0.05', 'ether')
        await campaign.methods.createRequest('Buy gun', valueOfRequest, accounts[1]).send({
            from: accounts[0],
            gas: '1000000'
        });

        const value = await campaign.methods.getValueOfRequest(0).call();
        assert.equal(valueOfRequest, BigInt(value));
    });

    it('processes requests', async () => {
        await campaign.methods.contribute().send({
            from: accounts[0],
            value: web3.utils.toWei('10', 'ether')
        });

        await campaign.methods.createRequest('Buy batteries', web3.utils.toWei('0.05', 'ether'), accounts[1]).send({
            from: accounts[0],
            gas: '1000000'
        });

        await campaign.methods.approveRequest(0).send({
            from: accounts[0],
            gas: '1000000'
        });

        await campaign.methods.finalizeRequest(0).send({
            from: accounts[0],
            gas: '1000000'
        });

        let balance = await web3.eth.getBalance(accounts[1]);
        balance = web3.utils.fromWei(balance, 'ether');
        balance = parseFloat(balance);

        assert(balance > 104);
    });
});
