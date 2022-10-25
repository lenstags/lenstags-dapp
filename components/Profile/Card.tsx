import React from 'react'

const Card = () => {
  
  let datosUser: any =[
    {
      user_Name: "Sau",
      lens: "@SauMusic",
      datos: {
        following: 1000,
        followers: 1000,
        lengsting: 10000
      },
      description: "UN humano en el mundo crypto"
    }
  ]
  
  return (
    <div>
      <div>A

        <div>
          <img src="" alt="" />
        </div>
        <div>
          <img src="" alt="" />
          <div>
            {datosUser.map((d:any, index:number) => {
              return(
                <div key={index}>
                  <div>{d.user_Name}</div>
                  <div>{d.lens}</div>
                  <div className='flex'>
                    <div>
                      <div>{d.datos.following}</div>
                      <div>followers</div>
                    </div>
                    <div>
                      <div>{d.datos.followers}</div>
                      <div>following</div>
                    </div>
                    <div>
                      <div>{d.datos.lengsting}</div>
                      <div>lensting</div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          <div>
            socials
          </div>
        </div>

      </div>
      
      <div>B</div>
    </div>
  )
}

export default Card