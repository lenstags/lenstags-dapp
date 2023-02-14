import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import ImageProxied from 'components/ImageProxied';
import { Layout } from 'components';
import { Avatar, Button, Divider, HStack, Image, Link, Stack, Text } from '@chakra-ui/react';
import { getIPFSImage } from '@lib/helpers';
import { FeatureIcon } from 'components/icons/FeatureIcon';
import { PostIcons } from 'components/icons/PostIcons';
import { ListIcon } from 'components/icons/ListIcon';
import { CollectedIcon } from 'components/icons/CollectedIcon';


export default function PostDetails() {
  const router = useRouter();
  const { id } = router.query;
  const [profile, setProfile] = useState<any>();
  useEffect(() => {
    const storedObject = localStorage.getItem('LENS_PROFILE') || '';
    const myObject = JSON.parse(storedObject);
    setProfile(myObject);
  }, [id]);
  
  return (
    <Layout title="Lenstags | Profile" pageDescription="Profile" screen={true}>
      {profile && (
        <Stack width={'100%'} height={'100%'} bg={'#F5F5F5'} pb={20}>
          {/**Header Profile */}
          <Stack bg={'#FFFFFF'} pb={'42px'}>
            <ImageProxied
              category="post"
              height={217}
              width={600}
              objectFit="cover"

              src={profile.coverPicture?.original?.url}
            />
            <Image w={'170px'} h={'170px'} borderRadius={'50%'} src={getIPFSImage(profile.picture?.original?.url)} position={'absolute'} left={'15%'} top={'187px'} />
            <Stack p={'0px 15%'} width={'100%'}>
              <HStack justifyContent={'flex-end'} w={'100%'}>
                <Button bg={'#DEF702'} w={'224px'} h={'46px'}>FOLLOW</Button>
              </HStack>
              <Stack pt={'50px'}>
                <Text fontWeight={500} fontSize={'31px'}>{profile.name}</Text>
                <Text fontWeight={300} fontSize={'24px'}>@{profile.handle}</Text>
                <Text fontWeight={400} fontSize={'24px'}>{profile.bio}</Text>
                <HStack gap={4} pt={'24px'}>
                  <Stack>
                    <Text fontWeight={400} fontSize={'16px'} color={'#868585'}>Followings</Text>
                    <Text fontWeight={600} fontSize={'16px'}>{profile.stats?.totalFollowing}</Text>
                  </Stack>
                  <Stack>
                    <Text fontWeight={400} fontSize={'16px'} color={'#868585'}>Followers</Text>
                    <Text fontWeight={600} fontSize={'16px'}>{profile.stats?.totalFollowers}</Text>
                  </Stack>
                  <Divider orientation='vertical' />
                  <Stack>
                    <Text fontWeight={400} fontSize={'16px'} color={'#868585'}>Curated by</Text>
                    <HStack>
                      <Avatar size={'xs'} />
                      <Avatar size={'xs'} />
                      <Avatar size={'xs'} />
                    </HStack>
                  </Stack>
                </HStack>
              </Stack>
            </Stack>
          </Stack>
          <Stack p={'0px 15%'} gap={5}>
            {/**Feature Card Container */}
            <Stack p={'23px'} minW={'100%'} minH={'360px'} bg={'#FFFFFF'} borderRadius={'16px'} mt={'24px'}>
              <HStack align={'center'} pt={'0px'}>
                <FeatureIcon />
                <Text fontWeight={500} fontSize={'25px'}>Featured</Text>
              </HStack>
              <Stack display={'flex'} direction={['column', 'column', 'row']} alignItems={'center'} w={'100%'} justify={'center'}>
                <Stack w={'240px'} h={'235px'} bg={'gray.200'}>

                </Stack>
                <Stack w={'240px'} h={'235px'} bg={'gray.200'}>

                </Stack>
                <Stack w={'240px'} h={'235px'} bg={'gray.200'}>

                </Stack>
              </Stack>
              <HStack justifyContent={'flex-end'}>
                <Link fontWeight={500} fontSize={'16px'}>SEE MORE</Link>
              </HStack>
            </Stack>
            {/**Post Card Container */}
            <Stack p={'23px'} minW={'100%'} minH={'360px'} bg={'#FFFFFF'} borderRadius={'16px'} mt={'24px'}>
              <HStack align={'center'} pt={'0px'}>
                <PostIcons />
                <Text fontWeight={500} fontSize={'25px'}>Posts</Text>
              </HStack>
              <Stack display={'flex'} direction={['column', 'column', 'row']} alignItems={'center'} w={'100%'} justify={'center'}>
                <Stack w={'240px'} h={'235px'} bg={'gray.200'}>

                </Stack>
                <Stack w={'240px'} h={'235px'} bg={'gray.200'}>

                </Stack>
                <Stack w={'240px'} h={'235px'} bg={'gray.200'}>

                </Stack>
              </Stack>
              <HStack justifyContent={'flex-end'}>
                <Link fontWeight={500} fontSize={'16px'}>SEE MORE</Link>
              </HStack>
            </Stack>
              {/**Lists Card Container */}
            <Stack p={'23px'} minW={'100%'} minH={'360px'} bg={'#FFFFFF'} borderRadius={'16px'} m={'100px'}>
              <HStack align={'center'} pt={'0px'}>
                <ListIcon />
                <Text fontWeight={500} fontSize={'25px'}>Lists</Text>
              </HStack>
              <Stack display={'flex'} direction={['column', 'column', 'row']} alignItems={'center'} w={'100%'} justify={'center'}>
                <Stack w={'240px'} h={'235px'} bg={'gray.200'}>

                </Stack>
                <Stack w={'240px'} h={'235px'} bg={'gray.200'}>

                </Stack>
                <Stack w={'240px'} h={'235px'} bg={'gray.200'}>

                </Stack>
              </Stack>
              <HStack justifyContent={'flex-end'}>
                <Link fontWeight={500} fontSize={'16px'}>SEE MORE</Link>
              </HStack>
            </Stack>
                 {/**Collects Card Container */}
                 <Stack p={'23px'} minW={'100%'} minH={'360px'} bg={'#FFFFFF'} borderRadius={'16px'} mt={'24px'}>
              <HStack align={'center'} pt={'0px'}>
                <CollectedIcon />
                <Text fontWeight={500} fontSize={'25px'}>Collects</Text>
              </HStack>
              <Stack display={'flex'} direction={['column', 'column', 'row']} alignItems={'center'} w={'100%'} justify={'center'}>
                <Stack w={'240px'} h={'235px'} bg={'gray.200'}>

                </Stack>
                <Stack w={'240px'} h={'235px'} bg={'gray.200'}>

                </Stack>
                <Stack w={'240px'} h={'235px'} bg={'gray.200'}>

                </Stack>
              </Stack>
              <HStack justifyContent={'flex-end'}>
                <Link fontWeight={500} fontSize={'16px'}>SEE MORE</Link>
              </HStack>
            </Stack>
          </Stack>
        </Stack>
      )
      }
    </Layout>
  );
}
