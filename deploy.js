const Web3 = require('web3');
const contractAbi = require('./path/to/contractAbi.json');
const contractBytecode = require('./path/to/contractBytecode.json');

async function deployContract() {
    // Connect to the Ganache network
    const web3 = new Web3('http://localhost:7545');

    // Get the account that will deploy the contract
    const accounts = await web3.eth.getAccounts();
    const deployer = accounts[0];

    // Create a new contract instance
    const contract = new web3.eth.Contract(contractAbi);

    // Deploy the contract
    const deployedContract = await contract.deploy({
        data: contractBytecode,
        arguments: [arg1, arg2] // Pass any constructor arguments here
    }).send({
        from: deployer,
        gas: 2000000 // Adjust the gas limit as needed
    });

    console.log('Contract deployed at address:', deployedContract.options.address);
}

deployContract();
