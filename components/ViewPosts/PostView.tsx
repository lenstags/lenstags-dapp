import React from 'react'
import Options from '../Profile/Options'
import Tags from './Tags'
import View1 from './View1'
import View2 from './View2'

const PostView = () => {

  let tags: string[] = ["Tokenomics", "Food", "Desing Systems", "Tokenomics", "Solidity", "Proof of Stake",
  "Movies & Series", "Proof of Stake", "Communities", "Art", "Proof of Stake", "Metaverso",
  "eSports", "DAO", "Comics"]

  return (
    <div className='text-black w-full'>
      <div>
        <Options/>
        <div className='w-auto'>
          <div className='w-full'>
            <Tags 
              tags ={tags}
            />
            <View1/>
            <View2/>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PostView