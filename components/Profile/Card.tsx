import React from 'react'

//COMPONENTS
import Followers from './Followers'
import Following from './Following'
import Lesting from './Lesting'
import SocialCards from './socialCards'
import CardOptions from './CardOptions'

//IMG
import world from "../../assets/World.png"
import Cover from './Cover'
import Vector from '../../assets/Vector.png'
import Line1 from '../../assets/Line 1.png'

type Props = {
  img: string
}

let datosUser: any ={
  user_Name: "Sau",
  lens: "@SauMusic",
  datos: {
    following: 1000,
    followers: 1000,
    lengsting: 10000
  },
  description: "UN humano en el mundo crypto"
}


const Card: React.FC <Props> = ({img}): JSX.Element => {
  

  
  return (
    <div className='text-black border-black border-x-2 border-b-2 w-1/5  h-auto ml-20'>
      
      <div className='flex flex-col w-auto'>
        <div className='z-0'>
          
          <img src={world.src} alt="" />
        
        </div>
        
        <div className='flex flex-col content-center w-auto z-10'>
          
          <div className='flex flex-col'>
                
            <div className='mx-auto pb-20 '>
                <div className='z-10 absolute cover'>
                  <Cover/>
                </div>
            </div>

            <div className='flex flex-col content-center w-auto'>
                  
              <div className='text-center'>
                <div>
                  <div className='card-Name'>{datosUser.user_Name}</div>
                  <img src={Vector.src} alt="" className='' />
                </div>
                <div className='card-grayLetters'>{datosUser.lens}</div>
              </div>
                  
              <div className='lg:flex w-auto mx-auto lg:gap-6 pt-5  '>
            
                <Followers/>
                <Following/>
                <Lesting/>
            
              </div>

              <div className='w-auto flex pt-5 pb-5'>
                <div className='mx-auto'>
                  <SocialCards/>
                </div>
              </div>

            </div>

          </div>

          <div className='border-black border-t-2 w-auto card-optiones'>
        
            <CardOptions line={Line1}/>

          </div>

        </div>

      </div>

    </div>

  )
}

export default Card
