import React, { useEffect, useState } from 'react';
import { Package, Truck, Wrench, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';

interface OrderItem {
  name?: string;
  quantity?: number;
  price?: number;
}

interface Order {
  id: string;
  client_id: string;
  status: string;
  subtotal?: number;
  shipping_fee?: number;
  installation_fee?: number;
  cart_payload?: OrderItem[] | { items?: OrderItem[] };
  created_at?: string;
  updated_at?: string;
}

const formatNaira = (value?: number) =>
  typeof value === 'number'
    ? new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(value)
    : '—';

const getStatusBadge = (status: string) => {
  const normalized = status?.toLowerCase();
  const styles: Record<string, string> = {
    pending: 'bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400',
    processing: 'bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400',
    shipped: 'bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400',
    installed: 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
    completed: 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
    cancelled: 'bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400',
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${styles[normalized] || 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
      {status || 'Unknown'}
    </span>
  );
};

const Orders: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user?.id) return;
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('client_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setOrders(data as any);
      }
      setLoading(false);
    };

    fetchOrders();
  }, [user?.id]);

  const getItems = (order: Order): OrderItem[] => {
    if (Array.isArray(order.cart_payload)) return order.cart_payload;
    if (order.cart_payload?.items) return order.cart_payload.items;
    return [];
  };

  const getTotal = (order: Order) =>
    (order.subtotal || 0) + (order.shipping_fee || 0) + (order.installation_fee || 0);

  return (
    <div className="space-y-6 font-sans animate-fade-in">
      <div>
        <h2 className="text-2xl font-display font-extrabold text-slate-900 dark:text-white">My Orders</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Track equipment purchases, shipping, and installation status.
        </p>
      </div>

      {loading ? (
        <div className="text-sm text-slate-400 py-12 text-center">Loading order history...</div>
      ) : orders.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-850 rounded-2xl p-10 text-center">
          <Package className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <p className="text-sm text-slate-500 dark:text-slate-400">You haven't placed any orders yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const isExpanded = expandedId === order.id;
            const items = getItems(order);

            return (
              <div
                key={order.id}
                className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-850 rounded-2xl shadow-sm overflow-hidden"
              >
                <button
                  onClick={() => setExpandedId(isExpanded ? null : order.id)}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center border border-blue-500/10">
                      <Package className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-white">
                        Order #{order.id.slice(0, 8)}
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {order.created_at ? new Date(order.created_at).toLocaleDateString() : 'Date unknown'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                      <p className="text-sm font-bold text-slate-800 dark:text-white">{formatNaira(getTotal(order))}</p>
                    </div>
                    {getStatusBadge(order.status)}
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-5 pb-5 border-t border-slate-100 dark:border-slate-850 pt-4 space-y-4">
                    {/* Line items */}
                    {items.length > 0 && (
                      <div className="space-y-2">
                        {items.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span className="text-slate-600 dark:text-slate-300">
                              {item.name || 'Item'} {item.quantity ? `× ${item.quantity}` : ''}
                            </span>
                            <span className="font-medium text-slate-800 dark:text-white">{formatNaira(item.price)}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Fee breakdown */}
                    <div className="space-y-1.5 pt-3 border-t border-dashed border-slate-200 dark:border-slate-800 text-xs">
                      <div className="flex justify-between text-slate-500 dark:text-slate-400">
                        <span>Subtotal</span>
                        <span>{formatNaira(order.subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1"><Truck className="w-3.5 h-3.5" /> Shipping</span>
                        <span>{formatNaira(order.shipping_fee)}</span>
                      </div>
                      <div className="flex justify-between text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1"><Wrench className="w-3.5 h-3.5" /> Installation</span>
                        <span>{formatNaira(order.installation_fee)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-slate-800 dark:text-white pt-1.5 border-t border-slate-100 dark:border-slate-850">
                        <span>Total</span>
                        <span>{formatNaira(getTotal(order))}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Orders;
