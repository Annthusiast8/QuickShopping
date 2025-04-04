# QuickShopping

Laravel Setup Guide

Follow these steps to set up your Laravel project quickly and correctly.

---

Go to Your Project Folder  

cd quickbuy-backend
Move into the Laravel project directory.

---

Check Your PHP Configuration  

php --ini
This shows the location of your php.ini file. Make sure *it's not inside XAMPP* and that these extensions are enabled:

- fileinfo
- pdo_sqlite
- sqlite3

To enable them, open php.ini, find the lines, and remove ; at the beginning.

---

Install Dependencies  

composer install --ignore-platform-reqs
This installs required packages. The --ignore-platform-reqs flag skips compatibility checks if needed.

---

Update Dependencies (If Needed)  

composer update --with-all-dependencies
Use this only if you need to update all packages. Be careful—it might cause issues.

---
Set Up Environment File  

- Create a .env file in the project root.
- Copy and paste the settings from *Sir Mark’s Gmail chat*.

---

Optimize Configuration  

php artisan config:cache
Caches configuration files for better performance. Run this after editing .env.

---

Optimize Routes  

php artisan route:cache
Speeds up route loading. Run this if you change route files.

---

Optimize Views  

php artisan view:cache
Precompiles Blade templates for faster page loading.

---

Generate a Security Key  

php artisan key:generate
Creates an encryption key for security.

---

Run Database Migrations  

php artisan migrate
Creates necessary database tables. Ensure .env is correctly set up first.

---

Start the Development Server  

php artisan serve
Runs the Laravel server so you can test your project locally.