import React from 'react'

const Followers = () => {
  
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
  
    return (
        <>
            <div className='text-center'>
                <div className='card-Numbers'>{datosUser.datos.following}</div>
                <div className='font-pizzola text-letrasGrises'>followers</div>
            </div>
                
        </>   
  )
}

export default Followers