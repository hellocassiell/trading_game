export default function PortfolioPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">我的持仓 (Portfolio)</h2>

      {/* 资产摘要 */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-6">
        <h3 className="text-lg font-bold mb-4 border-b pb-2">资产摘要</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-gray-500 text-sm">总资产 (HKD)</p>
            <p className="text-xl font-bold">1,000,000.00</p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">可用资金 (HKD)</p>
            <p className="text-xl font-bold text-green-600">1,000,000.00</p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">持仓市值 (HKD)</p>
            <p className="text-xl font-bold">0.00</p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">今日盈亏</p>
            <p className="text-xl font-bold text-gray-400">0.00 (0.00%)</p>
          </div>
        </div>
      </div>

      {/* 持仓列表 */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold mb-4 border-b pb-2">当前持仓</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 font-medium">股票代码</th>
                <th className="px-4 py-3 font-medium">名称</th>
                <th className="px-4 py-3 font-medium text-right">持仓数量</th>
                <th className="px-4 py-3 font-medium text-right">可用数量</th>
                <th className="px-4 py-3 font-medium text-right">成本均价</th>
                <th className="px-4 py-3 font-medium text-right">现价</th>
                <th className="px-4 py-3 font-medium text-right">浮动盈亏</th>
                <th className="px-4 py-3 font-medium text-center">操作</th>
              </tr>
            </thead>
            <tbody>
              {/* 这里应该循环渲染真实数据 */}
              <tr>
                <td colSpan={8} className="text-center text-gray-500 py-10 border-b border-gray-100">
                  暂无持仓
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 交割单 (历史成交) */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mt-6">
        <h3 className="text-lg font-bold mb-4 border-b pb-2">近期成交记录 (历史交割单)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 font-medium">成交时间</th>
                <th className="px-4 py-3 font-medium">代码</th>
                <th className="px-4 py-3 font-medium">方向</th>
                <th className="px-4 py-3 font-medium text-right">成交均价</th>
                <th className="px-4 py-3 font-medium text-right">成交数量</th>
                <th className="px-4 py-3 font-medium text-right">发生金额</th>
                <th className="px-4 py-3 font-medium text-right">各项税费</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={7} className="text-center text-gray-500 py-10 border-b border-gray-100">
                  暂无成交记录
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}