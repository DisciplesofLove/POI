import { Client } from '@xmtp/xmtp-js';
import { ethers } from 'ethers';

let xmtp = null;

export const initXMTP = async () => {
  if (!xmtp) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    xmtp = await Client.create(signer, { env: 'production' });
  }
  return xmtp;
};

export async function sendMessage(recipientAddress, content) {
  const xmtp = await initXMTP();
  const conversation = await xmtp.conversations.newConversation(recipientAddress);
  const message = await conversation.send(content);
  
  return {
    id: message.id,
    sender_id: message.senderAddress,
    recipient_id: recipientAddress,
    content: content,
    created_at: message.sent,
    is_read: false
  };
}

export async function getConversation(otherUserAddress) {
  const xmtp = await initXMTP();
  const conversation = await xmtp.conversations.newConversation(otherUserAddress);
  const messages = await conversation.messages();
  
  return messages.map(msg => ({
    id: msg.id,
    sender_id: msg.senderAddress,
    recipient_id: otherUserAddress,
    content: msg.content,
    created_at: msg.sent,
    is_read: true // XMTP doesn't track read status
  }));
}

export async function getUserConversations() {
  const xmtp = await initXMTP();
  const allConversations = await xmtp.conversations.list();
  
  return Promise.all(allConversations.map(async (conv) => {
    const messages = await conv.messages();
    const latestMessage = messages[messages.length - 1];
    
    return {
      id: conv.peerAddress,
      sender_id: latestMessage.senderAddress,
      recipient_id: conv.peerAddress,
      content: latestMessage.content,
      created_at: latestMessage.sent,
      is_read: true
    };
  }));
}

export function subscribeToMessages(callback) {
  const subscription = async () => {
    const xmtp = await initXMTP();
    
    // Subscribe to new conversations
    const newConversations = await xmtp.conversations.newConversation();
    for await (const conversation of newConversations) {
      // Subscribe to messages in this conversation
      for await (const message of conversation.streamMessages()) {
        callback({
          id: message.id,
          sender_id: message.senderAddress,
          recipient_id: conversation.peerAddress,
          content: message.content,
          created_at: message.sent,
          is_read: false
        });
      }
    }
  };
  
  subscription();
  
  return () => {
    // Cleanup function - XMTP streams auto-close when unused
  };
}