from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils.text import slugify
from decimal import Decimal

class UserProfile(models.Model):
	user = models.OneToOneField(User, on_delete=models.CASCADE)
	phone = models.CharField(max_length=15, blank=True)
	address = models.TextField(blank=True)
	created_at = models.DateTimeField(auto_now_add=True)

	def __str__(self):
		return self.user.username


class Category(models.Model):
    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True)
    description = models.TextField(blank=True)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='children')
    image = models.ImageField(upload_to='categories/', blank=True, null=True)
    is_active = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)  
    class Meta:
        verbose_name_plural = "Categories"
        ordering = ['name']
    
    def __str__(self):
        return self.name

class Brand(models.Model):
    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True)
    description = models.TextField(blank=True)
    logo = models.ImageField(upload_to='brands/', blank=True, null=True)
    website = models.URLField(blank=True)
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return self.name

class Product(models.Model):
    # ===== BASIC PRODUCT IDENTIFICATION =====
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True)
    sku = models.CharField(max_length=100, unique=True, blank=True, null=True)
    upc = models.CharField(max_length=20, blank=True, null=True)
    model_number = models.CharField(max_length=100, blank=True, null=True)
    
    # ===== BASIC PRODUCT INFO =====
    brand = models.ForeignKey(Brand, on_delete=models.SET_NULL, null=True, blank=True, related_name='products')
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name='products')
    description = models.TextField(blank=True)
    short_description = models.TextField(max_length=500, blank=True)
    
    # ===== PRICING & INVENTORY =====
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00, validators=[MinValueValidator(0)])
    compare_at_price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True, validators=[MinValueValidator(0)])
    cost_price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True, validators=[MinValueValidator(0)])
    discount_percentage = models.IntegerField(default=0, validators=[MinValueValidator(0), MaxValueValidator(100)])
    
    stock = models.PositiveIntegerField(default=0)
    low_stock_threshold = models.PositiveIntegerField(default=10)
    manage_stock = models.BooleanField(default=True)
    allow_backorders = models.BooleanField(default=False)
    backorder_limit = models.PositiveIntegerField(default=0)
    
    # ===== PHYSICAL SPECIFICATIONS =====
    weight = models.DecimalField(max_digits=8, decimal_places=3, blank=True, null=True, validators=[MinValueValidator(0)])  # in kg
    weight_unit = models.CharField(max_length=10, default='kg', choices=[('kg', 'Kilograms'), ('g', 'Grams'), ('lb', 'Pounds')])
    
    length = models.DecimalField(max_digits=8, decimal_places=2, blank=True, null=True, validators=[MinValueValidator(0)])
    width = models.DecimalField(max_digits=8, decimal_places=2, blank=True, null=True, validators=[MinValueValidator(0)])
    height = models.DecimalField(max_digits=8, decimal_places=2, blank=True, null=True, validators=[MinValueValidator(0)])
    dimensions_unit = models.CharField(max_length=10, default='cm', choices=[('cm', 'Centimeters'), ('m', 'Meters'), ('in', 'Inches')])
    
    # ===== PRODUCT ATTRIBUTES =====
    color = models.CharField(max_length=100, blank=True)
    material = models.CharField(max_length=255, blank=True)
    size = models.CharField(max_length=100, blank=True)
    style = models.CharField(max_length=100, blank=True)
    
    # ===== TECHNICAL SPECIFICATIONS (Generic fields that can be used across categories) =====
    specification_1 = models.CharField(max_length=255, blank=True)
    specification_2 = models.CharField(max_length=255, blank=True)
    specification_3 = models.CharField(max_length=255, blank=True)
    specification_4 = models.CharField(max_length=255, blank=True)
    specification_5 = models.CharField(max_length=255, blank=True)
    
    # ===== DIGITAL ASSETS =====
    main_image = models.ImageField(upload_to='products/main/', blank=True, null=True)
    image = models.ImageField(upload_to='products/', blank=True, null=True)  # Keeping for backward compatibility
    
    # ===== PRODUCT STATUS & FLAGS =====
    is_active = models.BooleanField(default=True)
    is_trending = models.BooleanField(default=False)
    is_featured = models.BooleanField(default=False)
    is_bestseller = models.BooleanField(default=False)
    is_new_arrival = models.BooleanField(default=True)
    
    # ===== WARRANTY & SUPPORT =====
    warranty_period = models.CharField(max_length=100, blank=True)  # "2 years", "Lifetime", etc.
    warranty_type = models.CharField(max_length=100, blank=True)
    
    # ===== COMPLIANCE & ORIGIN =====
    country_of_origin = models.CharField(max_length=100, blank=True)
    hs_code = models.CharField(max_length=20, blank=True)  # Harmonized System code
    
    # ===== SEO & META INFORMATION =====
    meta_title = models.CharField(max_length=255, blank=True)
    meta_description = models.TextField(blank=True)
    search_keywords = models.TextField(blank=True)
    
    # ===== AUDIT FIELDS =====
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    published_at = models.DateTimeField(blank=True, null=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['sku']),
            models.Index(fields=['slug']),
            models.Index(fields=['category']),
            models.Index(fields=['brand']),
            models.Index(fields=['is_active']),
            models.Index(fields=['price']),
        ]
    
    def __str__(self):
        return self.title
    
    def save(self, *args, **kwargs):
        # Auto-generate slug if not provided
        if not self.slug:
            self.slug = slugify(self.title)
        
        # Auto-generate SKU if not provided
        if not self.sku:
            base_sku = slugify(self.title).upper().replace('-', '')[:8]
            self.sku = f"{base_sku}{self.id if self.id else ''}"
        
        # Auto-set compare_at_price if not provided and there's a discount
        if not self.compare_at_price and self.discount_percentage > 0:
            self.compare_at_price = self.price
        
        # Calculate sale price based on discount percentage
        if self.discount_percentage > 0 and self.compare_at_price:
            discount_amount = (self.compare_at_price * Decimal(self.discount_percentage / 100))
            self.price = self.compare_at_price - discount_amount
        elif not self.compare_at_price:
            self.compare_at_price = self.price
        
        super().save(*args, **kwargs)
    
    @property
    def sale_price(self):
        """Calculate the final sale price after discount"""
        if self.discount_percentage > 0:
            discount_amount = (self.price * Decimal(self.discount_percentage / 100))
            return self.price - discount_amount
        return self.price
    
    @property
    def discount_amount(self):
        """Calculate the discount amount in currency"""
        if self.discount_percentage > 0:
            return self.price * Decimal(self.discount_percentage / 100)
        return Decimal('0.00')
    
    @property
    def in_stock(self):
        """Check if product is in stock"""
        if not self.manage_stock:
            return True
        return self.stock > 0
    
    @property
    def low_stock(self):
        """Check if product is low in stock"""
        if not self.manage_stock:
            return False
        return 0 < self.stock <= self.low_stock_threshold
    
    @property
    def stock_status(self):
        """Get human-readable stock status"""
        if not self.manage_stock:
            return "In Stock"
        if self.stock == 0:
            return "Out of Stock"
        if self.low_stock:
            return "Low Stock"
        return "In Stock"
    
    @property
    def dimensions(self):
        """Get formatted dimensions string"""
        if all([self.length, self.width, self.height]):
            return f"{self.length}×{self.width}×{self.height} {self.dimensions_unit}"
        return ""

class ProductImage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='products/gallery/')
    alt_text = models.CharField(max_length=255, blank=True)
    is_primary = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)
    
    class Meta:
        ordering = ['order', 'id']
    
    def __str__(self):
        return f"Image for {self.product.title}"

class ProductSpecification(models.Model):
    """Flexible specification system for detailed product attributes"""
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='specifications')
    name = models.CharField(max_length=255)
    value = models.CharField(max_length=500)
    group = models.CharField(max_length=100, blank=True)  # "Technical", "Physical", "Features", etc.
    order = models.PositiveIntegerField(default=0)
    
    class Meta:
        ordering = ['group', 'order', 'name']
    
    def __str__(self):
        return f"{self.name}: {self.value}"

class ProductVariant(models.Model):
    """For products with variations like color, size, etc."""
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='variants')
    sku = models.CharField(max_length=100, unique=True)
    variant_name = models.CharField(max_length=255)  # "Red, Large", "Blue, Medium", etc.
    
    # Variant-specific attributes
    price_modifier = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    stock = models.PositiveIntegerField(default=0)
    weight_modifier = models.DecimalField(max_digits=8, decimal_places=3, default=0.000)
    
    # Visual identifiers
    color = models.CharField(max_length=50, blank=True)
    size = models.CharField(max_length=50, blank=True)
    image = models.ImageField(upload_to='products/variants/', blank=True, null=True)
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['variant_name']
    
    def __str__(self):
        return f"{self.product.title} - {self.variant_name}"
    
    @property
    def final_price(self):
        return self.product.price + self.price_modifier
    
    @property
    def final_weight(self):
        base_weight = self.product.weight or Decimal('0.000')
        return base_weight + self.weight_modifier

class Banner(models.Model):
	title = models.CharField(max_length=200)
	subtitle = models.CharField(max_length=300, blank=True)
	image = models.ImageField(upload_to='banners/')
	url = models.CharField(max_length=200)
	is_active = models.BooleanField(default=True)
	display_order = models.IntegerField(default=0)
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	class Meta:
		ordering = ['display_order', '-created_at']

	def __str__(self):
		return self.title


class Cart(models.Model):
	user = models.OneToOneField(User, on_delete=models.CASCADE)
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	def __str__(self):
		return f"Cart - {self.user.username}"

	@property
	def total(self):
		return sum(item.subtotal for item in self.items.all())


class CartItem(models.Model):
	cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
	product = models.ForeignKey(Product, on_delete=models.CASCADE)
	quantity = models.PositiveIntegerField(default=1)
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	@property
	def subtotal(self):
		return self.product.price * self.quantity

	def __str__(self):
		return f"{self.quantity} x {self.product.title}"


class WishList(models.Model):
	user = models.OneToOneField(User, on_delete=models.CASCADE)
	products = models.ManyToManyField(Product)
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	def __str__(self):
		return f"Wishlist - {self.user.username}"


class Order(models.Model):
	STATUS_CHOICES = [
		('pending', 'Pending'),
		('processing', 'Processing'),
		('shipped', 'Shipped'),
		('delivered', 'Delivered'),
		('cancelled', 'Cancelled')
	]

	user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders')
	total_amount = models.DecimalField(max_digits=10, decimal_places=2)
	shipping_address = models.TextField()
	status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	def __str__(self):
		return f"Order #{self.id} - {self.user.username}"


class OrderItem(models.Model):
	order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
	product = models.ForeignKey(Product, on_delete=models.CASCADE)
	quantity = models.PositiveIntegerField()
	price = models.DecimalField(max_digits=10, decimal_places=2)  # Price at time of purchase
	created_at = models.DateTimeField(auto_now_add=True)

	@property
	def subtotal(self):
		return self.price * self.quantity

	def __str__(self):
		return f"{self.quantity} x {self.product.title} in Order #{self.order.id}"


class Address(models.Model):
	user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='addresses')
	label = models.CharField(max_length=60, blank=True)  # e.g., Home, Work
	line1 = models.CharField(max_length=255)
	line2 = models.CharField(max_length=255, blank=True)
	city = models.CharField(max_length=100)
	state = models.CharField(max_length=100, blank=True)
	postal_code = models.CharField(max_length=20, blank=True)
	country = models.CharField(max_length=100)
	phone = models.CharField(max_length=20, blank=True)
	is_default = models.BooleanField(default=False)
	created_at = models.DateTimeField(auto_now_add=True)

	def __str__(self):
		return f"{self.user.username} - {self.label or self.line1}"


class Card(models.Model):
	user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='cards')
	cardholder_name = models.CharField(max_length=100)
	brand = models.CharField(max_length=50, blank=True)
	last4 = models.CharField(max_length=4, blank=True)
	exp_month = models.IntegerField(null=True, blank=True)
	exp_year = models.IntegerField(null=True, blank=True)
	token = models.CharField(max_length=255, blank=True)  # token from payment provider
	is_default = models.BooleanField(default=False)
	created_at = models.DateTimeField(auto_now_add=True)

	def __str__(self):
		return f"{self.user.username} - **** **** **** {self.last4 or 'xxxx'}"


class RecentlyViewed(models.Model):
	"""Tracks recently viewed products per user.

	We keep one record per (user, product) and update viewed_at each time the
	product is viewed so clients can fetch the most recent items.
	"""
	user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='recently_viewed')
	product = models.ForeignKey(Product, on_delete=models.CASCADE)
	viewed_at = models.DateTimeField(auto_now=True)

	class Meta:
		ordering = ['-viewed_at']
		unique_together = ('user', 'product')

	def __str__(self):
		return f"{self.user.username} viewed {self.product.title} @ {self.viewed_at.isoformat()}"
