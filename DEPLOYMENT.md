
# Deployment Guide for Ubuntu VPS

This guide provides step-by-step instructions to deploy the "Our Secret Garden" application (both frontend and backend) on an Ubuntu server.

We will use:
-   **Nginx:** As a web server and a reverse proxy. It will serve our React frontend and forward API requests to our Node.js backend.
-   **PM2:** A process manager for Node.js to keep our backend server running continuously.

### Prerequisites

1.  An Ubuntu VPS (Virtual Private Server).
2.  A domain name pointing to your VPS IP address (optional, but recommended for SSL).
3.  `ssh` access to your server.
4.  `git`, `node`, and `npm` installed on the server.

```bash
# Update package list
sudo apt update

# Install git, nodejs, npm
sudo apt install git
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

### Step 1: Deploy the Backend

1.  **Clone the Repository**
    Clone your project from your Git repository onto the server.
    ```bash
    git clone <your-repository-url>
    cd <your-project-directory>/backend
    ```

2.  **Install Dependencies**
    ```bash
    npm install --production
    ```

3.  **Set Up Environment Variables**
    Create the `.env` file and configure it for production.
    ```bash
    cp .env.example .env
    nano .env
    ```
    -   Change `JWT_SECRET` to a **strong, unique, random string**.
    -   You can keep `PORT=4000` or change it if needed.

4.  **Install PM2**
    PM2 is a process manager that will keep your Node.js app running.
    ```bash
    sudo npm install pm2 -g
    ```

5.  **Start the Backend with PM2**
    ```bash
    pm2 start server.js --name "our-garden-api"
    ```
    Your backend is now running on `http://localhost:4000`.

6.  **Enable PM2 on Startup**
    This ensures your app restarts automatically if the server reboots.
    ```bash
    pm2 startup
    # Follow the instructions given by the command
    pm2 save
    ```

### Step 2: Deploy the Frontend

Our frontend is a simple static application (HTML, CSS, JS). We just need to place the files where Nginx can serve them.

1.  **Update the API URL**
    Before deploying, you **must** update the `API_BASE_URL` in your frontend code.
    -   Open the `constants.ts` file on your local machine.
    -   Change `API_BASE_URL` to your production URL. **Important:** Do not include a port. Nginx will handle routing.
        ```typescript
        // From:
        // export const API_BASE_URL = 'http://localhost:4000';
        
        // To (use your domain or IP):
        export const API_BASE_URL = 'https://your-domain.com'; 
        // Or if not using a domain:
        // export const API_BASE_URL = 'http://your-vps-ip';
        ```
    -   Commit and push this change to your repository.

2.  **Place Frontend Files on the Server**
    -   On your server, pull the latest changes.
    -   Create a directory where Nginx will look for your site files.
    ```bash
    sudo mkdir -p /var/www/our-secret-garden
    # Copy all frontend files (index.html, App.tsx, etc.) into this new directory
    sudo cp -r <your-project-directory>/* /var/www/our-secret-garden/
    ```
    *Note: This simple setup copies all files. In a typical Vite/React project, you would run `npm run build` and copy only the contents of the `dist` folder.*

### Step 3: Configure Nginx

Nginx will serve your frontend and act as a reverse proxy for the backend.

1.  **Install Nginx**
    ```bash
    sudo apt install nginx
    ```

2.  **Create an Nginx Configuration File**
    ```bash
    sudo nano /etc/nginx/sites-available/our-secret-garden
    ```
    Paste the following configuration. **Replace `your-domain.com`** with your domain or VPS IP address.

    ```nginx
    server {
        listen 80;
        server_name your-domain.com www.your-domain.com; # Or your server's IP address

        root /var/www/our-secret-garden;
        index index.html;

        location / {
            try_files $uri $uri/ /index.html;
        }

        # Reverse proxy for API requests
        location /api/ {
            proxy_pass http://localhost:4000; # The port your backend is running on
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }
    }
    ```

3.  **Enable the Configuration**
    Create a symbolic link to enable the site.
    ```bash
    sudo ln -s /etc/nginx/sites-available/our-secret-garden /etc/nginx/sites-enabled/
    ```

4.  **Test and Restart Nginx**
    ```bash
    sudo nginx -t
    # If the test is successful:
    sudo systemctl restart nginx
    ```

### Step 4: Secure Your Site with SSL (Recommended)

If you have a domain name, you can easily add a free SSL certificate using Certbot.

1.  **Install Certbot**
    ```bash
    sudo apt install certbot python3-certbot-nginx
    ```

2.  **Obtain and Install Certificate**
    ```bash
    sudo certbot --nginx -d your-domain.com -d www.your-domain.com
    ```
    Certbot will automatically update your Nginx configuration and set up auto-renewal.

---

**Your application is now live!** You can access it via your domain or IP address.
