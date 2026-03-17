import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api';
import AuthContext from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const { user, authTokens } = useContext(AuthContext);
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(false);

    // Initial load from LocalStorage for guests
    useEffect(() => {
        if (!user) {
            const savedCart = localStorage.getItem('cartItems');
            if (savedCart) {
                try {
                    setCartItems(JSON.parse(savedCart));
                } catch (e) {
                    console.error("Failed to parse cart from local storage", e);
                    localStorage.removeItem('cartItems');
                }
            } else {
                setCartItems([]);
            }
        }
    }, [user]);

    // Sync with LocalStorage for guests
    useEffect(() => {
        if (!user) {
            localStorage.setItem('cartItems', JSON.stringify(cartItems));
        }
    }, [cartItems, user]);

    // Fetch cart from API when user logs in and Merge Local Cart
    useEffect(() => {
        if (user && authTokens) {
            const syncCart = async () => {
                setLoading(true);
                const localCart = JSON.parse(localStorage.getItem('cartItems') || '[]');

                if (localCart.length > 0) {
                    // Merge local items to server
                    // We use Promise.all to do it in parallel for speed, 
                    // though sequential might be safer for stock checks, parallel is fine for simple add.
                    try {
                        await Promise.all(localCart.map(item =>
                            api.post('cart/', {
                                product_id: item.id,
                                quantity: item.quantity
                            }).catch(err => console.warn(`Failed to merge item ${item.name}`, err))
                        ));
                        // Clear local storage after successful merge attempt
                        localStorage.removeItem('cartItems');
                    } catch (error) {
                        console.error("Error merging cart:", error);
                    }
                }

                // Always fetch the latest server state
                fetchCart();
            };

            syncCart();
        } else if (!user) {
            // User logged out, cartItems should already be handling local storage logic via the first useEffect
            // But we might need to reset cartItems if switching from user -> guest immediately?
            // The first useEffect runs on !user, but state might still have server items.
            // When user becomes null, we should probably clear cartItems to avoid showing previous user's cart
            // unless we want to persist it? 
            // Standard behavior: Logout -> Empty cart or Load Guest Cart.
            // Since we use localStorage for guest, we should load from there.
            const savedCart = localStorage.getItem('cartItems');
            setCartItems(savedCart ? JSON.parse(savedCart) : []);
        }
    }, [user, authTokens]);

    const fetchCart = async () => {
        try {
            // setLoading(true); // Don't flicker loading too much
            const response = await api.get('cart/');
            // Transform Backend CartItem (nested product) to Frontend structure
            const items = response.data.map(item => ({
                ...item.product,
                quantity: item.quantity,
                cart_item_id: item.id,
                // Ensure we keep product_id accessible as 'id' for consistency with guest cart which uses product.id as id
                id: item.product.id
            }));
            setCartItems(items);
        } catch (error) {
            console.error("Failed to fetch cart", error);
        } finally {
            setLoading(false);
        }
    };

    const addToCart = async (product, quantity = 1) => {
        if (user) {
            try {
                // Optimistic UI Update (optional, but good for UX)
                // But simplified: just call API then refresh
                await api.post('cart/', {
                    product_id: product.id,
                    quantity: quantity
                });
                fetchCart();
            } catch (error) {
                console.error("Failed to add to cart", error);
                alert(error.response?.data?.error || "Could not add item to cart.");
            }
        } else {
            // Guest Logic
            setCartItems(prevItems => {
                const existingItem = prevItems.find(item => item.id === product.id);
                if (existingItem) {
                    return prevItems.map(item =>
                        item.id === product.id
                            ? { ...item, quantity: item.quantity + quantity }
                            : item
                    );
                }
                return [...prevItems, { ...product, quantity }];
            });
        }
    };

    const removeFromCart = async (productId) => {
        if (user) {
            try {
                const item = cartItems.find(item => item.id === productId);
                if (item && item.cart_item_id) {
                    await api.delete(`cart/${item.cart_item_id}/`);
                    fetchCart();
                } else {
                    // Fallback if we don't have cart_item_id locally for some reason
                    fetchCart();
                }
            } catch (error) {
                console.error("Failed to remove item", error);
            }
        } else {
            setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
        }
    };

    const updateQuantity = async (productId, quantity) => {
        if (quantity < 1) return;

        if (user) {
            try {
                const item = cartItems.find(item => item.id === productId);
                if (item && item.cart_item_id) {
                    // Optimistic update
                    setCartItems(prevItems => prevItems.map(item =>
                        item.id === productId ? { ...item, quantity } : item
                    ));

                    await api.patch(`cart/${item.cart_item_id}/`, {
                        quantity: quantity
                    });
                    // No need to fetchCart() every time if patch success, unless we need subtotal recalcs from server
                }
            } catch (error) {
                console.error("Failed to update quantity", error);
                fetchCart(); // Revert on error
            }
        } else {
            setCartItems(prevItems => prevItems.map(item =>
                item.id === productId ? { ...item, quantity } : item
            ));
        }
    };

    const clearCart = async () => {
        if (user) {
            // For now, we clear local state.
            // Backend clear happens on checkout success, but if explicit clear needed:
            // We'd need an endpoint. For now, we assume this is called on Checkout Success
            setCartItems([]);
            // Also refresh from server to be sure
            fetchCart();
        } else {
            setCartItems([]);
            localStorage.removeItem('cartItems');
        }
    };

    const getCartTotal = () => {
        return cartItems.reduce((total, item) => {
            // Handle both structure types if mixed (shouldn't be with correct logic)
            // Backend item logic uses discounted_price from product
            // Guest item uses product properties directly
            const price = item.discounted_price || item.price || 0;
            return total + (price * item.quantity);
        }, 0);
    };

    const getCartCount = () => {
        return cartItems.reduce((count, item) => count + item.quantity, 0);
    };

    return (
        <CartContext.Provider value={{
            cartItems,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            getCartTotal,
            getCartCount,
            loading
        }}>
            {children}
        </CartContext.Provider>
    );
};

export default CartContext;
