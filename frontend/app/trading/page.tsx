"use client";

import { useState } from 'react';

export default function TradingPage() {
  const [symbol, setSymbol] = useState('');
  const [side, setSide] = useState<'BUY' | 'SELL'>('BUY');
  const [orderType, setOrderType] = useState<'LIMIT' | 'MARKET'>('LIMIT');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setIsLoading(true);

    if (!symbol || !quantity || (orderType === 'LIMIT' && !price)) {
      setMessage({ type: 'error', text: '请填写所有必填字段' });
      setIsLoading(false);
      return;
    }

    const qtyNum = parseInt(quantity, 10);
    const priceNum = orderType === 'LIMIT' ? parseFloat(price) : null;

    const payload = {
      symbol,
      side,
      type: orderType,
      price: priceNum,
      quantity: qtyNum,
    };

    try {
      // Make the actual API call to the backend
      const response = await fetch('/api/orders/place', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        setMessage({ type: 'success', text: `委托提交成功！订单号: ${data.orderId || data.id}` });
        // Optionally reset form fields here
        setQuantity('');
        if (orderType === 'LIMIT') setPrice('');
      } else {
        const errorData = await response.json();
        // Handle specific errors (e.g., price limits, max orders)
        setMessage({ type: 'error', text: errorData.message || errorData.error || '提交失败，请检查输入或稍后重试' });
      }
    } catch (error) {
      console.warn('Backend not running, using mock response', error);
      // Mock API responses if the real backend is not running
      setTimeout(() => {
        if (qtyNum > 3000) {
          setMessage({ type: 'error', text: '提交失败：超过最大订单数量限制 (Max 3000)' });
        } else if (orderType === 'LIMIT' && priceNum && priceNum > 1000) {
          setMessage({ type: 'error', text: '提交失败：价格偏离过大，超过 24 个价位' });
        } else {
          setMessage({ type: 'success', text: `[Mock] 委托提交成功！订单号: MOCK-${Math.floor(Math.random() * 100000)}` });
          setQuantity('');
          if (orderType === 'LIMIT') setPrice('');
        }
        setIsLoading(false);
      }, 600);
      return;
    }

    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">交易大厅 (Trading)</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧：委托表单 */}
        <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold mb-4 border-b pb-2">提交委托</h3>
          
          {message && (
            <div className={`p-3 mb-4 rounded-md text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {message.text}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">股票代码</label>
              <input 
                type="text" 
                placeholder="例如: 00700" 
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-primary" 
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <button 
                type="button" 
                onClick={() => setSide('BUY')}
                className={`py-2 rounded-md font-medium transition border ${
                  side === 'BUY' 
                    ? 'bg-red-600 text-white border-red-600' 
                    : 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                }`}
              >
                买入 (BUY)
              </button>
              <button 
                type="button" 
                onClick={() => setSide('SELL')}
                className={`py-2 rounded-md font-medium transition border ${
                  side === 'SELL' 
                    ? 'bg-green-600 text-white border-green-600' 
                    : 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100'
                }`}
              >
                卖出 (SELL)
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">订单类型</label>
              <select 
                value={orderType}
                onChange={(e) => setOrderType(e.target.value as 'LIMIT' | 'MARKET')}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="LIMIT">限价盘 (Limit Order)</option>
                <option value="MARKET">市价盘 (Market Order)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">价格 (HKD)</label>
              <input 
                type="number" 
                step="0.01" 
                placeholder={orderType === 'MARKET' ? '市价无需输入价格' : '输入价格'} 
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                disabled={orderType === 'MARKET'}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-primary disabled:bg-gray-100 disabled:text-gray-400" 
                required={orderType === 'LIMIT'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">数量 (股)</label>
              <input 
                type="number" 
                placeholder="必须为每手股数的整数倍" 
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-primary" 
                required
              />
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full py-3 bg-primary text-white font-bold rounded-md hover:bg-blue-700 transition mt-4 disabled:bg-blue-300 disabled:cursor-not-allowed"
            >
              {isLoading ? '提交中...' : '提交订单'}
            </button>
          </form>
        </div>

        {/* 右侧：行情简览 & 挂单信息 */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold mb-4 border-b pb-2">实时行情概览</h3>
            <div className="text-center text-gray-500 py-10">
              请先输入股票代码以查看实时行情
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold mb-4 border-b pb-2">当前挂单 (轮候指示)</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="px-4 py-2">时间</th>
                    <th className="px-4 py-2">代码</th>
                    <th className="px-4 py-2">方向</th>
                    <th className="px-4 py-2">价格</th>
                    <th className="px-4 py-2">数量</th>
                    <th className="px-4 py-2">状态</th>
                    <th className="px-4 py-2">操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={7} className="text-center text-gray-500 py-6">暂无挂单</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}