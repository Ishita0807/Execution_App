import React from 'react'
import './globals.css'
import { UserProvider } from '../providers/usercontext'

export default function Layout({ children }: { children: React.ReactNode }) {

  return (
    
      <html lang="en">
        <body>
          <UserProvider>
            {children}
          </UserProvider>
        </body>
      </html>
    
  )
}