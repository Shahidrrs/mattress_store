import React, { useContext } from "react";
import { CartContext } from "../context/CartContext";
import { Link } from "react-router-dom";

export default function Cart() {
  const { cart, total, removeFromCart } = useContext(CartContext);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Your Cart</h1>

      {cart.length === 0 ? (
        <p>
          Your cart is empty. <Link to="/shop">Shop now</Link>
        </p>
      ) : (
        <div>
          <ul className="space-y-4">
            {cart.map((item, idx) => (
              <li
                key={idx}
                className="bg-white p-4 rounded shadow flex justify-between"
              >
                <div>
                  <div className="font-semibold">
                    {item.title}{" "}
                    <span className="text-sm text-gray-500">
                      ({item.size || "Default"})
                    </span>
                  </div>
                  <div>Qty: {item.quantity}</div>
                </div>
                <div>
                  <div className="font-bold">
                    ₹{item.price * item.quantity}
                  </div>
                  <button
                    className="text-red-500 text-sm mt-2"
                    onClick={() => removeFromCart(item.productId)}
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-6">
            <div className="text-xl font-semibold">Total: ₹{total}</div>
            <Link
              to="/checkout"
              className="inline-block mt-3 bg-blue-600 text-white px-4 py-2 rounded"
            >
              Proceed to Checkout
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
