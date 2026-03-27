export default function MarketPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">行情中心 (Market)</h2>

      {/* 市场概览 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex justify-between items-center">
          <div>
            <h3 className="text-gray-500 font-medium">恒生指数</h3>
            <p className="text-2xl font-bold text-red-500 mt-1">16,589.44</p>
          </div>
          <div className="text-right text-red-500">
            <p className="font-bold">+1.24%</p>
            <p className="text-sm">+203.12</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex justify-between items-center">
          <div>
            <h3 className="text-gray-500 font-medium">恒生科技指数</h3>
            <p className="text-2xl font-bold text-red-500 mt-1">3,482.11</p>
          </div>
          <div className="text-right text-red-500">
            <p className="font-bold">+2.15%</p>
            <p className="text-sm">+73.30</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex justify-between items-center">
          <div>
            <h3 className="text-gray-500 font-medium">国企指数</h3>
            <p className="text-2xl font-bold text-red-500 mt-1">5,712.83</p>
          </div>
          <div className="text-right text-red-500">
            <p className="font-bold">+1.56%</p>
            <p className="text-sm">+87.80</p>
          </div>
        </div>
      </div>

      {/* 白名单股票列表 */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-4 border-b pb-2">
          <h3 className="text-lg font-bold">自选/白名单股票池</h3>
          <div className="relative">
            <input 
              type="text" 
              placeholder="搜索代码/名称..." 
              className="px-3 py-1.5 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary w-64"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 font-medium">代码</th>
                <th className="px-4 py-3 font-medium">名称</th>
                <th className="px-4 py-3 font-medium text-right">按盘价(最新)</th>
                <th className="px-4 py-3 font-medium text-right">涨跌幅</th>
                <th className="px-4 py-3 font-medium text-right">昨收盘</th>
                <th className="px-4 py-3 font-medium text-center">状态</th>
                <th className="px-4 py-3 font-medium text-center">操作</th>
              </tr>
            </thead>
            <tbody>
              {/* 模拟一条数据 */}
              <tr className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">00700.HK</td>
                <td className="px-4 py-3">腾讯控股</td>
                <td className="px-4 py-3 text-right font-bold text-red-500">288.40</td>
                <td className="px-4 py-3 text-right text-red-500">+1.55%</td>
                <td className="px-4 py-3 text-right text-gray-500">284.00</td>
                <td className="px-4 py-3 text-center"><span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">交易中</span></td>
                <td className="px-4 py-3 text-center">
                  <button className="text-primary hover:text-blue-700 text-sm font-medium">去交易</button>
                </td>
              </tr>
              <tr className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">09988.HK</td>
                <td className="px-4 py-3">阿里巴巴-SW</td>
                <td className="px-4 py-3 text-right font-bold text-green-500">72.15</td>
                <td className="px-4 py-3 text-right text-green-500">-0.48%</td>
                <td className="px-4 py-3 text-right text-gray-500">72.50</td>
                <td className="px-4 py-3 text-center"><span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">交易中</span></td>
                <td className="px-4 py-3 text-center">
                  <button className="text-primary hover:text-blue-700 text-sm font-medium">去交易</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}