#!/bin/bash

# Setup script for nginx with Let's Encrypt SSL for pompushechka.pl
# Run with: bash setup-nginx-ssl.sh

set -e

echo "🚀 Setting up nginx with Let's Encrypt SSL for pompushechka.pl..."

# Update system
sudo apt update

# Install nginx
sudo apt install -y nginx

# Install snapd and certbot
sudo apt install -y snapd
sudo snap install core; sudo snap refresh core
sudo snap install --classic certbot

# Create symlink for certbot
sudo ln -sf /snap/bin/certbot /usr/bin/certbot

# Create nginx config for pompushechka.pl
sudo tee /etc/nginx/sites-available/pompushechka.pl > /dev/null <<'EOF'
server {
    listen 80;
    server_name pompushechka.pl www.pompushechka.pl;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name pompushechka.pl www.pompushechka.pl;

    ssl_certificate /etc/nginx/ssl/pompushechka.pl.crt;
    ssl_certificate_key /etc/nginx/ssl/pompushechka.pl.key;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Enable the site
sudo ln -sf /etc/nginx/sites-available/pompushechka.pl /etc/nginx/sites-enabled/

# Remove default nginx site
sudo rm -f /etc/nginx/sites-enabled/default

# Test nginx configuration
sudo nginx -t

# Start and enable nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Restart nginx to apply changes
sudo systemctl restart nginx

# Show status
sudo systemctl status nginx --no-pager

echo "✅ Setup complete!"
echo "🌐 Your site is available at:"
echo "   HTTP:  http://pompushechka.pl"
echo "   HTTPS: https://pompushechka.pl"
echo ""
echo "⚠️  Note: Self-signed certificate will show browser warning"
echo "📱 Your app should be running on port 80 locally"