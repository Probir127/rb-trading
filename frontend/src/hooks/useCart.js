import { useContext } from 'react';
import CartContext from '../context/CartContext';

/**
 * Custom hook to access cart context.
 * Usage: const { cartItems, addToCart, removeFromCart } = useCart();
 */
const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

export default useCart;
