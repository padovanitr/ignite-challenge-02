import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  id: number;
  amount: number;
}

interface ProductStorage {
  id: number;
  title: string;
  price: number;
  image: string;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ id, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem('@RocketShoes:cart')

    if (storagedCart) {
      console.log('encontrou no local storage')
      return JSON.parse(storagedCart);
    }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      // TODO
      const cartUptd = [...cart];
      console.log('cartUptd', cartUptd)
      const productExists = cartUptd.find(product => product.id === productId);

      const stock = await api.get(`/stock/${productId}`)
      const stockAmount = stock.data.amount;
      const currentAmount = productExists ? productExists.amount : 0;
      const amount = currentAmount + 1;

      if (amount > stockAmount) {
        toast.error('Quantidade solicitada fora de estoque');
        return;
      }

      if (productExists) {
        productExists.amount = amount
      } else {
        const product = await api.get(`/products/${productId}`)
        const newProduct = {
          ...product.data,
          amount: 1
        }

        cartUptd.push(newProduct)
      }

      setCart(cartUptd)
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(cartUptd))
    } catch {
      // TODO
      toast.error('Erro na alteração de quantidade do produto');
    }
  };

  const removeProduct = (productId: number) => {
    try {
      // TODO
    } catch {
      // TODO
    }
  };

  const updateProductAmount = async ({
    id,
    amount,
  }: UpdateProductAmount) => {
    try {
      // TODO
      const cartUptd = [...cart];
      const currentProduct = cartUptd.find(product => product.id === id);

      const stock = await api.get(`/stock/${id}`)
      const stockAmount = stock.data.amount;

      if (!currentProduct) return
      currentProduct.amount = amount

      if (currentProduct.amount > stockAmount) {
        toast.error('Quantidade solicitada fora de estoque');
        return;
      }

      if (currentProduct.amount < 1) {
        const newCart = cartUptd.filter(item => item.id !== currentProduct.id)
        
        setCart(newCart)
        localStorage.setItem('@RocketShoes:cart', JSON.stringify(newCart))
      } else {
        setCart(cartUptd)
        localStorage.setItem('@RocketShoes:cart', JSON.stringify(cartUptd))
      }

    } catch {
      // TODO
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
