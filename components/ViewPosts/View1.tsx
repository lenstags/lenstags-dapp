import React from 'react'
import {Input} from '../UI/Search'
import Carousel from '../UI/Carousel'
import { BeakerIcon } from '@heroicons/react/24/solid'

const View1 = () => {
  return (

        <div className='w-full pt-10 pl-5'>
            <div className='w-full'>
                <Input
                    PlaceHolder="Search..."
                    type="text"
                    iconLeft= ""
                />
            </div>
            <div>
                <Carousel/>
            </div>
        </div>
    
  )
}

export default View1