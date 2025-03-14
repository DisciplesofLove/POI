import { Web3Storage } from 'web3.storage';

let client = null;

export const initStorage = () => {
  if (!client) {
    client = new Web3Storage({ token: process.env.NEXT_PUBLIC_WEB3_STORAGE_TOKEN });
  }
  return client;
};

export async function uploadFile(file) {
  const client = initStorage();
  const cid = await client.put([file]);
  return `https://${cid}.ipfs.dweb.link/${file.name}`;
}

export async function uploadJSON(data) {
  const client = initStorage();
  const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
  const file = new File([blob], 'data.json');
  const cid = await client.put([file]);
  return `https://${cid}.ipfs.dweb.link/data.json`;
}

export async function retrieveFile(cid) {
  const client = initStorage();
  const res = await client.get(cid);
  const files = await res.files();
  return files[0];
}

export async function retrieveJSON(cid) {
  const file = await retrieveFile(cid);
  const text = await file.text();
  return JSON.parse(text);
}