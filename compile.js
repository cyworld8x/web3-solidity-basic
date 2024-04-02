const path = require('path');
const fs = require('fs');
const solc = require('solc');

const contractPath = path.resolve(__dirname, 'contracts/Account.sol');
const contractSource = fs.readFileSync(contractPath, 'utf8');

const input = {
    language: 'Solidity',
    sources: {
        'contracts/Account.sol': {
            content: contractSource,
        },
    },
    settings: {
        outputSelection: {
            '*': {
                '*': ['*'],
            },
        },
    },
};

const output = JSON.parse(solc.compile(JSON.stringify(input)));

if (output.errors) {
    console.error('Compilation errors:');
    output.errors.forEach((error) => console.error(error.formattedMessage));
} else {
    console.log('Compilation successful!');
    // Access the compiled contracts
    const contracts = output.contracts['contracts/Account.sol'];
    for (let contractName in contracts) {
        console.log(`Contract name: ${contractName}`);
        console.log(`Bytecode: ${contracts[contractName].evm.bytecode.object}`);
        console.log(`ABI: ${JSON.stringify(contracts[contractName].abi)}`);
    }
}
