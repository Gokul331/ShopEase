from django.core.management.base import BaseCommand
from api.models import Category, Product
from django.utils.text import slugify

class Command(BaseCommand):
    help = 'Seed the database with sample categories and products'

    def handle(self, *args, **options):
       # Sample data for Category model
        categories = [
    {
        'name': 'Electronics',
        'slug': 'electronics',
        'description': 'Latest gadgets, smartphones, laptops, and electronic devices',
        'parent': None,
        'image': 'categories/electronics.jpg',
        'is_active': True,
        'is_featured': True
    },
    {
        'name': 'Mobile Phones',
        'slug': 'mobile-phones',
        'description': 'Smartphones from top brands like Apple, Samsung, Google',
        'parent': 'electronics',  # Parent slug
        'image': 'categories/mobile-phones.jpg',
        'is_active': True,
        'is_featured': True
    },
    {
        'name': 'Laptops',
        'slug': 'laptops',
        'description': 'Gaming, business, and student laptops from all major brands',
        'parent': 'electronics',
        'image': 'categories/laptops.jpg',
        'is_active': True,
        'is_featured': False
    },
    {
        'name': 'Fashion',
        'slug': 'fashion',
        'description': 'Trendy clothing, shoes, and accessories for everyone',
        'parent': None,
        'image': 'categories/fashion.jpg',
        'is_active': True,
        'is_featured': True
    },
    {
        'name': "Men's Clothing",
        'slug': 'mens-clothing',
        'description': 'Shirts, pants, jackets, and formal wear for men',
        'parent': 'fashion',
        'image': 'categories/mens-clothing.jpg',
        'is_active': True,
        'is_featured': False
    },
    {
        'name': "Women's Clothing",
        'slug': 'womens-clothing',
        'description': 'Dresses, tops, skirts, and women fashion',
        'parent': 'fashion',
        'image': 'categories/womens-clothing.jpg',
        'is_active': True,
        'is_featured': True
    },
    {
        'name': 'Home & Kitchen',
        'slug': 'home-kitchen',
        'description': 'Furniture, appliances, and kitchen essentials',
        'parent': None,
        'image': 'categories/home-kitchen.jpg',
        'is_active': True,
        'is_featured': False
    },
    {
        'name': 'Furniture',
        'slug': 'furniture',
        'description': 'Sofas, beds, tables, and home furniture',
        'parent': 'home-kitchen',
        'image': 'categories/furniture.jpg',
        'is_active': True,
        'is_featured': False
    },
    {
        'name': 'Kitchen Appliances',
        'slug': 'kitchen-appliances',
        'description': 'Mixers, microwaves, refrigerators, and cooking tools',
        'parent': 'home-kitchen',
        'image': 'categories/kitchen-appliances.jpg',
        'is_active': True,
        'is_featured': True
    },
    {
        'name': 'Books',
        'slug': 'books',
        'description': 'Fiction, non-fiction, educational, and children books',
        'parent': None,
        'image': 'categories/books.jpg',
        'is_active': True,
        'is_featured': False
    },
    {
        'name': 'Fiction',
        'slug': 'fiction-books',
        'description': 'Novels, science fiction, fantasy, and romance books',
        'parent': 'books',
        'image': 'categories/fiction-books.jpg',
        'is_active': True,
        'is_featured': False
    },
    {
        'name': 'Sports & Outdoors',
        'slug': 'sports-outdoors',
        'description': 'Sports equipment, fitness gear, and outdoor activities',
        'parent': None,
        'image': 'categories/sports-outdoors.jpg',
        'is_active': True,
        'is_featured': True
    },
    {
        'name': 'Fitness Equipment',
        'slug': 'fitness-equipment',
        'description': 'Treadmills, weights, yoga mats, and gym equipment',
        'parent': 'sports-outdoors',
        'image': 'categories/fitness-equipment.jpg',
        'is_active': True,
        'is_featured': False
    }
]

        products = [
    # Electronics (10 products)
    {
        'title': 'Smart 4K TV',
        'description': 'Ultra HD Smart LED TV with HDR',
        'price': 699.99,
        'category_name': 'Electronics',
        'discount_percentage': 15,
        'is_trending': True,
        'stock': 50
    },
    {
        'title': 'Wireless Earbuds',
        'description': 'True wireless earbuds with noise cancellation',
        'price': 149.99,
        'category_name': 'Electronics',
        'discount_percentage': 20,
        'is_trending': True,
        'stock': 100
    },
    {
        'title': 'Gaming Laptop',
        'description': 'High-performance gaming laptop with RTX graphics',
        'price': 1299.99,
        'category_name': 'Electronics',
        'discount_percentage': 10,
        'is_trending': True,
        'stock': 25
    },
    {
        'title': 'Smartphone Pro',
        'description': 'Latest smartphone with triple camera system',
        'price': 899.99,
        'category_name': 'Electronics',
        'discount_percentage': 12,
        'is_trending': True,
        'stock': 75
    },
    {
        'title': 'Smart Watch',
        'description': 'Fitness tracker with heart rate monitor',
        'price': 199.99,
        'category_name': 'Electronics',
        'discount_percentage': 25,
        'is_trending': False,
        'stock': 120
    },
    {
        'title': 'Bluetooth Speaker',
        'description': 'Portable waterproof speaker with 360° sound',
        'price': 79.99,
        'category_name': 'Electronics',
        'discount_percentage': 15,
        'is_trending': False,
        'stock': 200
    },
    {
        'title': 'Tablet',
        'description': '10-inch tablet with stylus support',
        'price': 349.99,
        'category_name': 'Electronics',
        'discount_percentage': 8,
        'is_trending': False,
        'stock': 60
    },
    {
        'title': 'Digital Camera',
        'description': 'DSLR camera with 4K video recording',
        'price': 799.99,
        'category_name': 'Electronics',
        'discount_percentage': 18,
        'is_trending': True,
        'stock': 30
    },
    {
        'title': 'Gaming Console',
        'description': 'Next-gen gaming console with 1TB storage',
        'price': 499.99,
        'category_name': 'Electronics',
        'discount_percentage': 5,
        'is_trending': True,
        'stock': 40
    },
    {
        'title': 'Wireless Keyboard',
        'description': 'Mechanical wireless keyboard with RGB lighting',
        'price': 89.99,
        'category_name': 'Electronics',
        'discount_percentage': 20,
        'is_trending': False,
        'stock': 150
    },

    # Fashion (10 products)
    {
        'title': 'Designer Leather Jacket',
        'description': 'Premium leather jacket with modern design',
        'price': 299.99,
        'category_name': 'Fashion',
        'discount_percentage': 10,
        'is_trending': True,
        'stock': 30
    },
    {
        'title': 'Running Shoes',
        'description': 'Comfortable running shoes with advanced cushioning',
        'price': 89.99,
        'category_name': 'Fashion',
        'discount_percentage': 5,
        'is_trending': False,
        'stock': 75
    },
    {
        'title': 'Designer Handbag',
        'description': 'Luxury leather handbag with multiple compartments',
        'price': 249.99,
        'category_name': 'Fashion',
        'discount_percentage': 15,
        'is_trending': True,
        'stock': 20
    },
    {
        'title': 'Sunglasses',
        'description': 'Polarized UV protection sunglasses',
        'price': 129.99,
        'category_name': 'Fashion',
        'discount_percentage': 30,
        'is_trending': False,
        'stock': 100
    },
    {
        'title': 'Winter Coat',
        'description': 'Warm winter coat with waterproof lining',
        'price': 179.99,
        'category_name': 'Fashion',
        'discount_percentage': 20,
        'is_trending': True,
        'stock': 45
    },
    {
        'title': 'Casual Dress',
        'description': 'Elegant casual dress for everyday wear',
        'price': 59.99,
        'category_name': 'Fashion',
        'discount_percentage': 25,
        'is_trending': False,
        'stock': 80
    },
    {
        'title': 'Formal Shirt',
        'description': 'Classic formal shirt with premium cotton',
        'price': 49.99,
        'category_name': 'Fashion',
        'discount_percentage': 10,
        'is_trending': False,
        'stock': 120
    },
    {
        'title': 'Designer Jeans',
        'description': 'Slim fit jeans with premium denim',
        'price': 79.99,
        'category_name': 'Fashion',
        'discount_percentage': 15,
        'is_trending': True,
        'stock': 90
    },
    {
        'title': 'Sports Sneakers',
        'description': 'Lightweight sneakers for sports and casual wear',
        'price': 69.99,
        'category_name': 'Fashion',
        'discount_percentage': 20,
        'is_trending': False,
        'stock': 110
    },
    {
        'title': 'Wool Sweater',
        'description': '100% wool sweater for cold weather',
        'price': 89.99,
        'category_name': 'Fashion',
        'discount_percentage': 30,
        'is_trending': True,
        'stock': 55
    },

    # Home & Living (10 products)
    {
        'title': 'Modern Coffee Table',
        'description': 'Elegant coffee table with storage',
        'price': 199.99,
        'category_name': 'Home & Living',
        'discount_percentage': 25,
        'is_trending': True,
        'stock': 20
    },
    {
        'title': 'Smart LED Lights',
        'description': 'WiFi-enabled RGB LED strip lights',
        'price': 49.99,
        'category_name': 'Home & Living',
        'discount_percentage': 0,
        'is_trending': False,
        'stock': 150
    },
    {
        'title': 'Queen Size Bed',
        'description': 'Comfortable queen size bed with memory foam mattress',
        'price': 599.99,
        'category_name': 'Home & Living',
        'discount_percentage': 15,
        'is_trending': True,
        'stock': 15
    },
    {
        'title': 'Kitchen Mixer',
        'description': 'Stand mixer with multiple attachments',
        'price': 299.99,
        'category_name': 'Home & Living',
        'discount_percentage': 20,
        'is_trending': False,
        'stock': 40
    },
    {
        'title': 'Air Purifier',
        'description': 'HEPA air purifier for large rooms',
        'price': 159.99,
        'category_name': 'Home & Living',
        'discount_percentage': 10,
        'is_trending': True,
        'stock': 60
    },
    {
        'title': 'Dining Table Set',
        'description': '6-seater dining table with chairs',
        'price': 799.99,
        'category_name': 'Home & Living',
        'discount_percentage': 30,
        'is_trending': False,
        'stock': 10
    },
    {
        'title': 'Robot Vacuum',
        'description': 'Smart robot vacuum with app control',
        'price': 349.99,
        'category_name': 'Home & Living',
        'discount_percentage': 25,
        'is_trending': True,
        'stock': 35
    },
    {
        'title': 'Bedding Set',
        'description': 'Luxury cotton bedding set with pillowcases',
        'price': 89.99,
        'category_name': 'Home & Living',
        'discount_percentage': 40,
        'is_trending': False,
        'stock': 85
    },
    {
        'title': 'Wall Art',
        'description': 'Modern canvas wall art for home decoration',
        'price': 69.99,
        'category_name': 'Home & Living',
        'discount_percentage': 15,
        'is_trending': True,
        'stock': 70
    },
    {
        'title': 'Smart Thermostat',
        'description': 'WiFi thermostat with energy saving features',
        'price': 129.99,
        'category_name': 'Home & Living',
        'discount_percentage': 20,
        'is_trending': False,
        'stock': 95
    },

    # Books (5 products)
    {
        'title': 'Best Seller Novel',
        'description': 'Award-winning fiction novel',
        'price': 24.99,
        'category_name': 'Books',
        'discount_percentage': 30,
        'is_trending': True,
        'stock': 200
    },
    {
        'title': 'Cookbook Collection',
        'description': 'Complete cookbook with 500+ recipes',
        'price': 34.99,
        'category_name': 'Books',
        'discount_percentage': 25,
        'is_trending': False,
        'stock': 80
    },
    {
        'title': 'Science Fiction',
        'description': 'Bestselling science fiction series',
        'price': 19.99,
        'category_name': 'Books',
        'discount_percentage': 40,
        'is_trending': True,
        'stock': 150
    },
    {
        'title': 'Self-Help Guide',
        'description': 'Personal development and success strategies',
        'price': 22.99,
        'category_name': 'Books',
        'discount_percentage': 20,
        'is_trending': False,
        'stock': 120
    },
    {
        'title': 'Childrens Book Set',
        'description': 'Educational book set for young readers',
        'price': 29.99,
        'category_name': 'Books',
        'discount_percentage': 35,
        'is_trending': True,
        'stock': 90
    },

    # Sports & Outdoors (10 products)
    {
        'title': 'Mountain Bike',
        'description': 'Professional mountain bike with 21 speeds',
        'price': 499.99,
        'category_name': 'Sports & Outdoors',
        'discount_percentage': 10,
        'is_trending': True,
        'stock': 15
    },
    {
        'title': 'Yoga Mat',
        'description': 'Non-slip yoga mat with carrying strap',
        'price': 29.99,
        'category_name': 'Sports & Outdoors',
        'discount_percentage': 50,
        'is_trending': False,
        'stock': 200
    },
    {
        'title': 'Tennis Racket',
        'description': 'Professional tennis racket with carbon fiber',
        'price': 129.99,
        'category_name': 'Sports & Outdoors',
        'discount_percentage': 25,
        'is_trending': True,
        'stock': 45
    },
    {
        'title': 'Camping Tent',
        'description': '4-person waterproof camping tent',
        'price': 149.99,
        'category_name': 'Sports & Outdoors',
        'discount_percentage': 30,
        'is_trending': True,
        'stock': 25
    },
    {
        'title': 'Fitness Tracker',
        'description': 'Advanced fitness tracker with GPS',
        'price': 79.99,
        'category_name': 'Sports & Outdoors',
        'discount_percentage': 15,
        'is_trending': False,
        'stock': 180
    },
    {
        'title': 'Dumbbell Set',
        'description': 'Adjustable dumbbell set for home workouts',
        'price': 199.99,
        'category_name': 'Sports & Outdoors',
        'discount_percentage': 20,
        'is_trending': True,
        'stock': 60
    },
    {
        'title': 'Running Shorts',
        'description': 'Lightweight running shorts with moisture-wicking',
        'price': 24.99,
        'category_name': 'Sports & Outdoors',
        'discount_percentage': 40,
        'is_trending': False,
        'stock': 140
    },
    {
        'title': 'Hiking Boots',
        'description': 'Waterproof hiking boots with ankle support',
        'price': 119.99,
        'category_name': 'Sports & Outdoors',
        'discount_percentage': 25,
        'is_trending': True,
        'stock': 70
    },
    {
        'title': 'Basketball',
        'description': 'Official size basketball with grip technology',
        'price': 39.99,
        'category_name': 'Sports & Outdoors',
        'discount_percentage': 30,
        'is_trending': False,
        'stock': 160
    },
    {
        'title': 'Swimming Goggles',
        'description': 'Anti-fog swimming goggles with UV protection',
        'price': 19.99,
        'category_name': 'Sports & Outdoors',
        'discount_percentage': 50,
        'is_trending': True,
        'stock': 220
    },

    # Beauty & Personal Care (8 products)
    {
        'title': 'Skincare Set',
        'description': 'Complete skincare routine set',
        'price': 89.99,
        'category_name': 'Beauty & Personal Care',
        'discount_percentage': 25,
        'is_trending': True,
        'stock': 65
    },
    {
        'title': 'Hair Dryer',
        'description': 'Professional ionic hair dryer',
        'price': 59.99,
        'category_name': 'Beauty & Personal Care',
        'discount_percentage': 30,
        'is_trending': False,
        'stock': 95
    },
    {
        'title': 'Perfume Collection',
        'description': 'Luxury perfume set with 3 fragrances',
        'price': 129.99,
        'category_name': 'Beauty & Personal Care',
        'discount_percentage': 20,
        'is_trending': True,
        'stock': 40
    },
    {
        'title': 'Makeup Kit',
        'description': 'Professional makeup kit with brushes',
        'price': 79.99,
        'category_name': 'Beauty & Personal Care',
        'discount_percentage': 35,
        'is_trending': True,
        'stock': 55
    },
    {
        'title': 'Electric Toothbrush',
        'description': 'Smart electric toothbrush with app',
        'price': 99.99,
        'category_name': 'Beauty & Personal Care',
        'discount_percentage': 15,
        'is_trending': False,
        'stock': 120
    },
    {
        'title': 'Face Serum',
        'description': 'Anti-aging face serum with vitamins',
        'price': 49.99,
        'category_name': 'Beauty & Personal Care',
        'discount_percentage': 40,
        'is_trending': True,
        'stock': 85
    },
    {
        'title': 'Hair Straightener',
        'description': 'Ceramic hair straightener with adjustable temperature',
        'price': 69.99,
        'category_name': 'Beauty & Personal Care',
        'discount_percentage': 25,
        'is_trending': False,
        'stock': 75
    },
    {
        'title': 'Body Lotion',
        'description': 'Moisturizing body lotion with shea butter',
        'price': 19.99,
        'category_name': 'Beauty & Personal Care',
        'discount_percentage': 50,
        'is_trending': True,
        'stock': 180
    },

    # Jewelry & Watches (6 products)
    {
        'title': 'Diamond Necklace',
        'description': 'Elegant diamond necklace with 18k gold',
        'price': 899.99,
        'category_name': 'Jewelry & Watches',
        'discount_percentage': 15,
        'is_trending': True,
        'stock': 12
    },
    {
        'title': 'Luxury Watch',
        'description': 'Automatic mechanical watch with leather strap',
        'price': 599.99,
        'category_name': 'Jewelry & Watches',
        'discount_percentage': 20,
        'is_trending': True,
        'stock': 18
    },
    {
        'title': 'Pearl Earrings',
        'description': 'Classic pearl earrings with sterling silver',
        'price': 149.99,
        'category_name': 'Jewelry & Watches',
        'discount_percentage': 30,
        'is_trending': False,
        'stock': 45
    },
    {
        'title': 'Silver Bracelet',
        'description': 'Handcrafted silver bracelet with gemstones',
        'price': 199.99,
        'category_name': 'Jewelry & Watches',
        'discount_percentage': 25,
        'is_trending': True,
        'stock': 28
    },
    {
        'title': 'Smart Ring',
        'description': 'Fitness tracking smart ring with notifications',
        'price': 179.99,
        'category_name': 'Jewelry & Watches',
        'discount_percentage': 10,
        'is_trending': True,
        'stock': 60
    },
    {
        'title': 'Gold Chain',
        'description': '14k gold chain with secure clasp',
        'price': 349.99,
        'category_name': 'Jewelry & Watches',
        'discount_percentage': 15,
        'is_trending': False,
        'stock': 35
    }
]

        for cat in categories:
            # compute a slug from the category name so the dict doesn't need an explicit 'slug' key
            cat_slug = slugify(cat['name'])
            obj, created = Category.objects.get_or_create(
                slug=cat_slug,
                defaults={
                    'name': cat['name'],
                    'is_featured': cat.get('is_featured', False),
                    'description': cat.get('description', ''),
                    'image': cat.get('image', None),
                    'is_active': cat.get('is_active', True),
                    'parent': Category.objects.filter(slug=slugify(cat['parent'])).first() if cat.get('parent') else None,
                                       
                }
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f"Created category: {obj.name}"))

        for p in products:
            # find category by slug generated from the provided category_name
            category_key = p.get('category_name') or p.get('category')
            cat_slug = slugify(category_key) if category_key else None
            cat = Category.objects.filter(slug=cat_slug).first() if cat_slug else None

            title = p['title']
            slug = slugify(title)
            defaults = {
                'title': title,
                'description': p.get('description', ''),
                'price': p.get('price', 0.0),
                'category': cat,
                'discount_percentage': p.get('discount_percentage', 0),
                'is_trending': p.get('is_trending', False),
                'stock': p.get('stock', 0),
            }

            prod, created = Product.objects.get_or_create(slug=slug, defaults=defaults)
            if created:
                self.stdout.write(self.style.SUCCESS(f"Created product: {prod.title}"))

        self.stdout.write(self.style.SUCCESS('Seeding complete.'))
