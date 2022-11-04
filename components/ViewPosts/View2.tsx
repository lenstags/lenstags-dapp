import React from 'react'
import {Input} from '../UI/Search'
import PostType from '../UI/PostTypes'
import Links from '../UI/Links'

const View2 = () => {



  return (
    <div className='w-full pt-10 pl-5 pb-40 '>
      <div className='w-full flex'>
          <div className='flex border-black border w-1/2'>
            
            <div className='w-1/2 text-center'>
              <Links 
                href=""
                Href="/user/My"
                Text= "MY LISTS"
                />
            </div>
              
            <div className='w-1/2 text-center'>
              <Links 
                Href=""
                Text= "EDIT LIST"
                />
            </div>
            
            <div className='w-1/2 text-center'>
              <Links 
                Href=""
                Text= "NEW LIST"
                />
            </div>
          </div>
          <div className='w-1/2'>
            <Input
                      PlaceHolder= "Search..."
                      Type="text"
                      iconLeft= ""
                  />
          </div>
      </div>
      <div>

        <PostType/>

      </div>
    </div>
  )
}

export default View2