const { Web3 } = require('web3');
const { abi, bytecode } = require('./compile');
const HDWalletProvider = require('@truffle/hdwallet-provider');

const mnemonicPhrase = "slow valve young wild equip harsh ramp morning until bench atom need";
const provider = new HDWalletProvider({
    mnemonic: mnemonicPhrase,
    providerOrUrl: 'http://localhost:8545'
}
);

async function deployContract() {
    // Connect to the Ganache network
    const web3 = new Web3(provider);

    // Get the account that will deploy the contract
    const accounts = await web3.eth.getAccounts();
    const deployer = accounts[0];

    // Create a new contract instance
    const contract = new web3.eth.Contract(abi);

    // Deploy the contract
    const deployedContract = await contract.deploy({
        data: bytecode,
    }).send({
        from: deployer,
        gas: 5000000  // Adjust the gas limit as needed
    });

    console.log('Contract deployed at address:', deployedContract.options.address);
}

deployContract();
