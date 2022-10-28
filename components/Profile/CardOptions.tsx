import React from 'react'

const CardOptions = ({linea}:any) => {
  return (
    <>
        <div className='pl-5 pt-2 pb-2'>LOG</div>
            <div className='border-black border-t pl-5 pt-2 pb-2'>--</div>
            <div className='border-black border-t pl-5 pt-2 pb-2 hover:bg-greenLengs'>My Tags</div>
            <div className='border-black border-t pl-5 pt-2 pb-2 hover:bg-greenLengs'>My LISTS</div>
            <div className='border-black border-t pl-5 pt-2 pb-2 hover:bg-greenLengs'>Post</div>
            <div className='border-black border-t pl-5 pt-2 pb-2 hover:bg-greenLengs'>Badges</div>
            <div className='border-black border-t pl-5 pt-2 pb-2 hover:bg-greenLengs'>Lists</div>
    </>
  )
}

export default CardOptions