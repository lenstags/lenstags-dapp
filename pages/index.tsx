import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import {
  Camera,
  Flowmap,
  Geometry,
  Mesh,
  Program,
  Renderer,
  Texture,
  Triangle,
  Vec2,
  Vec4
} from 'ogl-typescript';
import React, { useEffect, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import SwiperCore, { Autoplay } from 'swiper';

import Head from 'next/head';
import Image from 'next/image';
import { LayoutLanding } from 'components/LayoutLanding';
import type { NextPage } from 'next';

SwiperCore.use([Autoplay]);

const Home: NextPage = () => {
  const imgSize = [1440, 680];

  const vertex = `
					attribute vec2 uv;
					attribute vec2 position;
					varying vec2 vUv;
					void main() {
							vUv = uv;
							gl_Position = vec4(position, 0, 1);
					}
			`;
  const fragment = `
					precision highp float;
					precision highp int;
					uniform sampler2D tWater;
					uniform sampler2D tFlow;
					uniform float uTime;
					varying vec2 vUv;
					uniform vec4 res;

					void main() {

							// R and G values are velocity in the x and y direction
							// B value is the velocity length
							vec3 flow = texture2D(tFlow, vUv).rgb;

							vec2 uv = .5 * gl_FragCoord.xy / res.xy ;
							vec2 myUV = (uv - vec2(0.5))*res.zw + vec2(0.5);
							myUV -= flow.xy * (0.15 * 0.7);

							vec3 tex = texture2D(tWater, myUV).rgb;

							gl_FragColor = vec4(tex.r, tex.g, tex.b, 1.0);
					}
			`;

  const items = [
    {
      name: 'TAGS',
      icon: '/img/landing/icon-tags.svg',
      description: 'Labeled content for better management and discovery.',
      soon: false
    },
    {
      name: 'LISTS',
      icon: '/img/landing/icon-lists.svg',
      description: 'Organize your findings through Lists. Private or public.',
      soon: false
    },
    {
      name: 'PROJECTS',
      icon: '/img/landing/icon-projects.svg',
      description: 'All-in-one hub of resources. Effortlessly onboard users.',
      soon: false
    },
    {
      name: 'BADGES',
      icon: '/img/landing/icon-badges.svg',
      description:
        'Easily identify trusted and reliable sources of information.',
      soon: false
    },
    {
      name: 'PRO',
      icon: '/img/landing/icon-pro.svg',
      description: 'Unlock extra features and customization options.',
      soon: true
    },
    {
      name: 'MOBILE APP',
      icon: '/img/landing/icon-mobile.svg',
      description: 'Grab content anytime, anywhere. Forever.',
      soon: true
    },
    {
      name: 'BROWSER PLUGIN',
      icon: '/img/landing/icon-extension.svg',
      description: 'Seamless integration on every browser.',
      soon: true
    }
  ];

  const canvasRef = useRef<HTMLDivElement | null>(null); // used to avoid Property 'appendChild' does not exist on type 'never'
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const renderer = new Renderer({ dpr: 2 });
    const gl = renderer.gl;
    const camera = new Camera(gl);
    let canvas = gl.canvas;
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.zIndex = '-10';
    canvasRef.current.appendChild(canvas);

    let aspect = 1;
    const mouse = new Vec2(-1);
    const velocity = new Vec2();

    function resize() {
      let a1, a2;
      var imageAspect = imgSize[1] / imgSize[0];
      if (window.innerHeight / window.innerWidth < imageAspect) {
        a1 = 1;
        a2 = window.innerHeight / window.innerWidth / imageAspect;
      } else {
        a1 = (window.innerWidth / window.innerHeight) * imageAspect;
        a2 = 1;
      }
      mesh.program.uniforms.res.value = new Vec4(
        window.innerWidth,
        window.innerHeight,
        a1,
        a2
      );

      renderer.setSize(window.innerWidth, window.innerHeight);
      aspect = window.innerWidth / window.innerHeight;
    }

    const flowmap = new Flowmap(gl);
    // Triangle that includes -1 to 1 range for 'position', and 0 to 1 range for 'uv'.
    const geometry = new Geometry(gl, {
      position: {
        size: 2,
        data: new Float32Array([-1, -1, 3, -1, -1, 3])
      },
      uv: { size: 2, data: new Float32Array([0, 0, 2, 0, 0, 2]) }
    });
    const texture = new Texture(gl, {
      minFilter: gl.LINEAR,
      magFilter: gl.LINEAR
    });
    const imgSrc = 'img/landing/hero-back.jpg';
    const img = imgRef.current;
    if (img) {
      img.onload = () => {
        texture.image = img;
      };
      img.src = imgSrc;
    }

    let a1, a2;
    var imageAspect = imgSize[1] / imgSize[0];
    if (window.innerHeight / window.innerWidth < imageAspect) {
      a1 = 1;
      a2 = window.innerHeight / window.innerWidth / imageAspect;
    } else {
      a1 = (window.innerWidth / window.innerHeight) * imageAspect;
      a2 = 1;
    }

    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        uTime: { value: 0 },
        tWater: { value: texture },
        res: {
          value: new Vec4(window.innerWidth, window.innerHeight, a1, a2)
        },
        img: { value: new Vec2(imgSize[0], imgSize[1]) },
        // Note that the uniform is applied without using an object and value property
        // This is because the class alternates this texture between two render targets
        // and updates the value property after each render.
        tFlow: flowmap.uniform
      }
    });
    const mesh = new Mesh(gl, { geometry, program });

    window.addEventListener('resize', resize, false);
    resize();

    // Create handlers to get mouse position and velocity
    const isTouchCapable = 'ontouchstart' in window;
    if (isTouchCapable) {
      window.addEventListener('touchstart', updateMouse, false);
      window.addEventListener('touchmove', updateMouse, { passive: false });
    } else {
      window.addEventListener('mousemove', updateMouse, false);
    }
    let lastTime: any;
    const lastMouse = new Vec2();

    let velocityNeedsUpdate = false;

    function updateMouse(e: any) {
      e.preventDefault();
      if (e.changedTouches && e.changedTouches.length) {
        e.x = e.changedTouches[0].pageX;
        e.y = e.changedTouches[0].pageY;
      }
      if (e.x === undefined) {
        e.x = e.pageX;
        e.y = e.pageY;
      }
      // Get mouse value in 0 to 1 range, with y flipped
      mouse.set(e.x / gl.renderer.width, 1.0 - e.y / gl.renderer.height);
      // Calculate velocity
      if (!lastTime) {
        // First frame
        lastTime = performance.now();
        lastMouse.set(e.x, e.y);
      }

      const deltaX = e.x - lastMouse.x;
      const deltaY = e.y - lastMouse.y;

      lastMouse.set(e.x, e.y);

      let time = performance.now();

      // Avoid dividing by 0
      let delta = Math.max(10.4, time - lastTime);
      lastTime = time;
      velocity.x = deltaX / delta;
      velocity.y = deltaY / delta;
      // Flag update to prevent hanging velocity values when not moving
      velocityNeedsUpdate = true;
    }

    requestAnimationFrame(update);

    function update(t: any) {
      requestAnimationFrame(update);
      // Reset velocity when mouse not moving
      if (!velocityNeedsUpdate) {
        mouse.set(-1);
        velocity.set(0);
      }
      velocityNeedsUpdate = false;
      // Update flowmap inputs
      flowmap.aspect = aspect;
      flowmap.mouse.copy(mouse);
      // Ease velocity input, slower when fading out
      flowmap.velocity.lerp(velocity, velocity.len() ? 0.15 : 0.1);
      flowmap.update();
      program.uniforms.uTime.value = t * 0.01;
      renderer.render({ scene: mesh });
    }

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', updateMouse);
      window.removeEventListener('touchstart', updateMouse);
      window.removeEventListener('touchmove', updateMouse);
    };
  }, [imgSize]);

  return (
    <div className="">
      <Head>
        <title>Nata Social</title>
        <meta property="og:title" content="We are Nata Social" />

        <meta
          property="og:description"
          content="The first social bookmarking platform, backed by the community`s collective knowledge."
        />
        <meta property="og:image" content="banner.png" />

        <meta property="og:url" content="https://www.nata.social" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Nata Social" />
        <meta property="og:locale" content="en_US" />

        <link rel="manifest" href="/site.webmanifest" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5" />
        <meta name="msapplication-TileColor" content="#da532c" />
        <meta name="theme-color" content="#ffffff" />
      </Head>

      <LayoutLanding title={'Nata Social | Home'} pageDescription={'Home'}>
        <div>
          <div
            id="middle"
            ref={canvasRef}
            className="relative -mt-20 w-full py-6 md:pb-28 md:pt-48"
          >
            <img
              className=" hidden "
              ref={imgRef}
              src="img/landing/hero-back.jpg"
              alt="Background"
            />
            <div
              className=" mx-6 my-8 mt-16 rounded-3xl border-2 border-gray-100 bg-white bg-opacity-70 
             py-12 text-center align-middle 
             text-black sm:mx-16 sm:px-16 md:mx-32 md:my-20 md:mt-20 
             md:px-32
             md:py-20
             lg:mx-48 xl:mx-64     xl:px-64
             2xl:mx-72 
             
            2xl:px-72"
            >
              <p className="whitespace-nowrap font-serif text-2xl font-bold  md:text-4xl ">
                BROWSE SMARTER
              </p>
              <p className="mt-8 font-serif md:text-xl">
                Discover and manage the best resources.
              </p>
              <a
                href="https://tally.so/r/mVjz7J"
                target="_blank"
                rel="noreferrer"
              >
                <button className=" mt-8 rounded-full bg-black px-6 py-3 font-serif text-white">
                  JOIN THE WAITLIST
                </button>
              </a>
            </div>
          </div>

          {/* <div className="relative">
            <div
              id="back"
              className="absolute left-0 top-0 z-0 h-full w-full"
              style={{
                background: 'url(/img/landing/hero-back.jpg)',
                backgroundSize: 'cover',
                backgroundRepeat: 'no-repeat'
              }}
            ></div>
            <div
              id="middle"
              ref={canvasRef}
              className="absolute left-0 top-0 z-10 -mt-20 w-full py-6 opacity-50 md:pb-28 md:pt-48"
            >
              <img
                className="hidden"
                ref={imgRef}
                src="img/landing/hero-grid.jpg"
                alt="Background"
              />
            </div>
            <div
              id="top"
              className="absolute left-0 top-0 z-20 mx-6 my-8 mt-16 rounded-3xl border-2 border-gray-100 bg-white bg-opacity-70 
               py-12 text-center align-middle 
               text-black sm:mx-16 sm:px-16 md:mx-32 md:my-20 md:mt-20 
               md:px-32
               md:py-20
               lg:mx-48 xl:mx-64 xl:px-64
               2xl:mx-72 
               2xl:px-72"
            >
              <p className="whitespace-nowrap font-serif text-3xl font-bold md:text-4xl">
                BROWSE SMARTER
              </p>
              <p className="mt-8 font-serif md:text-xl">
                Discover and manage the best resources.
              </p>
              <a href="/app" target="_blank" rel="noreferrer">
                <button className="mt-8 rounded-full bg-black px-6 py-3 font-serif text-white">
                  EXPLORE
                </button>
              </a>
            </div>
          </div> */}

          {/* Welcome */}
          <div className="relative -top-6 hidden justify-center sm:flex">
            <a id="anchor" href="#anchor">
              <svg
                width="54"
                height="53"
                viewBox="0 0 54 53"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  x="53"
                  y="1"
                  width="51"
                  height="52"
                  rx="25.5"
                  transform="rotate(90 53 1)"
                  fill="white"
                />
                <path
                  d="M33.3456 26.9043L27 33.2499L20.6543 26.9043"
                  stroke="#121212"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M27 33.2499L27 19.75"
                  stroke="#121212"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <rect
                  x="53"
                  y="1"
                  width="51"
                  height="52"
                  rx="25.5"
                  transform="rotate(90 53 1)"
                  stroke="#121212"
                  strokeWidth="2"
                />
              </svg>
            </a>
          </div>
        </div>

        <div
          style={{
            background: 'url(/img/landing/nata-back-products.svg)',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat'
          }}
          className="mt:6 w-full md:mt-32"
        >
          <div
            id="welcome"
            className="mx-6 font-serif sm:mx-16 md:mx-32 lg:mx-48 xl:mx-64 2xl:mx-72"
          >
            <div className="pb-8">
              <span className=" mr-3 text-xs font-bold tracking-widest">
                WELCOME{' '}
              </span>
              ⎯⎯⎯⎯⎯
            </div>
            <p className=" text-3xl font-bold">
              Join the first social
              <br />
              bookmarking platform.
            </p>
            <p className="mt-4">
              Backed by the community&apos;s collective knowledge
            </p>
            <div className="mt-8 flex-1 justify-center text-center sm:flex">
              <div className="mt-4 flex-1">
                <div
                  style={{
                    background: 'url(/img/landing/nata-feat-1.svg)',
                    backgroundSize: 'cover',
                    backgroundRepeat: 'no-repeat'
                  }}
                  className="mb-6 rounded-xl border-2 border-gray-100 px-12 py-10 sm:mr-3 "
                >
                  <p className="text-xl font-semibold">
                    Save time. Be efficient.
                  </p>
                  <p className="mt-4 font-sans text-sm ">
                    Get the <b>best content</b> across the web
                    <br /> <b>aggregated</b> into a single, easy to use dApp.
                  </p>
                </div>

                <div
                  style={{
                    background: 'url(/img/landing/nata-feat-3.svg)',
                    backgroundSize: 'cover',
                    backgroundRepeat: 'no-repeat'
                  }}
                  className="rounded-xl border-2 border-gray-100 px-12 py-10 sm:mr-3 "
                >
                  <p className="text-xl font-semibold">Curated feed.</p>
                  <p className="mt-4 font-sans  text-sm ">
                    A <b>community-driven curation</b> system.
                    <br /> Social discovery of resources across the web.
                  </p>
                </div>
              </div>

              <div className="mt-4 flex-1 pb-4">
                <div
                  style={{
                    background: 'url(/img/landing/nata-feat-2.svg)',
                    backgroundSize: 'cover',
                    backgroundRepeat: 'no-repeat'
                  }}
                  className="mb-6 rounded-xl border-2 border-gray-100 px-12 py-10 sm:ml-3 "
                >
                  <p className="text-xl font-semibold">
                    Manage your bookmarks.
                  </p>
                  <p className="mt-4 font-sans  text-sm ">
                    Say goodbye to cluttering, and say hello to <br />
                    organized <b>custom reading lists</b>.
                  </p>
                </div>

                <div
                  style={{
                    background: 'url(/img/landing/nata-feat-4.svg)',
                    backgroundSize: 'cover',
                    backgroundRepeat: 'no-repeat'
                  }}
                  className="rounded-xl border-2 border-gray-100 px-12 py-10 sm:ml-3 "
                >
                  <p className="text-xl font-semibold">Projects.</p>
                  <p className="mt-4 font-sans text-sm ">
                    <b>Keep track </b>of the most relevant articles about
                    <br /> your favourite projects.
                  </p>
                </div>
              </div>
            </div>

            {/* Our features */}
            <div id="features" className="mt-10 pb-8 md:mt-32">
              <span className=" mr-3 text-xs font-bold tracking-widest">
                OUR FEATURES{' '}
              </span>
              ⎯⎯⎯⎯⎯
            </div>
            <div className="flex py-6">
              <p className="z-1 text-3xl font-bold">
                Get the most out of the web.
              </p>
              <svg
                className=" -z-10 -ml-40 -mt-2"
                width="184"
                height="58"
                viewBox="0 0 184 58"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M183.123 29.0001C183.123 45.0163 170.063 58 153.953 58L29.1696 57.9997C13.0597 57.9997 -7.04187e-07 45.0161 0 28.9999C7.04187e-07 12.9837 13.0597 4.54463e-07 29.1696 0L153.953 0.000256066C170.063 0.000256766 183.123 12.9839 183.123 29.0001Z"
                  fill="url(#paint0_linear_1_899)"
                />
                <defs>
                  <linearGradient
                    id="paint0_linear_1_899"
                    x1="5.5"
                    y1="29"
                    x2="190.108"
                    y2="28.9613"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop
                      offset="0.236641"
                      stopColor="#C7FFF2"
                      stopOpacity="0"
                    />
                    <stop offset="0.424509" stopColor="#C7FFF2" />
                    <stop offset="1" stopColor="#00FABF" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            {/* carousel */}
            <div className=" flex flex-row overflow-hidden pt-6">
              <Swiper
                autoplay={{ delay: 0, disableOnInteraction: false }}
                speed={5000}
                slidesPerView={1}
                spaceBetween={10}
                breakpoints={{
                  640: {
                    slidesPerView: 2,
                    spaceBetween: 20
                  },
                  768: {
                    slidesPerView: 2,
                    spaceBetween: 40
                  },
                  1024: {
                    slidesPerView: 3,
                    spaceBetween: 50
                  }
                }}
                loop={true}
              >
                {items.map((card) => {
                  return (
                    <SwiperSlide className="mt-4" key={card.name}>
                      {card.soon ? (
                        <button
                          style={{
                            backgroundColor: '#09fabf',
                            marginLeft: '27%'
                          }}
                          className="absolute -top-4 justify-center rounded-full px-4 py-1 text-xs font-medium tracking-widest"
                        >
                          COMING SOON
                        </button>
                      ) : (
                        ''
                      )}

                      <div
                        style={{
                          borderWidth: '1px'
                          // width: '200px',
                          // height: '200px'
                        }}
                        key={card.name}
                        className="  mx-2 rounded-xl border-solid border-black bg-transparent px-6 py-6"
                      >
                        <div
                          style={{ flex: '0 0 33.33%' }}
                          className="flex align-baseline"
                        >
                          <img src={card.icon} alt="" width={28} height={28} />
                          <span className="ml-2 text-xl font-bold ">
                            {card.name}
                          </span>
                        </div>
                        <div className="mt-4 font-sans  text-sm">
                          {card.description}
                        </div>
                      </div>
                    </SwiperSlide>
                  );
                })}
              </Swiper>
            </div>

            {/* Our browser extension */}
            <div className="mt-14 pb-8 md:mt-32">
              <span className=" mr-3 text-xs font-semibold tracking-widest">
                OUR BROWSER EXTENSION{' '}
              </span>
              ⎯⎯⎯⎯⎯
            </div>

            <div className="flex-1 items-center sm:flex">
              <Image
                // style={{ objectFit: 'contain' }}
                width={500}
                height={300}
                className="mb-10"
                src="/img/landing/extension.svg"
                alt=""
              />

              <div className="ml-10  ">
                <p className="z-1 mb-6 text-3xl font-bold">
                  Save content on the fly.
                </p>
                <p>
                  Collect articles and links easily on your favorite browser.
                </p>
              </div>
            </div>
          </div>

          {/* Sponsors */}
          <div
            className="mt-12 w-full border-y-2 border-y-gray-100 bg-white py-4 text-center md:mt-32"
            style={{
              background: 'url(/img/landing/back-sponsors.svg)',
              backgroundSize: 'cover',
              backgroundRepeat: 'no-repeat'
            }}
          >
            <div className="mx-4 items-center sm:mx-16 sm:flex sm:flex-row sm:justify-between md:mx-32 lg:mx-48 xl:mx-64 2xl:mx-72">
              <div className="mr-2 ">
                <p className="whitespace-nowrap py-6 font-serif text-xl font-bold">
                  Supported by
                </p>
              </div>

              <div className=" flex   items-center justify-center md:flex md:flex-row ">
                <Image
                  width={140}
                  height={50}
                  className="m-2"
                  src="/img/landing/kleros.svg"
                  alt=""
                />
                <Image
                  width={140}
                  height={50}
                  className="m-2"
                  src="/img/landing/lens.svg"
                  alt=""
                />
                <Image
                  width={140}
                  height={50}
                  className="m-2"
                  src="/img/landing/polygon.svg"
                  alt=""
                />
                <Image
                  width={110}
                  height={50}
                  className="m-2"
                  src="/img/landing/kalei.svg"
                  alt=""
                />
              </div>
            </div>
          </div>

          <div className="my-10 py-10 text-center">
            <a
              href="https://discord.gg/6wunUd6Ws4"
              target="_blank"
              rel="noreferrer"
            >
              <button
                className="mx-10 rounded-full border-2 border-solid border-black
             bg-transparent px-10 py-4 font-serif text-xl font-bold md:mx-2 md:text-3xl"
              >
                <div className="flex items-center gap-12 px-2 py-1">
                  Join our community
                  <svg
                    width="50"
                    height="50"
                    viewBox="0 0 80 81"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle cx="40" cy="40.249" r="40" fill="#121212" />
                    <path
                      d="M40.4019 28.0978L51.4019 38.7159L40.4019 49.3339"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M51.4017 38.7159L28 38.7159"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </button>
            </a>
          </div>

          <div className="my-10 bg-black py-10 text-center text-white">
            <div className=" mx-6 mt-4 font-serif sm:mx-16 md:mx-32 lg:mx-48 xl:mx-64 2xl:mx-72">
              <div
                style={{
                  borderBottom: 1,
                  borderStyle: 'solid',
                  borderBottomColor: 'lightgray'
                }}
                className="items-center justify-between pb-10 lg:flex"
              >
                <img
                  className="mb-4 lg:mb-0"
                  src="/img/landing/nata-logo-white.svg"
                  alt=""
                />
                <div className="my-6 flex gap-5 font-serif text-xs lg:my-0">
                  <a href="#welcome">ABOUT</a>
                  <a href="#features">PRODUCTS</a>
                  <a
                    href="https://natasocial.gitbook.io/nata-social-docs/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    DOCS
                  </a>
                  <a
                    href="https://natasocial.gitbook.io/nata-social-docs/nata-social-overview/faq"
                    target="_blank"
                    rel="noreferrer"
                  >
                    FAQS
                  </a>
                  <a href="mailto:info@nata.social">CONTACT</a>
                </div>
                <div className="flex  gap-5">
                  <a
                    href="https://lenster.xyz/u/natasocial"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <img
                      height={18}
                      width={18}
                      src="/img/landing/link-lenster.svg"
                      alt=""
                    />
                  </a>

                  <a
                    href="https://twitter.com/Nata_Social"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <img src="/img/landing/link-twitter.svg" alt="" />
                  </a>

                  <a
                    href="https://discord.gg/6wunUd6Ws4"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <img src="/img/landing/link-discord.svg" alt="" />
                  </a>

                  <a
                    id="contact"
                    href="mailto:info@nata.social"
                    rel="noreferrer"
                    style={{ marginTop: '3px' }}
                  >
                    <img src="/img/landing/link-email.svg" alt="" />
                  </a>

                  <a
                    href="http://linkedin.com/company/lenstags"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <img src="/img/landing/link-linkedin.svg" alt="" />
                  </a>
                </div>
              </div>
              <div className="mt-6 flex justify-between text-xs text-white">
                <span>Copyright (C) 2023 | All rights reserved. </span>
                <div className="flex">
                  <a href="#">Terms and Conditions</a>
                  <span className="mx-2">|</span>
                  <a href="#">Privacy Policy</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </LayoutLanding>
    </div>
  );
};

export default Home;
