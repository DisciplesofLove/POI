const Arweave = require('arweave');

module.exports.storeMetadata = async function(metadata) {
    const arweave = Arweave.init({host: 'arweave.net', protocol: 'https'});
    const tx = await arweave.createTransaction({data: JSON.stringify(metadata)});
    await arweave.transactions.sign(tx);
    return await arweave.transactions.post(tx);
};