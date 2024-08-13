import type { FriendLinksItem } from '@/types/config'
import { loadImage } from '@utils/file-utils'
import { useEffect, useState } from 'react'

interface FriendCardProps extends FriendLinksItem {
  className?: string
}
export default function FriendCard({
  className,
  link,
  nickname,
  avatarURL = '',
  bio = 'Done is better than perfect.',
}: FriendCardProps) {
  const [avatarSrc, setAvatarSrc] = useState<string>('')

  useEffect(() => {
    const loadAvatar = async (url: string) => {
      try {
        const imgSrc = await loadImage(url, {
          defaultImageUrl:
            'https://fastly.jsdelivr.net/gh/Ocean-H1/blog_image_bed/what_is_ts.png',
        })
        setAvatarSrc(imgSrc)
      } catch (error) {
        console.error('Unexpected error in Avatar loading:', error)
      }
    }

    loadAvatar(avatarURL)
  }, [avatarURL])

  return (
    <a
      href={link}
      target='_blank'
      className={`${className} transition ease-in-out flex rounded-xl shadow-lg items-center bg-sky-50 p-6 font-medium text-xs cursor-pointer justify-between gap-6 hover:shadow-md hover:bg-sky-100 hover:scale-110`}
      rel='noreferrer'
    >
      <div className='avatar w-1/3'>
        {avatarSrc && (
          <img src={avatarSrc} alt='user avatar' className='rounded-full' />
        )}
      </div>
      <div className='profile flex flex-col w-2/3 text-ellipsis'>
        <span className='font-semibold text-lg'>{nickname}</span>
        <span>{bio}</span>
      </div>
    </a>
  )
}
