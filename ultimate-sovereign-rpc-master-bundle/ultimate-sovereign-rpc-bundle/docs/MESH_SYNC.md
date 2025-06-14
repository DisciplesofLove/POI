# Sovereign Mesh Sync Layer

This layer adds auto-healing and self-repair to your sovereign RPC fleet.

## Features
- Peer discovery via Consul
- Prometheus detects out-of-sync nodes
- Ansible triggers repair when needed
- Rsync over SSH for fast peer-to-peer data sync
- Optional WireGuard for encrypted sync

## Setup Process
1. Install Consul agents on all nodes.
2. Deploy Prometheus with `alerts.yml`.
3. Set up WireGuard for secure peer sync.
4. Configure Ansible with all nodes in `inventory.yml`.

## Repair Process
1. Prometheus detects lag.
2. Alert triggers Ansible.
3. Ansible picks healthy peer.
4. Rsync pulls latest blocks directly from peer.

This makes your fleet **self-healing**.

## Example Manual Trigger
```bash
ansible-playbook -i inventory.yml -l node2 ansible/repair-node.yml
```