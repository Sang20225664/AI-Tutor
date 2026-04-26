#!/bin/bash

# Script to update K3s with current IP address

# Detect active network interface and current IP from default route
DEFAULT_IFACE=$(ip route get 1.1.1.1 2>/dev/null | awk '{for (i=1;i<=NF;i++) if ($i=="dev") {print $(i+1); exit}}')
CURRENT_IP=$(ip -4 route get 1.1.1.1 2>/dev/null | awk '{for (i=1;i<=NF;i++) if ($i=="src") {print $(i+1); exit}}')

# Fallback: first host IP if route-based detection is unavailable
if [ -z "$CURRENT_IP" ]; then
    CURRENT_IP=$(hostname -I 2>/dev/null | awk '{print $1}')
fi

if [ -z "$CURRENT_IP" ]; then
    echo "❌ Cannot detect host IPv4 address"
    exit 1
fi

echo "🔍 Current IP detected: $CURRENT_IP"
if [ -n "$DEFAULT_IFACE" ]; then
    echo "🌐 Active interface: $DEFAULT_IFACE"
fi
echo ""

# Check current K3s service config
CURRENT_K3S_IP=$(sudo cat /etc/systemd/system/k3s.service | grep -oP '(?<=--node-ip=)\d+(\.\d+){3}')

echo "📋 Current K3s configured IP: $CURRENT_K3S_IP"

if [ "$CURRENT_IP" == "$CURRENT_K3S_IP" ]; then
    echo "✅ IP addresses match! Just restarting K3s..."
    sudo systemctl restart k3s
    sleep 5
    sudo systemctl status k3s --no-pager | head -10
    exit 0
fi

echo ""
echo "⚠️  IP mismatch! Updating K3s configuration..."
echo ""

# Backup current config
sudo cp /etc/systemd/system/k3s.service /etc/systemd/system/k3s.service.backup

# Update service file with new IP
sudo sed -i "s/--node-ip=[0-9.]*\s/--node-ip=$CURRENT_IP /g" /etc/systemd/system/k3s.service
sudo sed -i "s/--bind-address=[0-9.]*\s/--bind-address=$CURRENT_IP /g" /etc/systemd/system/k3s.service
sudo sed -i "s/--advertise-address=[0-9.]*/--advertise-address=$CURRENT_IP/g" /etc/systemd/system/k3s.service

echo "✏️  Updated K3s service file:"
sudo cat /etc/systemd/system/k3s.service | grep ExecStart
echo ""

# Reload systemd and restart K3s
echo "🔄 Reloading systemd daemon..."
sudo systemctl daemon-reload

echo "🚀 Starting K3s with new IP..."
sudo systemctl restart k3s

echo "⏳ Waiting for K3s to start (10 seconds)..."
sleep 10

# Check status
echo ""
echo "📊 K3s Status:"
sudo systemctl status k3s --no-pager | head -15

echo ""
echo "🔍 Testing kubectl connection..."
sleep 3
kubectl get nodes

echo ""
echo "✅ Done!"
echo ""
echo "📝 Updating /etc/hosts with new IP..."
sudo sed -i '/ai-tutor/d' /etc/hosts
echo "$CURRENT_IP ai-tutor.local ai-tutor-dev.local ai-tutor-staging.local" | sudo tee -a /etc/hosts

echo ""
echo "✅ /etc/hosts updated!"
cat /etc/hosts | grep ai-tutor
