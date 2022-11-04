import React from 'react'

const PreView = () => {
  return (
    <>
        <div className='w-1/2 text-black pt-20 pl-10'>
            <div className='pb-5'>
                <p>PREVIEW</p>
            </div>
            <div>
                <div></div>
                <textarea name="" id="" cols="60" rows="15" placeholder='START TYPING...' 
                    className='bg-white border border-black outline-0'></textarea>
            </div>
        </div>
    </>
  )
}

export default PreView