#!/bin/bash
set -e

echo "Updating system packages..."
apt-get update && apt-get upgrade -y

echo "Installing dependencies..."
apt-get install -y docker.io docker-compose ufw fail2ban wireguard unzip jq curl

echo "Setting up firewall rules..."
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 8545/tcp
ufw allow 8546/tcp
ufw allow 8547/tcp
ufw allow 8548/tcp
ufw allow 26657/tcp
ufw allow 8899/tcp
ufw enable

echo "Configuring Fail2Ban..."
cat <<EOF > /etc/fail2ban/jail.local
[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 5
bantime = 3600
EOF
systemctl restart fail2ban

echo "Installing Consul..."
curl -fsSL https://releases.hashicorp.com/consul/1.15.3/consul_1.15.3_linux_amd64.zip -o consul.zip
unzip consul.zip -d /usr/local/bin/
rm consul.zip

echo "Configuring WireGuard..."
cat <<EOF > /etc/wireguard/wg0.conf
[Interface]
Address = 10.100.0.2/24
PrivateKey = <YOUR_PRIVATE_KEY>

[Peer]
PublicKey = <YOUR_PEER_PUBLIC_KEY>
Endpoint = node1:51820
AllowedIPs = 10.100.0.1/32
EOF
systemctl enable wg-quick@wg0
systemctl start wg-quick@wg0

echo "Ubuntu setup complete."