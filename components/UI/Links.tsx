import React from 'react'
import Link from 'next/link'

const Links = ({Text, Href}:any) => {
  return (
    <Link href={ Href }>
        <div className='hover:bg-greenLengs'>
            <a href={ Href }>
                <button>{Text}</button>
            </a>
        </div>
    </Link>
  )
}

export default Links