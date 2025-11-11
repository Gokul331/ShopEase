from django.urls import path, include
from rest_framework import routers
from . import views
from rest_framework_simplejwt.views import TokenRefreshView

router = routers.DefaultRouter()
router.register(r'users', views.UserViewSet)
router.register(r'categories', views.CategoryViewSet)
router.register(r'products', views.ProductViewSet)
router.register(r'profile', views.UserProfileViewSet, basename='profile')
router.register(r'cart', views.CartViewSet, basename='cart')
router.register(r'cart-items', views.CartItemViewSet, basename='cart-items')
router.register(r'wishlist', views.WishListViewSet, basename='wishlist')
router.register(r'addresses', views.AddressViewSet, basename='addresses')
router.register(r'cards', views.CardViewSet, basename='cards')
router.register(r'recently-viewed', views.RecentlyViewedViewSet, basename='recently-viewed')
router.register(r'orders', views.OrderViewSet, basename='orders')
router.register(r'order-items', views.OrderItemViewSet, basename='order-items')
router.register(r'banners', views.BannerViewSet, basename='banners')

urlpatterns = [
    path('', include(router.urls)),
    path('api-auth/', include('rest_framework.urls')),
    # JWT token obtain handled with custom serializer/view
    path('token/', views.CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    # Use built-in TokenRefreshView
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    # Logout/blacklist refresh token
    path('logout/', views.LogoutView.as_view(), name='token_logout'),
]