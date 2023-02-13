import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import moment from 'moment';
import ImageProxied from 'components/ImageProxied';
import { Layout } from 'components';
import { Avatar, Button, Container, Divider, HStack, Image, Stack, Text } from '@chakra-ui/react';
import { getIPFSImage } from '@lib/helpers';

export default function PostDetails() {
  const router = useRouter();
  const { id } = router.query;
  const [profile, setProfile] = useState<any>();
  useEffect(() => {
    const storedObject = localStorage.getItem('LENS_PROFILE') || '';
    const myObject = JSON.parse(storedObject);
    setProfile(myObject);
  }, [id]);
  console.log(profile);

  return (
    <Layout title="Lenstags | Profile" pageDescription="Profile" screen={true}>
      {profile && (
        <Stack width={'100%'} height={'100vh'} bg={'#F5F5F5'}>
          {/**Header Profile */}
          <Stack bg={'#FFFFFF'} pb={'42px'}>
          <ImageProxied
            category="post"
            height={217}
            width={600}
            objectFit="cover"
    
            src={profile.coverPicture?.original?.url}
          />
          <Image w={'170px'} h={'170px'} borderRadius={'50%'} src={getIPFSImage(profile.picture?.original?.url)} position={'absolute'} left={'15%'} top={'17%'}/>
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
                    <Avatar size={'xs'}/>
                    <Avatar size={'xs'}/>
                    <Avatar size={'xs'}/>
                  </HStack>
                </Stack>
              </HStack>
            </Stack>
          </Stack>
          </Stack>
          <Stack  p={'0px 15%'} >
          {/**Feature Card Container */}
          <Stack p={'33px'} w={'100%'} h={'360px'} bg={'#FFFFFF'} borderRadius={'16px'}>

          </Stack>
          </Stack>
        </Stack>
      )
      }
    </Layout>
  );
}
