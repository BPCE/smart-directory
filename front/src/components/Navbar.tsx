import React from 'react'
import { Home, Settings, Users, Package } from 'lucide-react'
import Link from "next/link"

const Navbar = () => {
  return (
    <div className="hidden border-r bg-gray-100/40 lg:block">
        <div className="flex h-full flex-col gap-2">
          <div className="flex h-[60px] items-center border-b px-6">
            <Link className="flex items-center gap-2 font-semibold" href="/">
              <Package className="h-6 w-6" />
              <span>Dashboard Smartdirectory</span>
            </Link>
          </div>
          <div className="flex-1 px-4">
            <nav className="grid items-start px-2 text-sm font-medium">
              <Link
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900"
                href="/"
              >
                <Home className="h-4 w-4" />
                Home
              </Link>
              <Link
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900"
                href="/smart-directory"
              >
                <Users className="h-4 w-4" />
                SmartDirectory
              </Link>
              <Link
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900"
                href="#"
              >
                <Package className="h-4 w-4" />
                Products
              </Link>
              <Link
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900"
                href="#"
              >
                <Settings className="h-4 w-4" />
                Settings
              </Link>
            </nav>
          </div>
        </div>
      </div>
  )
}

export default Navbar