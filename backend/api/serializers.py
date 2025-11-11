from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    UserProfile, Category, Product, Cart, CartItem,
    WishList, Order, OrderItem, Banner
)
from .models import Address, Card, RecentlyViewed

class UserSerializer(serializers.ModelSerializer):
    # include write-only password to support registration
    password = serializers.CharField(write_only=True, required=False)
    phone = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = User
        # include 'phone' since we declare it above — it's used at registration to save
        # the phone number into the related UserProfile
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'password', 'phone']

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        phone = validated_data.pop('phone', None)
        # Create user with provided fields; use set_password for hashing
        user = User(**validated_data)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save()

        # Ensure a UserProfile exists and save phone if provided
        profile, _ = UserProfile.objects.get_or_create(user=user)
        if phone:
            profile.phone = phone
            profile.save()

        return user

class UserProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    addresses = serializers.SerializerMethodField()
    cards = serializers.SerializerMethodField()
    recently_viewed = serializers.SerializerMethodField()

    class Meta:
        model = UserProfile
        fields = ['id', 'username', 'email', 'phone', 'address', 'addresses', 'cards', 'recently_viewed', 'created_at']

    def get_addresses(self, obj):
        return AddressSerializer(obj.user.addresses.all(), many=True).data

    def get_cards(self, obj):
        return CardSerializer(obj.user.cards.all(), many=True).data

    def get_recently_viewed(self, obj):
        # Return product details for recently viewed items
        items = obj.user.recently_viewed.select_related('product')[:10]
        products = [rv.product for rv in items]
        # ProductSerializer is defined in this module below; use it to serialize
        return ProductSerializer(products, many=True).data


from rest_framework import serializers
from .models import Category, Brand, Product, ProductImage, ProductSpecification, ProductVariant
from rest_framework import serializers
from .models import Category, Brand, Product, ProductImage, ProductSpecification, ProductVariant

class CategorySerializer(serializers.ModelSerializer):
   
    parent_name = serializers.CharField(source='parent.name', read_only=True)
    
    class Meta:
        model = Category
        fields = [
            'id', 'name', 'slug', 'description', 'image', 'parent', 'parent_name',
            'is_active', 'is_featured'
        ]
    
    def get_product_count(self, obj):
        return obj.products.filter(is_active=True).count()

class BrandSerializer(serializers.ModelSerializer):
    product_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Brand
        fields = [
            'id', 'name', 'slug', 'description', 'logo', 'website', 
            'is_active', 'product_count'
        ]
    
    def get_product_count(self, obj):
        return obj.products.filter(is_active=True).count()

class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'alt_text', 'is_primary', 'order']

class ProductSpecificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductSpecification
        fields = ['id', 'name', 'value', 'group', 'order']

class ProductVariantSerializer(serializers.ModelSerializer):
    final_price = serializers.ReadOnlyField()
    final_weight = serializers.ReadOnlyField()
    stock_status = serializers.SerializerMethodField()
    
    class Meta:
        model = ProductVariant
        fields = [
            'id', 'sku', 'variant_name', 'price_modifier', 'final_price',
            'stock', 'weight_modifier', 'final_weight', 'color', 'size',
            'image', 'is_active', 'created_at', 'stock_status'
        ]
    
    def get_stock_status(self, obj):
        if obj.stock == 0:
            return "Out of Stock"
        elif obj.stock <= 5:
            return "Low Stock"
        return "In Stock"

class ProductSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), 
        source='category', 
        write_only=True, 
        required=False, 
        allow_null=True
    )
    
    brand = BrandSerializer(read_only=True)
    brand_id = serializers.PrimaryKeyRelatedField(
        queryset=Brand.objects.all(), 
        source='brand', 
        write_only=True, 
        required=False, 
        allow_null=True
    )
    
    # Related fields
    images = ProductImageSerializer(many=True, read_only=True)
    specifications = ProductSpecificationSerializer(many=True, read_only=True)
    variants = ProductVariantSerializer(many=True, read_only=True)
    
    # Computed fields from model properties
    sale_price = serializers.ReadOnlyField()
    discount_amount = serializers.ReadOnlyField()
    in_stock = serializers.ReadOnlyField()
    low_stock = serializers.ReadOnlyField()
    stock_status = serializers.ReadOnlyField()
    dimensions = serializers.ReadOnlyField()
    
    class Meta:
        model = Product
        fields = [
            # Basic Identification
            'id', 'title', 'slug', 'sku', 'upc', 'model_number',
            
            # Basic Info
            'description', 'short_description', 'category', 'category_id',
            'brand', 'brand_id',
            
            # Pricing & Inventory
            'price', 'sale_price', 'compare_at_price', 'cost_price',
            'discount_percentage', 'discount_amount', 'stock', 'low_stock_threshold',
            'manage_stock', 'allow_backorders', 'backorder_limit',
            'stock_status', 'in_stock', 'low_stock',
            
            # Physical Specifications
            'weight', 'weight_unit', 'length', 'width', 'height', 
            'dimensions_unit', 'dimensions', 'color', 'material', 'size', 'style',
            
            # Technical Specifications
            'specification_1', 'specification_2', 'specification_3',
            'specification_4', 'specification_5',
            
            # Digital Assets
            'main_image', 'image', 'images',
            
            # Product Status & Flags
            'is_active', 'is_trending', 'is_featured', 'is_bestseller', 'is_new_arrival',
            
            # Warranty & Support
            'warranty_period', 'warranty_type',
            
            # Compliance & Origin
            'country_of_origin', 'hs_code',
            
            # SEO & Meta
            'meta_title', 'meta_description', 'search_keywords',
            
            # Related Data
            'specifications', 'variants',
            
            # Audit Fields
            'created_at', 'updated_at', 'published_at'
        ]
        read_only_fields = ['created_at', 'updated_at', 'published_at']

class ProductListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for product listings"""
    category = CategorySerializer(read_only=True)
    brand = BrandSerializer(read_only=True)
    
    # Computed fields
    sale_price = serializers.ReadOnlyField()
    in_stock = serializers.ReadOnlyField()
    stock_status = serializers.ReadOnlyField()
    main_image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = [
            'id', 'title', 'slug', 'sku', 'short_description', 'price', 
            'sale_price', 'compare_at_price', 'discount_percentage',
            'main_image_url', 'brand', 'category', 'stock_status', 'in_stock',
            'is_trending', 'is_featured', 'is_bestseller', 'is_new_arrival',
            'created_at'
        ]
    
    def get_main_image_url(self, obj):
        if obj.main_image:
            return obj.main_image.url
        elif obj.image:
            return obj.image.url
        return None

class ProductCreateSerializer(serializers.ModelSerializer):
    """Serializer specifically for creating products"""
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.filter(is_active=True),
        source='category',
        write_only=True,
        required=False,
        allow_null=True
    )
    
    brand_id = serializers.PrimaryKeyRelatedField(
        queryset=Brand.objects.filter(is_active=True),
        source='brand',
        write_only=True,
        required=False,
        allow_null=True
    )
    
    class Meta:
        model = Product
        fields = [
            'title', 'slug', 'sku', 'upc', 'model_number',
            'description', 'short_description', 'category_id', 'brand_id',
            'price', 'compare_at_price', 'cost_price', 'discount_percentage',
            'stock', 'low_stock_threshold', 'manage_stock', 'allow_backorders', 'backorder_limit',
            'weight', 'weight_unit', 'length', 'width', 'height', 'dimensions_unit',
            'color', 'material', 'size', 'style',
            'specification_1', 'specification_2', 'specification_3',
            'specification_4', 'specification_5',
            'main_image', 'image',
            'is_active', 'is_trending', 'is_featured', 'is_bestseller', 'is_new_arrival',
            'warranty_period', 'warranty_type',
            'country_of_origin', 'hs_code',
            'meta_title', 'meta_description', 'search_keywords'
        ]
    
    def validate(self, data):
        """Custom validation for product data"""
        # Validate discount percentage
        discount_percentage = data.get('discount_percentage', 0)
        if discount_percentage < 0 or discount_percentage > 100:
            raise serializers.ValidationError({
                'discount_percentage': 'Discount percentage must be between 0 and 100.'
            })
        
        # Validate price fields
        price = data.get('price', 0)
        compare_at_price = data.get('compare_at_price')
        cost_price = data.get('cost_price')
        
        if price < 0:
            raise serializers.ValidationError({
                'price': 'Price cannot be negative.'
            })
        
        if compare_at_price and compare_at_price < price:
            raise serializers.ValidationError({
                'compare_at_price': 'Compare at price cannot be less than current price.'
            })
        
        if cost_price and cost_price > price:
            raise serializers.ValidationError({
                'cost_price': 'Cost price cannot be greater than selling price.'
            })
        
        return data

class ProductUpdateSerializer(serializers.ModelSerializer):
    """Serializer specifically for updating products"""
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.filter(is_active=True),
        source='category',
        write_only=True,
        required=False,
        allow_null=True
    )
    
    brand_id = serializers.PrimaryKeyRelatedField(
        queryset=Brand.objects.filter(is_active=True),
        source='brand',
        write_only=True,
        required=False,
        allow_null=True
    )
    
    class Meta:
        model = Product
        fields = [
            'title', 'slug', 'sku', 'upc', 'model_number',
            'description', 'short_description', 'category_id', 'brand_id',
            'price', 'compare_at_price', 'cost_price', 'discount_percentage',
            'stock', 'low_stock_threshold', 'manage_stock', 'allow_backorders', 'backorder_limit',
            'weight', 'weight_unit', 'length', 'width', 'height', 'dimensions_unit',
            'color', 'material', 'size', 'style',
            'specification_1', 'specification_2', 'specification_3',
            'specification_4', 'specification_5',
            'main_image', 'image',
            'is_active', 'is_trending', 'is_featured', 'is_bestseller', 'is_new_arrival',
            'warranty_period', 'warranty_type',
            'country_of_origin', 'hs_code',
            'meta_title', 'meta_description', 'search_keywords'
        ]
        extra_kwargs = {
            'title': {'required': False},
            'slug': {'required': False},
            'sku': {'required': False},
        }
    
    def validate(self, data):
        """Custom validation for product update data"""
        # Validate discount percentage if provided
        discount_percentage = data.get('discount_percentage')
        if discount_percentage is not None and (discount_percentage < 0 or discount_percentage > 100):
            raise serializers.ValidationError({
                'discount_percentage': 'Discount percentage must be between 0 and 100.'
            })
        
        # Validate price fields if provided
        price = data.get('price')
        compare_at_price = data.get('compare_at_price')
        cost_price = data.get('cost_price')
        
        if price is not None and price < 0:
            raise serializers.ValidationError({
                'price': 'Price cannot be negative.'
            })
        
        if compare_at_price is not None and price is not None and compare_at_price < price:
            raise serializers.ValidationError({
                'compare_at_price': 'Compare at price cannot be less than current price.'
            })
        
        if cost_price is not None and price is not None and cost_price > price:
            raise serializers.ValidationError({
                'cost_price': 'Cost price cannot be greater than selling price.'
            })
        
        return data
    
class CartItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(queryset=Product.objects.all(), write_only=True, source='product')
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = CartItem
        fields = ['id', 'cart', 'product', 'product_id', 'quantity', 'subtotal', 'created_at', 'updated_at']
        read_only_fields = ['cart']


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = Cart
        fields = ['id', 'user', 'items', 'total', 'created_at', 'updated_at']
        read_only_fields = ['user']


class WishListSerializer(serializers.ModelSerializer):
    products = ProductSerializer(many=True, read_only=True)
    product_ids = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Product.objects.all(),
        write_only=True,
        source='products'
    )

    class Meta:
        model = WishList
        fields = ['id', 'user', 'products', 'product_ids', 'created_at', 'updated_at']
        read_only_fields = ['user']


class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = ['id', 'label', 'line1', 'line2', 'city', 'state', 'postal_code', 'country', 'phone', 'is_default', 'created_at']


class CardSerializer(serializers.ModelSerializer):
    class Meta:
        model = Card
        fields = ['id', 'cardholder_name', 'brand', 'last4', 'exp_month', 'exp_year', 'is_default', 'created_at']


class RecentlyViewedSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(queryset=Product.objects.all(), source='product', write_only=True)

    class Meta:
        model = RecentlyViewed
        fields = ['id', 'product', 'product_id', 'viewed_at']


class OrderItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'quantity', 'price', 'subtotal', 'created_at']
        read_only_fields = ['price']


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Order
        fields = ['id', 'user', 'items', 'total_amount', 'shipping_address', 'status', 'status_display', 'created_at', 'updated_at']
        read_only_fields = ['user', 'total_amount']


class BannerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Banner
        fields = ['id', 'title', 'subtitle', 'image', 'url', 'is_active', 'created_at', 'updated_at']