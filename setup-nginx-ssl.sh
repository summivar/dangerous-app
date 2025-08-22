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

# Create initial nginx config for pompushechka.pl (HTTP only)
sudo tee /etc/nginx/sites-available/pompushechka.pl > /dev/null <<'EOF'
server {
    listen 80;
    server_name pompushechka.pl;

    location / {
        proxy_pass http://localhost:3000;
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

echo "🔧 Nginx setup complete! Now getting SSL certificate..."

# Get SSL certificate from Let's Encrypt
sudo certbot --nginx -d pompushechka.pl --non-interactive --agree-tos --email admin@pompushechka.pl

# Test automatic renewal
sudo certbot renew --dry-run

echo "✅ Setup complete!"
echo "🌐 Your site is available at:"
echo "   HTTP:  http://pompushechka.pl (redirects to HTTPS)"
echo "   HTTPS: https://pompushechka.pl"
echo ""
echo "🔒 Let's Encrypt SSL certificate installed"
echo "📱 Your app should be running on port 3000 locally"
echo "🔄 SSL certificate will auto-renew"