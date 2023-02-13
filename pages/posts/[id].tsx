import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import moment from 'moment';
import ImageProxied from 'components/ImageProxied';
import { Center, HStack, Link, Stack, Tag, Text } from '@chakra-ui/react';
import { CollectedIcon } from 'components/icons/CollectedIcon';
import { HeartIcon } from 'components/icons/HeartIcon';
import { CommentIcon } from 'components/icons/CommentIcon';

export default function PostDetails() {
  const router = useRouter();
  const { id } = router.query;
  const [post, setPost] = useState<any>();
  useEffect(() => {
    const storedObject = localStorage.getItem('LENS_POST') || '';
    const myObject = JSON.parse(storedObject);
    setPost(myObject);
  }, [id]);

  return (
    post && (
      <Stack width={'100%'} height={'100vh'}>
        {/**Image cover Top de la Publicacion */}
        <ImageProxied
          category="post"
          height={300}
          width={600}
          objectFit="cover"
          className="block h-auto w-full"
          src={post.metadata.media[0]?.original.url}
        />
        <Stack p={'54px'} width={'100%'}>
          {/**Header de la Publicacion */}
          <Stack>
            <HStack justifyContent={'space-between'}>
              <HStack>
              <ImageProxied
                    category="profile"
                    title={`Loading...`}
                    alt="Profile"
                    height={50}
                    width={50}
                    objectFit="cover"
                    className="h-12 w-12 cursor-pointer rounded-full"
                    src={post.profile.picture?.original?.url}
                  />
                <Stack paddingLeft={'8px'} justify={'center'}>
                  <Text fontWeight={400} fontSize={'20px'}>{post.profile.name} </Text>
                  <Text fontWeight={400} fontSize={'20px'}>@{post.profile.handle}</Text>
                </Stack>
              </HStack>
              <Text fontWeight={400} fontSize={'20px'}>Publicado:   {moment(post.createdAt).format('MMM Do YY')}</Text>
            </HStack>
            <Text fontWeight={500} fontSize={'31px'} pt={'23px'}>{post.metadata.name || 'untitled'}</Text>
            <HStack gap={2} pt={'24px'}>
              <Text display={'flex'} gap={1} alignItems={'center'}><CollectedIcon />15k</Text>
              <Text display={'flex'} gap={1} alignItems={'center'}><HeartIcon />30k</Text>
              <Text display={'flex'} gap={1} alignItems={'center'}><CommentIcon />250</Text>
            </HStack>
          </Stack>
          {/**Body de la publicacion */}
          <Text fontWeight={600} fontSize={'20px'} pt={'32px'}>{post.metadata.description || 'no-description'}</Text>
          <Text
            dangerouslySetInnerHTML={{ __html: post.metadata.content }}
            fontWeight={400}
            fontSize={'20px'}
          ></Text>
          {/**Footer de la publicacion */}
          <HStack pt={'36px'}>
            {post.metadata.tags.map((tag: any, index: any) => <Tag key={index} background={'#D9D9D9'} height={'28px'}>{tag}</Tag>)}
          </HStack>
          <Center pt={'37px'}>
            <Text fontWeight={500} fontSize={'20px'} color={'#6D1EDC'}>See mor content from <Link fontWeight={700}>What is LensTags</Link> List</Text>
          </Center>
        </Stack>
      </Stack>
    )
  );
}

