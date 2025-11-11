from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth.models import User
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import status
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import UserSerializer, ProductSerializer, CategorySerializer
from .models import (
    UserProfile, Category, Product, Cart, CartItem,
    WishList, Order, OrderItem, Banner
)
from .serializers import (
    UserProfileSerializer, CategorySerializer, ProductSerializer,
    CartSerializer, CartItemSerializer, WishListSerializer,
    OrderSerializer, OrderItemSerializer, BannerSerializer
)
from .serializers import AddressSerializer, CardSerializer
from .models import Address, Card
from .models import RecentlyViewed
from .serializers import RecentlyViewedSerializer

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['username'] = user.username
        token['email'] = user.email
        return token

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    # Default: require authentication; we'll allow unauthenticated create (registration)
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        # Allow anyone to register (POST /users/)
        if self.action == 'create':
            return [permissions.AllowAny()]
        # Allow authenticated users to access 'me' action
        if self.action == 'me':
            return [permissions.IsAuthenticated()]
        # For all other actions, require authentication
        return [permissions.IsAuthenticated()]

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def me(self, request):
        """Return current logged-in user's data at /users/me/"""
        # Return the richer UserProfile representation so frontend gets phone,
        # addresses, cards and recently_viewed in one call.
        try:
            profile = request.user.userprofile
        except UserProfile.DoesNotExist:
            profile = UserProfile.objects.create(user=request.user)

        from .serializers import UserProfileSerializer

        serializer = UserProfileSerializer(profile, context={'request': request})
        return Response(serializer.data)


class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        """Logout by blacklisting the provided refresh token."""
        refresh_token = request.data.get('refresh')
        if not refresh_token:
            return Response({'detail': 'Refresh token required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            token = RefreshToken(refresh_token)
            # Blacklist the token
            token.blacklist()
            return Response({'detail': 'Logout successful.'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'detail': 'Invalid token.'}, status=status.HTTP_400_BAD_REQUEST)


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.select_related('category').all()
    serializer_class = ProductSerializer
    permission_classes = [permissions.AllowAny]

    def perform_create(self, serializer):
        serializer.save()


class UserProfileViewSet(viewsets.ModelViewSet):
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return UserProfile.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class AddressViewSet(viewsets.ModelViewSet):
    serializer_class = AddressSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        # If this is marked default, unset other defaults
        address = serializer.save(user=self.request.user)
        if address.is_default:
            Address.objects.filter(user=self.request.user).exclude(id=address.id).update(is_default=False)


class CardViewSet(viewsets.ModelViewSet):
    serializer_class = CardSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Card.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        card = serializer.save(user=self.request.user)
        if card.is_default:
            Card.objects.filter(user=self.request.user).exclude(id=card.id).update(is_default=False)


class RecentlyViewedViewSet(viewsets.ModelViewSet):
    """Allow users to list and create their recently viewed entries.

    Frontend should POST {"product_id": <id>} when a user views a product.
    GET will return the user's recent products ordered by viewed_at.
    """
    serializer_class = RecentlyViewedSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return RecentlyViewed.objects.filter(user=self.request.user).select_related('product')

    def perform_create(self, serializer):
        # If an entry exists for this user/product, update its viewed_at timestamp.
        product = serializer.validated_data.get('product')
        rv, created = RecentlyViewed.objects.get_or_create(user=self.request.user, product=product)
        if not created:
            # touch the timestamp
            rv.save()
        # Return the object so the serializer can use it
        return rv


class CartViewSet(viewsets.ModelViewSet):
    serializer_class = CartSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Cart.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class CartItemViewSet(viewsets.ModelViewSet):
    serializer_class = CartItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return CartItem.objects.filter(cart__user=self.request.user)

    def perform_create(self, serializer):
        cart, _ = Cart.objects.get_or_create(user=self.request.user)
        serializer.save(cart=cart)


class WishListViewSet(viewsets.ModelViewSet):
    serializer_class = WishListSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return WishList.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'])
    def add_product(self, request, pk=None):
        wishlist = self.get_object()
        product_id = request.data.get('product_id')
        try:
            product = Product.objects.get(id=product_id)
            wishlist.products.add(product)
            return Response({'status': 'Product added to wishlist'})
        except Product.DoesNotExist:
            return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['post'])
    def remove_product(self, request, pk=None):
        wishlist = self.get_object()
        product_id = request.data.get('product_id')
        try:
            product = Product.objects.get(id=product_id)
            wishlist.products.remove(product)
            return Response({'status': 'Product removed from wishlist'})
        except Product.DoesNotExist:
            return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)

    # Collection-level helpers: allow adding/removing product for the current user's wishlist
    @action(detail=False, methods=['post'])
    def add_product_current(self, request):
        wishlist, _ = WishList.objects.get_or_create(user=request.user)
        product_id = request.data.get('product_id')
        try:
            product = Product.objects.get(id=product_id)
            wishlist.products.add(product)
            serializer = self.get_serializer(wishlist)
            return Response(serializer.data)
        except Product.DoesNotExist:
            return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['post'])
    def remove_product_current(self, request):
        wishlist, _ = WishList.objects.get_or_create(user=request.user)
        product_id = request.data.get('product_id')
        try:
            product = Product.objects.get(id=product_id)
            wishlist.products.remove(product)
            serializer = self.get_serializer(wishlist)
            return Response(serializer.data)
        except Product.DoesNotExist:
            return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)


class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        # Ensure a cart exists for the user; if none, create an empty one.
        cart, _ = Cart.objects.get_or_create(user=self.request.user)
        # Use 0.00 if cart has no items
        total_amount = cart.total if hasattr(cart, 'items') else 0

        order = serializer.save(
            user=self.request.user,
            total_amount=total_amount
        )

        # Create order items from cart items (if any)
        for cart_item in cart.items.all():
            OrderItem.objects.create(
                order=order,
                product=cart_item.product,
                quantity=cart_item.quantity,
                price=cart_item.product.price
            )

        # Clear the cart
        cart.items.all().delete()

        return order


class OrderItemViewSet(viewsets.ModelViewSet):
    serializer_class = OrderItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return OrderItem.objects.filter(order__user=self.request.user)


class BannerViewSet(viewsets.ModelViewSet):
    queryset = Banner.objects.filter(is_active=True)
    serializer_class = BannerSerializer
    permission_classes = [permissions.AllowAny]