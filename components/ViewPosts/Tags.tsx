import React from 'react'
import { AiOutlineMore } from 'react-icons/ai';



const Tags = ({tags}:any) => {


    return (
    <>
        <div>
            
            <div className='flex pl-5 w-auto h-20'>
                <div className='w-1/2 flex items-end pb-5'>
                    <p>Tags</p>
                </div>
                <div className='w-1/2 flex pb-5 items-end'>
                    <div className='flex w-auto'>
                            <button className='border-black border w-auto h-6 text-xs hover:bg-greenLengs'>+ add tag</button>
                            <img src="" alt="" />
                            <div>3</div>
                    </div>
                </div>
            </div>
            
            <div className='flex flex-wrap gap-2 pl-5'>
                {tags.map((t:string, index:number)=>{
                    
                    console.log(t, 'TAGS')
                    return(
                    <>
                        <div className='border-black border pr-2 pl-2 hover:bg-greenLengs' key={index}>
                            {t}
                        </div>
                    </>
                    )
                })}
            </div>
        </div>
    </>
  )
}

export default Tags