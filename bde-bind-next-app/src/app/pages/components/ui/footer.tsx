import React from "react";
import { Shield } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#141D2B] border-t border-[#1E2D3D] py-3 px-4">
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between">
        <div className="flex items-center mb-2 sm:mb-0">
          <Shield className="w-4 h-4 text-[#9FEF00] mr-2" />
          <span className="text-xs text-gray-400">安全性能中心 v1.0.0</span>
        </div>

        <div className="text-xs text-gray-500">
          © {currentYear} Twister5.com.tw 版權所有 Explorer: Twister5.com.tw
        </div>

        <div className="text-xs text-gray-600 mt-1 sm:mt-0">
          Author: Dennis_Lee, MIT Auth.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
