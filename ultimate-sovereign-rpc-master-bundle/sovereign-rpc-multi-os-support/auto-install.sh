#!/bin/bash
set -e

OS_NAME=$(grep '^ID=' /etc/os-release | cut -d= -f2 | tr -d '"')
OS_VERSION=$(grep '^VERSION_ID=' /etc/os-release | cut -d= -f2 | tr -d '"')

echo "Detected OS: $OS_NAME $OS_VERSION"

case "$OS_NAME" in
    ubuntu)
        unzip sovereign-rpc-ubuntu.zip -d /opt/sovereign-rpc-ubuntu
        cd /opt/sovereign-rpc-ubuntu
        sudo ./install-ubuntu.sh
        ;;
    debian)
        unzip sovereign-rpc-debian.zip -d /opt/sovereign-rpc-debian
        cd /opt/sovereign-rpc-debian
        sudo ./install-debian.sh
        ;;
    centos|rhel)
        unzip sovereign-rpc-centos.zip -d /opt/sovereign-rpc-centos
        cd /opt/sovereign-rpc-centos
        sudo ./install-centos.sh
        ;;
    alpine)
        unzip sovereign-rpc-alpine.zip -d /opt/sovereign-rpc-alpine
        cd /opt/sovereign-rpc-alpine
        sudo ./install-alpine.sh
        ;;
    *)
        echo "Unsupported OS detected: $OS_NAME"
        exit 1
        ;;
esac

echo "✅ Sovereign RPC Fleet successfully installed on $OS_NAME $OS_VERSION"