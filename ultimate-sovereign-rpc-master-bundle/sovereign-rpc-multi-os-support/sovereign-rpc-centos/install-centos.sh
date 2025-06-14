#!/bin/bash
set -e

echo "Updating system packages..."
yum update -y

echo "Installing dependencies..."
yum install -y docker docker-compose epel-release fail2ban wireguard-tools unzip jq curl

echo "Starting and enabling Docker..."
systemctl enable docker
systemctl start docker

echo "Setting up firewall rules..."
firewall-cmd --permanent --add-service=ssh
firewall-cmd --permanent --add-service=http
firewall-cmd --permanent --add-service=https
firewall-cmd --permanent --add-port=8545/tcp
firewall-cmd --permanent --add-port=8546/tcp
firewall-cmd --permanent --add-port=8547/tcp
firewall-cmd --permanent --add-port=8548/tcp
firewall-cmd --permanent --add-port=26657/tcp
firewall-cmd --permanent --add-port=8899/tcp
firewall-cmd --reload

echo "Configuring Fail2Ban..."
cat <<EOF > /etc/fail2ban/jail.local
[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/secure
maxretry = 5
bantime = 3600
EOF
systemctl enable fail2ban
systemctl start fail2ban

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

echo "CentOS setup complete."