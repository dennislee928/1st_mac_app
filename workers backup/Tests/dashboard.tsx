"use client";

import { useState } from "react";
import {
  Bell,
  ChevronDown,
  CreditCard,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  PieChart,
  Search,
  Settings,
  Users,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AreaChart, BarChart } from "@/components/charts";

export default function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div
        className={`${
          isSidebarOpen ? "w-64" : "w-20"
        } bg-white border-r border-gray-200 transition-all duration-300 flex flex-col`}
      >
        <div className="p-4 flex items-center justify-between border-b border-gray-200">
          <div
            className={`flex items-center ${
              !isSidebarOpen && "justify-center w-full"
            }`}
          >
            {isSidebarOpen && (
              <div className="font-bold text-xl">Dashboard</div>
            )}
            {!isSidebarOpen && (
              <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center text-white font-bold">
                D
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={!isSidebarOpen ? "hidden" : ""}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex-1 py-4">
          <nav className="space-y-1 px-2">
            <SidebarItem
              icon={<Home />}
              label="Home"
              isOpen={isSidebarOpen}
              isActive={false}
            />
            <SidebarItem
              icon={<LayoutDashboard />}
              label="Dashboard"
              isOpen={isSidebarOpen}
              isActive={true}
            />
            <SidebarItem
              icon={<PieChart />}
              label="Analytics"
              isOpen={isSidebarOpen}
              isActive={false}
            />
            <SidebarItem
              icon={<CreditCard />}
              label="Transactions"
              isOpen={isSidebarOpen}
              isActive={false}
            />
            <SidebarItem
              icon={<Users />}
              label="Users"
              isOpen={isSidebarOpen}
              isActive={false}
            />
            <SidebarItem
              icon={<Package />}
              label="Products"
              isOpen={isSidebarOpen}
              isActive={false}
            />
            <SidebarItem
              icon={<Settings />}
              label="Settings"
              isOpen={isSidebarOpen}
              isActive={false}
            />
          </nav>
        </div>
        <div className="p-4 border-t border-gray-200">
          <SidebarItem
            icon={<LogOut />}
            label="Logout"
            isOpen={isSidebarOpen}
            isActive={false}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 py-4 px-6 flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={isSidebarOpen ? "hidden" : ""}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <Input placeholder="Search..." className="pl-8" />
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src="/placeholder.svg?height=32&width=32"
                      alt="User"
                    />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <span>John Doe</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuItem>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold">Dashboard Overview</h1>
            <Tabs defaultValue="week">
              <TabsList>
                <TabsTrigger value="day">Day</TabsTrigger>
                <TabsTrigger value="week">Week</TabsTrigger>
                <TabsTrigger value="month">Month</TabsTrigger>
                <TabsTrigger value="year">Year</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <StatCard
              title="Total Revenue"
              value="$45,231.89"
              change="+20.1%"
              isPositive={true}
            />
            <StatCard
              title="Active Users"
              value="2,345"
              change="+10.3%"
              isPositive={true}
            />
            <StatCard
              title="Conversion Rate"
              value="3.8%"
              change="-0.5%"
              isPositive={false}
            />
            <StatCard
              title="Avg. Order Value"
              value="$59.12"
              change="+12.4%"
              isPositive={true}
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-medium">Revenue Overview</h3>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 gap-1">
                        Last 7 Days
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Last 7 Days</DropdownMenuItem>
                      <DropdownMenuItem>Last 30 Days</DropdownMenuItem>
                      <DropdownMenuItem>Last 90 Days</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="h-[300px]">
                  <AreaChart />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-medium">Sales by Category</h3>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 gap-1">
                        Last 7 Days
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Last 7 Days</DropdownMenuItem>
                      <DropdownMenuItem>Last 30 Days</DropdownMenuItem>
                      <DropdownMenuItem>Last 90 Days</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="h-[300px]">
                  <BarChart />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Transactions */}
          <Card>
            <CardContent className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-medium">Recent Transactions</h3>
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-500">
                        Transaction ID
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">
                        Customer
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">
                        Date
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">
                        Amount
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <TransactionRow
                      id="#TRX-123456"
                      customer="John Smith"
                      date="2023-04-12"
                      amount="$125.00"
                      status="Completed"
                    />
                    <TransactionRow
                      id="#TRX-123457"
                      customer="Sarah Johnson"
                      date="2023-04-11"
                      amount="$84.50"
                      status="Processing"
                    />
                    <TransactionRow
                      id="#TRX-123458"
                      customer="Michael Brown"
                      date="2023-04-10"
                      amount="$216.75"
                      status="Completed"
                    />
                    <TransactionRow
                      id="#TRX-123459"
                      customer="Emily Davis"
                      date="2023-04-09"
                      amount="$65.25"
                      status="Failed"
                    />
                    <TransactionRow
                      id="#TRX-123460"
                      customer="Robert Wilson"
                      date="2023-04-08"
                      amount="$192.30"
                      status="Completed"
                    />
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}

function SidebarItem({ icon, label, isOpen, isActive }) {
  return (
    <div
      className={`flex items-center p-2 rounded-md ${
        isActive
          ? "bg-blue-50 text-blue-600"
          : "text-gray-600 hover:bg-gray-100"
      } ${!isOpen && "justify-center"}`}
    >
      <div className={isActive ? "text-blue-600" : "text-gray-500"}>{icon}</div>
      {isOpen && <span className="ml-3">{label}</span>}
    </div>
  );
}

function StatCard({ title, value, change, isPositive }) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col">
          <p className="text-sm text-gray-500">{title}</p>
          <div className="flex items-end justify-between mt-1">
            <h3 className="text-2xl font-bold">{value}</h3>
            <span
              className={`text-sm ${
                isPositive ? "text-green-500" : "text-red-500"
              }`}
            >
              {change}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TransactionRow({ id, customer, date, amount, status }) {
  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800";
      case "Processing":
        return "bg-blue-100 text-blue-800";
      case "Failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <tr className="border-b border-gray-200 hover:bg-gray-50">
      <td className="py-3 px-4 text-sm">{id}</td>
      <td className="py-3 px-4 text-sm">{customer}</td>
      <td className="py-3 px-4 text-sm">{date}</td>
      <td className="py-3 px-4 text-sm font-medium">{amount}</td>
      <td className="py-3 px-4">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
            status
          )}`}
        >
          {status}
        </span>
      </td>
    </tr>
  );
}
