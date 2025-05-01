export const mockUsers = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    role: 'customer',
    created_at: '2024-01-01',
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'seller',
    created_at: '2024-01-02',
  },
  {
    id: 3,
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
    created_at: '2024-01-03',
  },
];

export const mockProducts = [
  {
    id: 1,
    name: 'Laptop',
    description: 'High-performance laptop',
    price: 999.99,
    seller_id: 2,
    stock: 10,
    image_url: '/images/laptop.jpg',
    created_at: '2024-01-01',
    category: 'Electronics',
  },
  {
    id: 2,
    name: 'Smartphone',
    description: 'Latest smartphone model',
    price: 699.99,
    seller_id: 2,
    stock: 15,
    image_url: '/images/phone.jpg',
    created_at: '2024-01-02',
    category: 'Electronics',
  },
  {
    id: 3,
    name: 'Headphones',
    description: 'Wireless noise-canceling headphones',
    price: 199.99,
    seller_id: 2,
    stock: 20,
    image_url: '/images/headphones.jpg',
    created_at: '2024-01-03',
    category: 'Electronics',
  },
];

export const mockBusinessProfiles = [
  {
    seller_id: 2,
    business_name: 'Tech Store',
    description: 'Your one-stop shop for electronics',
    logo_url: '/images/tech-store-logo.jpg',
    contact_email: 'contact@techstore.com',
    contact_phone: '123-456-7890',
    address: '123 Tech Street',
    is_approved: true,
    approval_date: '2024-01-01',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },
];

export const mockProfiles = [
  {
    id: 1,
    user_id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    phone: '123-456-7890',
    address: '456 Customer Street',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },
];

export const mockReviews = [
  {
    id: 1,
    product_id: 1,
    user_id: 1,
    user_name: 'John Doe',
    user_image: 'https://randomuser.me/api/portraits/men/1.jpg',
    rating: 4.5,
    comment: 'Great product! The quality is excellent and it arrived quickly. Would definitely recommend to others.',
    created_at: '2024-02-15',
    images: [
      'https://picsum.photos/400/300?random=1',
      'https://picsum.photos/400/300?random=2'
    ]
  },
  {
    id: 2,
    product_id: 1,
    user_id: 3,
    user_name: 'Sarah Johnson',
    user_image: 'https://randomuser.me/api/portraits/women/2.jpg',
    rating: 5,
    comment: 'Absolutely love this product! It exceeded my expectations. The customer service was also fantastic.',
    created_at: '2024-02-10',
    images: [
      'https://picsum.photos/400/300?random=3'
    ]
  },
  {
    id: 3,
    product_id: 1,
    user_id: 4,
    user_name: 'Michael Brown',
    user_image: 'https://randomuser.me/api/portraits/men/3.jpg',
    rating: 3.5,
    comment: 'Good product overall, but could be improved in a few areas. Still worth the price though.',
    created_at: '2024-02-05',
    images: []
  }
]; 