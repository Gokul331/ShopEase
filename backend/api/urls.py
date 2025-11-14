from django.urls import path, include
from rest_framework import routers
from . import views
from rest_framework_simplejwt.views import TokenRefreshView

router = routers.DefaultRouter()
# User management
router.register(r'users', views.UserViewSet)

# Product catalog
router.register(r'categories', views.CategoryViewSet)
router.register(r'products', views.ProductViewSet)
router.register(r'brands', views.BrandViewSet, basename='brands')
router.register(r'product-images', views.ProductImageViewSet, basename='product-images')
router.register(r'product-specifications', views.ProductSpecificationViewSet, basename='product-specifications')
router.register(r'product-variants', views.ProductVariantViewSet, basename='product-variants')

# User profile and related data
router.register(r'profile', views.UserProfileViewSet, basename='profile')
router.register(r'addresses', views.AddressViewSet, basename='addresses')
router.register(r'cards', views.CardViewSet, basename='cards')
router.register(r'recently-viewed', views.RecentlyViewedViewSet, basename='recently-viewed')

# Shopping features
router.register(r'cart', views.CartViewSet, basename='cart')
router.register(r'cart-items', views.CartItemViewSet, basename='cart-items')
router.register(r'wishlist', views.WishListViewSet, basename='wishlist')

# Orders
router.register(r'orders', views.OrderViewSet, basename='orders')
router.register(r'order-items', views.OrderItemViewSet, basename='order-items')

# Marketing
router.register(r'banners', views.BannerViewSet, basename='banners')

urlpatterns = [
    path('', include(router.urls)),
    path('api-auth/', include('rest_framework.urls')),
    
    # Authentication endpoints
    path('token/', views.CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('logout/', views.LogoutView.as_view(), name='token_logout'),
    
    # Custom user endpoints
    path('user/me/', views.UserViewSet.as_view({'get': 'me'}), name='user-me'),
    
    # Wishlist custom actions
    path('wishlist/add-product/', views.WishListViewSet.as_view({'post': 'add_product_current'}), name='wishlist-add-product-current'),
    path('wishlist/remove-product/', views.WishListViewSet.as_view({'post': 'remove_product_current'}), name='wishlist-remove-product-current'),
    
    # Product related nested endpoints
    path('products/<int:pk>/images/', views.ProductImageListView.as_view(), name='product-images-list'),
    path('products/<int:pk>/specifications/', views.ProductSpecificationListView.as_view(), name='product-specifications-list'),
    path('products/<int:pk>/variants/', views.ProductVariantListView.as_view(), name='product-variants-list'),
    
    # Category and brand specific endpoints
    path('categories/<int:pk>/products/', views.CategoryProductListView.as_view(), name='category-products'),
    path('brands/<int:pk>/products/', views.BrandProductListView.as_view(), name='brand-products'),
    
    # User specific endpoints
    path('user/orders/', views.UserOrderListView.as_view(), name='user-orders'),
    path('user/wishlist/', views.UserWishListView.as_view(), name='user-wishlist'),
    path('user/cart/', views.UserCartView.as_view(), name='user-cart'),
]