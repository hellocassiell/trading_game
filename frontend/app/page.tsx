export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">仪表盘 (Dashboard)</h2>

      {/* 资产概览 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium">总资产 (HKD)</h3>
          <p className="text-2xl font-bold mt-2">1,000,000.00</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium">可用资金 (HKD)</h3>
          <p className="text-2xl font-bold mt-2 text-primary">1,000,000.00</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium">冻结资金 (HKD)</h3>
          <p className="text-2xl font-bold mt-2">0.00</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium">持仓市值 (HKD)</h3>
          <p className="text-2xl font-bold mt-2">0.00</p>
        </div>
      </div>

      {/* 快捷操作 */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold mb-4">快捷操作</h3>
        <div className="flex space-x-4">
          <button className="px-6 py-2 bg-primary text-white rounded-md hover:bg-blue-700 transition">去交易</button>
          <button className="px-6 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition">查看行情</button>
        </div>
      </div>
    </div>
  );
}