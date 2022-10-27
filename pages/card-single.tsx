import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'

const Home: NextPage = () => {
  return (
    <div className={styles.container}>
      <div className="Card_container">
        <div className="Card_title">
          <h1>Tagging content</h1>
        </div>

        <div className="Card_container_collect_bar">
          <div>Icon</div>
          <div>Colled</div>
          <div>Date</div>
          <div>Imagen</div>
          <div>Username</div>
        </div>

        <div className="Card_container_tags">
          <div className="Card_tags">DAO</div>
          <div className="Card_tags">Web3</div>
        </div>  

        <div className="Card_content">
        Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.
        </div>

        <div className="Card_likes">13 Likes</div>
        

      </div>
    </div>
  )
}

export default Home
