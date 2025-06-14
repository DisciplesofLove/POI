#!/bin/sh
set -e

echo "Updating system packages..."
apk update && apk upgrade

echo "Installing dependencies..."
apk add docker docker-compose ufw fail2ban wireguard-tools unzip jq curl

echo "Enabling Docker service..."
rc-update add docker boot
service docker start

echo "Setting up firewall rules (iptables equivalent for Alpine)..."
iptables -A INPUT -p tcp --dport 22 -j ACCEPT
iptables -A INPUT -p tcp --dport 80 -j ACCEPT
iptables -A INPUT -p tcp --dport 443 -j ACCEPT
iptables -A INPUT -p tcp --dport 8545 -j ACCEPT
iptables -A INPUT -p tcp --dport 8546 -j ACCEPT
iptables -A INPUT -p tcp --dport 8547 -j ACCEPT
iptables -A INPUT -p tcp --dport 8548 -j ACCEPT
iptables -A INPUT -p tcp --dport 26657 -j ACCEPT
iptables -A INPUT -p tcp --dport 8899 -j ACCEPT
iptables-save > /etc/iptables/rules.v4

echo "Configuring Fail2Ban..."
mkdir -p /etc/fail2ban
cat <<EOF > /etc/fail2ban/jail.local
[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 5
bantime = 3600
EOF
rc-update add fail2ban boot
service fail2ban start

echo "Installing Consul..."
curl -fsSL https://releases.hashicorp.com/consul/1.15.3/consul_1.15.3_linux_amd64.zip -o consul.zip
unzip consul.zip -d /usr/local/bin/
rm consul.zip

echo "Configuring WireGuard..."
mkdir -p /etc/wireguard
cat <<EOF > /etc/wireguard/wg0.conf
[Interface]
Address = 10.100.0.2/24
PrivateKey = <YOUR_PRIVATE_KEY>

[Peer]
PublicKey = <YOUR_PEER_PUBLIC_KEY>
Endpoint = node1:51820
AllowedIPs = 10.100.0.1/32
EOF
rc-update add wireguard boot
wg-quick up wg0

echo "Alpine setup complete."