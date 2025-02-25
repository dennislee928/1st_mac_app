import React, { useState } from "react";
import {
  Menu,
  X,
  Shield,
  Activity,
  AlertTriangle,
  Settings,
  Home,
} from "lucide-react";

const CollapsibleMenu = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      {/* 菜單按鈕 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-md transition-colors"
      >
        {isOpen ? <X size={18} /> : <Menu size={18} />}
        <span className="ml-2 text-sm font-medium">
          {isOpen ? "關閉選單" : "開啟選單"}
        </span>
      </button>

      {/* 展開的菜單 */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-[#141D2B] border border-[#1E2D3D] rounded-md shadow-lg overflow-hidden z-50">
          <div className="p-3 border-b border-[#1E2D3D]">
            <h3 className="text-[#9FEF00] font-medium">安全控制中心</h3>
          </div>

          <nav className="p-2">
            <ul className="space-y-1">
              <li>
                <a
                  href="#"
                  className="flex items-center px-3 py-2 text-sm text-gray-200 hover:bg-[#1E2D3D] rounded-md transition-colors"
                >
                  <Home size={16} className="mr-3 text-gray-400" />
                  首頁
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="flex items-center px-3 py-2 text-sm text-gray-200 hover:bg-[#1E2D3D] rounded-md transition-colors"
                >
                  <Shield size={16} className="mr-3 text-gray-400" />
                  安全分析（開發中）
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="flex items-center px-3 py-2 text-sm text-gray-200 hover:bg-[#1E2D3D] rounded-md transition-colors"
                >
                  <AlertTriangle size={16} className="mr-3 text-gray-400" />
                  可疑 IP 列表（開發中）
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="flex items-center px-3 py-2 text-sm text-gray-200 hover:bg-[#1E2D3D] rounded-md transition-colors"
                >
                  <Activity size={16} className="mr-3 text-gray-400" />
                  性能監控 （開發中）
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="flex items-center px-3 py-2 text-sm text-gray-200 hover:bg-[#1E2D3D] rounded-md transition-colors"
                >
                  <Settings size={16} className="mr-3 text-gray-400" />
                  設置 （開發中）
                </a>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </div>
  );
};

export default CollapsibleMenu;
