import React from 'react'

const Intro = () => {
  return (
    <div className='w-full'>
    
      <div className='grid grid-rows-3 text-black'>
        
        <div className='grid grid-cols-2 w-full h-full  border-black border-b-2 border-x-2'>
          <div className='w-full h-full'>A</div>
          <div className='w-full h-full'>A-IMG</div>
        </div>

        <div className='grid grid-cols-2 w-full h-full border-black border-b-2 border-x-2'>
          <div className='w-full h-auto'>B</div>
          <div className='w-full h-auto'>B-IMG</div>
        </div>

        <div className='grid grid-cols-2 w-full h-40 border-black border-b-2 border-x-2'>
          <div className='w-full h-auto'>
            <div className='pt-5 flex justify-center content-center'>
              <div className='pr-5'>
                <button className='border-black border-2 p-2  '>EXPLORER</button>
              </div>
              <div>
                <button className='border-black border-2 p-2 '>ABOUT US</button>
                
              </div>
            </div>
          </div>
          <div className='w-full h-auto'>C-IMG</div>
        </div>

      </div>
    
    </div>
  )
}

export default Intro