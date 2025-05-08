import axios from "axios";
import { describe, expect, test } from '@jest/globals';

const API_BASE_URL = "http://127.0.0.1:8000/api"; // Laravel API base URL
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: { "Content-Type": "application/json" },
});

describe('Check API Endpoints Health', () => {
    test("GET admin /health should be healthy", async () => {
        expect.assertions(2);
        try {
            const response: any = await api.get('/health/admin')
            expect(response.status).toBe(200);
            expect(response.data).toMatchObject({"message": "working"});
        }catch(err){
            throw new Error(err.message);
        }
    });

    test("GET customer /health should return 200 and healthy message", async () => {
        expect.assertions(2);
        try {
            const response: any = await api.get('/health/customer')
            expect(response.status).toBe(200);
            expect(response.data).toMatchObject({"message": "working"});
        }catch(err){
            throw new Error(err.message);
        }
    });

    test("GET seller /health should return 200 and healthy message", async () => {
        expect.assertions(2);
        try {
            const response: any = await api.get('/health/seller')
            expect(response.status).toBe(200);
            expect(response.data).toMatchObject({"message": "working"});
        }catch(err){
            throw new Error(err.message);
        }
    });
});

describe('Authentication Endpoints', () => {
    test("POST /register/seller should register a seller", async () => {
        expect.assertions(1);
        try {
            const response = await api.post('/register/seller', {
                name: "Test Seller",
                email: "seller@example.com",
                password: "password",
                password_confirmation: "password",
                shop_name: "Test Shop"
            });
            expect(response.status).toBe(201);
        } catch (err) {
            throw new Error(err.message);
        }
    });

    test("POST /register/customer should register a customer", async () => {
        expect.assertions(1);
        try {
            const response = await api.post('/register/customer', {
                name: "Test Customer",
                email: "customer@example.com",
                password: "password",
                password_confirmation: "password"
            });
            expect(response.status).toBe(201);
        } catch (err) {
            throw new Error(err.message);
        }
    });
});

describe('Item Endpoints', () => {
    test("GET /items should return a list of items", async () => {
        expect.assertions(1);
        try {
            const response = await api.get('/items');
            expect(response.status).toBe(200);
        } catch (err) {
            throw new Error(err.message);
        }
    });

    test("GET /items/{id} should return item details", async () => {
        expect.assertions(1);
        try {
            const response = await api.get('/items/1'); // Replace 1 with a valid item ID
            expect(response.status).toBe(200);
        } catch (err) {
            throw new Error(err.message);
        }
    });
});

describe('Order Endpoints', () => {
    test("GET /orders should return a list of orders", async () => {
        expect.assertions(1);
        try {
            const response = await api.get('/orders');
            expect(response.status).toBe(200);
        } catch (err) {
            throw new Error(err.message);
        }
    });

    test("POST /items/{itemId}/orders should create an order", async () => {
        expect.assertions(1);
        try {
            const response = await api.post('/items/1/orders', { // Replace 1 with a valid item ID
                quantity: 1,
                shipping_address: "123 Test Street"
            });
            expect(response.status).toBe(201);
        } catch (err) {
            throw new Error(err.message);
        }
    });
});

describe('Login and Logout Endpoints', () => {
    test("POST /login should log in a user", async () => {
        expect.assertions(1);
        try {
            const response = await api.post('/login', {
                email: "seller@example.com", // Replace with a valid email
                password: "password" // Replace with the correct password
            });
            expect(response.status).toBe(200);
        } catch (err) {
            throw new Error(err.message);
        }
    });

    test("POST /logout should log out a user", async () => {
        expect.assertions(1);
        try {
            const loginResponse = await api.post('/login', {
                email: "seller@example.com", // Replace with a valid email
                password: "password" // Replace with the correct password
            });

            const token = loginResponse.data.token;
            const logoutResponse = await api.post('/logout', {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            expect(logoutResponse.status).toBe(200);
        } catch (err) {
            throw new Error(err.message);
        }
    });
});

describe('Protected Routes', () => {
    test("GET /seller/items should return 401 without a token", async () => {
        expect.assertions(1);
        try {
            await api.get('/seller/items');
        } catch (err) {
            expect(err.response.status).toBe(401);
        }
    });

    test("GET /seller/items should return 200 with a valid token", async () => {
        expect.assertions(1);
        try {
            const loginResponse = await api.post('/login', {
                email: "seller@example.com", // Replace with a valid email
                password: "password" // Replace with the correct password
            });

            const token = loginResponse.data.token;
            const response = await api.get('/seller/items', {
                headers: { Authorization: `Bearer ${token}` }
            });
            expect(response.status).toBe(200);
        } catch (err) {
            throw new Error(err.message);
        }
    });
});