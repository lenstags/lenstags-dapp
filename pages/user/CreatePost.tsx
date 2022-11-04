import React from 'react'
import CreateP from '../../components/ViewPosts/Create/CreateP'
import PreView from '../../components/ViewPosts/Create/PreView'
import Nav from '../../components/Nav/Nav'

const CreatePost = () => {
  return (
   <>
    <div>
        <Nav/>
        <div className='bg-white w-full h-full flex'>
            <CreateP/>
            <div className='text-black  h-screen border-black border pr-8 mt-20 mb-20'></div>
            <PreView/>   
        </div>
    </div>
   </>
  )
}

export default CreatePost