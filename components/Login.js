'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { Slide, ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';


export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const result = await signIn('credentials', {
        redirect: false,
        username,
        password,
      })

      if (result.error) {
        const id = toast.error(result.error)
      } 
    } catch (error) {
      console.log('error', error)
    }
  }

  return (
    <div className="flex h-screen items-center justify-center font-IBM-Plex">
       <ToastContainer
                position="top-center"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
                transition={Slide}
              />
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-md shadow-md"
      >
        <div className="mb-4">
          <label htmlFor="username">ชื่อผู้ใช้</label>
          <input
            id="username"
            type="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="w-full border border-gray-300 px-3 py-2 rounded focus-visible:ring-0 focus-visible:outline-0" 
          />
        </div>
        <div className="mb-4">
          <label htmlFor="password">รหัสผ่าน</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full border border-gray-300 px-3 py-2 rounded focus-visible:ring-0 focus-visible:outline-0" 
          />
        </div>
        <button
          type="submit"
          className="w-full border-[1px] border-gray-300 bg-gray-50 text-gray-700 py-2 rounded mb-4 hover:bg-gray-100 duration-300 cursor-pointer"
        >
          เข้าสู่ระบบ
        </button>{' '}
      </form>
    </div>
  )
}