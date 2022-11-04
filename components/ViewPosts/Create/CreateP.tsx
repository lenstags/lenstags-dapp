import React from 'react'

const CreateP = () => {
  return (
    <div className='text-black pl-10 w-1/2'>
      <div className='pt-16'>
        
        <div className='pb-5 w-1/3'>
          <div>CREATE POST</div>
          <div className='shadow-sm shadow-black h-10  text-center text-letterGray2'><p className='pt-2'>SELECT PUBLICATION</p><img src="" alt="" /></div>
        </div>
        
        <div className='text-letterGray pr-10'>
          <div className='border-black border-x border-t pt-2 pb-2 pl-3'>TITTLE</div>
          <div className='border-black border-x border-t pt-2 pb-2 pl-3'>LINK</div>
          <div className='border-black border-x border-t pt-2 pb-2 pl-3'>COVER</div>
          <div className='border-black border-x border-t border-b pt-2 pb-2 pl-3'>DESCRIPTION(OPTIONAL)</div>
        </div>

        <div className='pt-5 pr-10'>
          <div className='shadow-sm shadow-black h-10  text-center text-letterGray2'><p className='pt-2'>SELECT PUBLICATION</p><img src="" alt="" /></div>
        </div>
  
      </div>

      <div className='pt-10'>
        <div className='pb-3'>SETTING</div>
        
        <div className='pr-10'>

          <div className='border-t border-x border-black'>
            
            <div className='pt-2 pb-2 pl-5'>SELECT COLLECT MODULE</div>
            <div></div>

          </div>

          <div className='border-t border-x border-black'>
            
            <div className='pt-2 pb-2 pl-5'>COMMENT AND MIRROS</div>
            <div></div>
          
          </div>

          <div className='border-y border-x border-black'>
          
            <div className='pt-2 pb-2 pl-5'>COLLECT AUTOMATICALLY</div>
            <div></div>
          
          </div>

        </div>

        <div className='flex pt w-full pt-8 pr-10'>
          <div className='w-1/2 pr-10 text-center'>
            <div className='w-full h-20 border border-black 
              grid place-items-center bg-rojoLengs text-4xl'>
              <button>CANCEL</button>
            </div>
          </div>
          <div className='w-1/2 pl-10 text-center'>
            <div className='w-full h-20 border border-black 
              grid place-items-center bg-greenLengs text-4xl'>
              <button>POST</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateP