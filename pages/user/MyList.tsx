import React from 'react'
import MyList from '../../components/ViewPosts/MyList'
import Nav from '../../components/Nav/Nav'
import Card from '../../components/Profile/Card'

const MyListPost = () => {
  return (
    <div className='bg-white'>
        <Nav/>
        <div className='flex w-full pr-40'>
    
          <Card img=""/>
          <MyList/>
        </div>
       
    </div>
  )
}

export default MyListPost