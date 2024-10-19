HTTPMonitorApp/
│
├── .vscode/ # VS Code 設定文件夾
│ ├── settings.json # 編輯器設置，例如格式化和縮排
│ ├── tasks.json # 構建/編譯任務配置
│ └── launch.json # 調試配置
│
├── HTTPMonitorApp/ # 主應用程式目錄
│ ├── Assets/ # 資源文件夾，例如圖標、圖片等
│ ├── Models/ # 數據模型
│ │ └── HTTPPacket.swift # 定義 HTTP 封包的 Swift 數據模型
│ ├── Networking/ # 封包捕捉邏輯
│ │ ├── PacketCapture.c # 用於封包捕捉的 C 代碼
│ │ ├── PacketCapture.h # C 函數的頭文件
│ │ ├── PacketCaptureWrapper.swift # Swift 與 C 代碼的接口文件
│ └── Views/ # SwiftUI 或 Cocoa 的 GUI 部分
│ ├── ContentView.swift # 主界面視圖
│ └── PacketDetailView.swift # 封包詳細信息視圖
│
├── Scripts/ # 自動化腳本文件夾
│ ├── build.sh # 構建和編譯的自動化腳本
│ └── create_dmg.sh # 打包應用成 .dmg 的腳本
│
├── Tests/ # 測試代碼
│ ├── HTTPMonitorAppTests/ # Swift 的單元測試
│ ├── PacketCaptureTests/ # C 的單元測試
│ └── PythonPrototypeTests/ # 如果有使用 Python 原型的話，可以加入測試
│
├── BridgingHeader.h # 用於 Swift 和 C/C++ 之間的交互的橋接頭文件
│
├── Package.swift # Swift Package Manager 配置文件
├── CMakeLists.txt # CMake 配置文件，用於編譯 C/C++
├── README.md # 專案說明文件
└── LICENSE # 項目授權文件
