import React from 'react'

const Nav = () => {
  return (
    <div className='flex w-full content-center 
    justify-center bg-greenLengs text-black border-black border-2
    h-20
    '>
        <div className='w-1/5 h-full text-center border-r-black border-r-2 grid place-items-center'>#</div>
        <div className="w-1/2 h-full border-r-black border-r-2"></div>
        <div className='w-1/4 h-full text-center grid place-items-center'
            onClick={()=>{
                console.log("CONECTANDO")
            }}
        >CONNECT METAMASK</div>  
    </div>
  )
}

export default Nav