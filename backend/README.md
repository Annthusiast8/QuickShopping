
# QuickShopping Backend API Documentation

This document provides comprehensive documentation for the QuickShopping e-commerce platform's RESTful API.

## Table of Contents

1. [Authentication](#authentication)
2. [Users & Profiles](#users--profiles)
3. [Products](#products)
4. [Shopping Cart](#shopping-cart)
5. [Orders](#orders)
6. [Reviews](#reviews)
7. [Reporting System](#reporting-system)
8. [Seller Management](#seller-management)
9. [Admin Functions](#admin-functions)

## Base URL

All API endpoints are prefixed with:
```
http://localhost/QuickShopping/backend/public/api
```

## Authentication

### Register

**Customer Registration**
```
POST /register/customer
```
Body:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "password_confirmation": "password123"
}
```

**Seller Registration**
```
POST /register/seller
```
Body: Same as customer registration

**Admin Registration**
```
POST /register/admin
```
Body: Same as customer registration

### Login

**Standard Login**
```
POST /login
```
Body:
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```
Response:
```json
{
  "message": "Logged in successfully",
  "token": "YOUR_API_TOKEN",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "customer"
  }
}
```

**Role-Specific Login (Legacy)**
```
POST /login/{role}
```
Where `{role}` is one of: `admin`, `seller`, `customer`

### Logout

```
POST /logout
```
Headers:
```
Authorization: Bearer YOUR_API_TOKEN
```

### Delete Account

```
POST /account/delete
```
Body:
```json
{
  "password": "password123"
}
```

## Users & Profiles

### Get Profile

```
GET /profile
```

### Update Profile

```
PUT /profile
```
Body:
```json
{
  "name": "Updated Name",
  "email": "updated@example.com",
  "phone": "1234567890",
  "address": "123 Main St",
  "avatar": [binary file]
}
```

### Customer Address Management

**Get All Addresses**
```
GET /customer/addresses
```

**Add Address**
```
POST /customer/addresses
```
Body:
```json
{
  "address_line1": "123 Main St",
  "address_line2": "Apt 4B",
  "city": "New York",
  "state": "NY",
  "postal_code": "10001",
  "country": "USA",
  "is_default": true
}
```

**Update Address**
```
PUT /customer/addresses/{id}
```

**Delete Address**
```
DELETE /customer/addresses/{id}
```

## Products

### Browse Products

```
GET /items
```

Query Parameters:
- `category`: Filter by category
- `min_price`: Minimum price
- `max_price`: Maximum price
- `search`: Search term for name/description
- `sort_by`: Sorting option (price_asc, price_desc, name_asc, name_desc, date_asc, date_desc, rating)
- `filter`: Quick filter (new, top_rated)
- `per_page`: Number of items per page (default: 12)

### Get Product Details

```
GET /items/{id}
```

### Report a Product

```
POST /items/{itemId}/report
```
Body:
```json
{
  "reason": "Counterfeit product",
  "description": "This product appears to be fake"
}
```

## Shopping Cart

### Get Cart

```
GET /cart
```

### Add to Cart

```
POST /cart/add
```
Body:
```json
{
  "item_id": 1,
  "quantity": 2,
  "variation": {
    "color": "Black",
    "size": "M"
  }
}
```

### Update Cart Item

```
PUT /cart/update/{itemId}
```
Body:
```json
{
  "quantity": 3,
  "variation": {
    "color": "Black",
    "size": "M"
  },
  "selected": true
}
```

### Remove from Cart

```
DELETE /cart/remove/{itemId}
```
Body:
```json
{
  "variation": {
    "color": "Black",
    "size": "M"
  }
}
```

### Checkout

```
POST /cart/checkout
```
Body:
```json
{
  "shipping_address": "123 Main St, New York, NY 10001",
  "payment_method": "credit_card"
}
```

## Orders

### Get All Orders (Customer)

```
GET /orders
```

### Get Order Details (Customer)

```
GET /orders/{id}
```

### Place Order Directly

```
POST /items/{itemId}/orders
```
Body:
```json
{
  "quantity": 1,
  "shipping_address": "123 Main St, New York, NY 10001"
}
```

## Reviews

### Add Review

```
POST /items/{itemId}/reviews
```
Body:
```json
{
  "rating": 4,
  "comment": "Great product!"
}
```

### Update Review

```
PUT /reviews/{id}
```
Body:
```json
{
  "rating": 5,
  "comment": "Even better than I thought!"
}
```

### Delete Review

```
DELETE /reviews/{id}
```

## Seller Management

### Get Business Profile

```
GET /seller/profile
```

### Update Business Profile

```
POST /seller/profile
```
Body:
```json
{
  "name": "My Shop",
  "description": "Best products in town",
  "logo": [binary file],
  "contact_email": "shop@example.com",
  "contact_phone": "1234567890",
  "address": "456 Business Ave"
}
```

### Product Management

**Get All Products**
```
GET /seller/products
```

**Add Product**
```
POST /seller/products/add
```
Body:
```json
{
  "name": "New Product",
  "description": "Product description",
  "price": 99.99,
  "stock": 10,
  "category": "Electronics",
  "variations": {
    "sizes": ["S", "M", "L"],
    "colors": ["Red", "Blue"]
  },
  "image": [binary file]
}
```

**Update Product**
```
POST /seller/products/update/{id}
```

**Delete Product**
```
DELETE /seller/products/delete/{id}
```

### Product Variations

**Add Variation**
```
POST /seller/products/{id}/variations
```
Body:
```json
{
  "size": "XL",
  "color": "Green",
  "stock": 5,
  "price_adjustment": 2.00,
  "sku": "PROD-XL-GREEN"
}
```

**Update Variation**
```
PUT /seller/products/{id}/variations/{variationId}
```

**Delete Variation**
```
DELETE /seller/products/{id}/variations/{variationId}
```

### Order Management

**Get Seller Orders**
```
GET /seller/orders
```

**Update Order Status**
```
PUT /seller/orders/{id}/status
```
Body:
```json
{
  "status": "approved"
}
```
Status options: `approved`, `rejected`, `completed`

## Admin Functions

### User Management

**Get All Users**
```
GET /admin/users
```

**Update User Role**
```
PUT /admin/users/{userId}/role
```
Body:
```json
{
  "role": "seller"
}
```
Role options: `admin`, `seller`, `customer`

**Delete User**
```
DELETE /admin/users/{userId}
```

### Business Approval

**Get Pending Businesses**
```
GET /admin/businesses/pending
```

**Approve Business**
```
PUT /admin/businesses/{shopId}/approve
```

**Reject Business**
```
PUT /admin/businesses/{shopId}/reject
```
Body:
```json
{
  "rejection_reason": "Incomplete information"
}
```

### Report Management

**Get All Reports**
```
GET /admin/reports
```
Query Parameters:
- `status`: Filter by status (pending, reviewed, resolved, all)

**Review Report**
```
PUT /admin/reports/{reportId}/review
```
Body:
```json
{
  "status": "resolved",
  "admin_notes": "Removed the item",
  "remove_item": true
}
```
Status options: `reviewed`, `resolved`

## Health Checks

**Admin API Health**
```
GET /health/admin
```

**Customer API Health**
```
GET /health/customer
```

**Seller API Health**
```
GET /health/seller
```

## Error Responses

The API returns appropriate HTTP status codes:

- `200 OK`: Request succeeded
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request parameters
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server-side error

Error response format:
```json
{
  "message": "Error description"
}
```

## Authentication

All protected endpoints require an authentication token provided in the header:

```
Authorization: Bearer YOUR_API_TOKEN
```

## Pagination

List endpoints return paginated results with the following structure:

```json
{
  "data": [...],
  "links": {
    "first": "...",
    "last": "...",
    "prev": null,
    "next": "..."
  },
  "meta": {
    "current_page": 1,
    "from": 1,
    "last_page": 5,
    "path": "...",
    "per_page": 10,
    "to": 10,
    "total": 50
  }
}
```
