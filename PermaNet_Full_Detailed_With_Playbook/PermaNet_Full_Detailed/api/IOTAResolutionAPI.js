const { ClientBuilder } = require('@iota/client');

module.exports.resolveDomain = async function(domain) {
    const client = new ClientBuilder().node('https://chrysalis-nodes.iota.org').build();
    const messages = await client.findMessages(['indexation', domain]);
    return messages;
};