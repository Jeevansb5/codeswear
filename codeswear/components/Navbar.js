import React, { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { AiOutlineShoppingCart, AiFillCloseCircle, AiFillMinusCircle, AiFillPlusCircle } from "react-icons/ai";
import { BsBagCheckFill } from "react-icons/bs";
import { MdAccountCircle } from "react-icons/md";
import { useRouter } from 'next/router';

const Navbar = ({ logout, user, cart, addToCart, removeFromCart, clearCart, subTotal }) => {

  const [dropdown, setDropdown] = useState()
  const [sidebar, setSidebar] = useState(false)
  const router = useRouter()
  useEffect(() => {
    Object.keys(cart), length !== 0 && setSidebar(true)
    let exempted=['/checkout','/order','/orders','/myaccount']
    if (exempted.includes(router.pathname) ) {
      setSidebar(false)
    }
  }, [])


  const toggleCart = () => {
    setSidebar(!sidebar);
  }
  
  const ref = useRef()
  return (
    <>
      <span onMouseOver={() => { setDropdown(true) }} onMouseLeave={() => { setDropdown(false) }} >
        {dropdown && <div className='absolute z-20 right-11 top-8 bg-white shadow-lg border rounded-md font-semibold py-5 px-5 w-32'>
          <ul>
            <Link href={'/myaccount'}> <li className='py-1 text-sm hover:text-pink-700'>My Account</li></Link>
            <Link href={'/orders'}> <li className='py-1 text-sm hover:text-pink-700'>Orders</li></Link>
            <li onClick={logout} className='py-1 text-sm hover:text-pink-700 cursor-pointer'>Logout</li>
          </ul>
        </div>}

      </span>
      <div className={`flex flex-col md:flex-row md:justify-start justify-center items-center mb-1 py2 shadow-md sticky top-0 z-10 bg-white ${!sidebar && 'overflow-hidden'}`}>
        <div className="logo mr-auto px-1 md:mx-5">
          <Link href='/'><Image width={200} height={40} src='/logo.png' alt='logo' /></Link>
        </div>
        <div className="nav">
          <ul className='flex items-center space-x-6 font-bold md:text-md'>
            <Link href={'/tshirt'}><li className='hover:text-pink-500'>Tshirt</li></Link>
            <Link href={'/hoodies'}> <li className='hover:text-pink-500'>Hoodies</li></Link>
            <Link href={'/stickers'}><li className='hover:text-pink-500'>Stickers</li></Link>
            <Link href={'/mugs'}><li className='hover:text-pink-500'>Mugs</li></Link>
          </ul>
        </div>
        <div className="cart absolute right-0 top-2 mx-5 cursor-pointer items-center flex">
          {!user.value && <Link href={'/login'}>
            <button className='bg-pink-600 px-2 py-1 rounded-md text-sm text-white mx-2'>Login</button>
          </Link>}
          <span >{user.value && <MdAccountCircle onMouseOver={() => { setDropdown(true) }} onMouseLeave={() => { setDropdown(false) }} className='text-xl md:text-2xl mx-2' />}</span>
          <AiOutlineShoppingCart onClick={toggleCart} className='text-xl md:text-2xl' />
        </div>
        <div ref={ref} className={`w-72 h-[100vh] sideCart overflow-y-scroll absolute top-0  bg-pink-200 py-10 px-8  transition-all ${sidebar ? 'right-0' : '-right-96'}`}>
          <h2 className='font-bold text-xl text-center'>Shoping Cart</h2>
          <span onClick={toggleCart} className='absolute top-4 right-3 cursor-pointer text-pink-500 text-2xl'><AiFillCloseCircle /></span>
          <ol className='list-decimal font-semibold'>
            {Object.keys(cart).length == 0 && <div className='my-4 font-semibold'>Your cart is Empty!</div>}
            {Object.keys(cart).map((k) => {
              return <li key={k}>
                <div className='item flex my-5'>
                  <div className='w-2/3 font-semibold'>{cart[k].name}({cart[k].size}/{cart[k].variant})</div>
                  <div className='w-1/3 font-semibold flex items-center justify-center text-lg'> <AiFillMinusCircle onClick={() => { removeFromCart(k, 1, cart[k].size, cart[k].name, cart[k].price, cart[k].variant) }} className='cursor-pointer text-pink-500' /> <span className='mx-2 text-sm'>{cart[k].qty}</span> <AiFillPlusCircle className='cursor-pointer text-pink-500' onClick={() => addToCart(k, 1, cart[k].size, cart[k].name, cart[k].price, cart[k].variant)} /> </div>
                </div>
              </li>
            })}

          </ol>
          <div className='font-bold my-2'>Subtotal:₹{subTotal}</div>
          <div className="flex">
            <Link href={'/checkout'}><button disabled={Object.keys(cart).length === 0} className="disabled:bg-pink-300 flex mr-2  text-white bg-pink-500 border-0 py-2 px-1 focus:outline-none hover:bg-pink-600 rounded text-sm"> <BsBagCheckFill className='m-1' /> Check Out</button></Link>
            <button disabled={Object.keys(cart).length === 0} onClick={clearCart} className="flex  disabled:bg-pink-300 bg-pink-500 text-white py-2 px-5 focus:outline-none hover:bg-pink-600 rounded text-sm"> Clear Cart</button>
          </div>
        </div>
      </div>
    </>
  )
}

export default Navbar
