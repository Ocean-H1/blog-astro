import { Icon } from '@iconify/react'
import { useState } from 'react'
import { TabsList } from '../constants'

import '../style/index.less'

const Share = () => {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const fakeLoading = (timeout: number, cb: () => void) => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
    }, timeout)
    cb()
  }
  const switchTab = (index: number) => {
    if (index !== activeIndex) {
      // mock loading
      fakeLoading(600, () => setActiveIndex(index))
    }
  }

  return (
    <div className='share-container'>
      <div className='tabs'>
        {TabsList.length > 0 &&
          TabsList.map((item, index) => {
            return (
              <div
                className={`tabs-item ${index === activeIndex && 'active'}`}
                key={item.label}
                onClick={() => switchTab(index)}
              >
                {item?.icon && <Icon className='icon' icon={item.icon} />}
                <span className='label truncate'>{item.label}</span>
              </div>
            )
          })}
      </div>
      {isLoading ? (
        <div className='loading'>
          <Icon className='loading-icon' icon='eos-icons:bubble-loading' />
          <span className='loading-label'>全力加载中...</span>
        </div>
      ) : (
        <div className='content'>
          {TabsList[activeIndex].children.length > 0 ? (
            TabsList[activeIndex].children.map((item, index) => {
              return (
                <a
                  href={item.link}
                  target='_blank'
                  className='content-item'
                  key={item.link}
                >
                  <img
                    className='cover'
                    src={item?.cover}
                    alt={item.title}
                    loading='lazy'
                  />
                  <div className='detail'>
                    <span className='title'>{item.title}</span>
                    <p className='intro multiline-ellipsis'>
                      {item.introduction}
                    </p>
                  </div>
                </a>
              )
            })
          ) : (
            <div className='content-empty'>
              <Icon icon='icon-park-outline:error' />
              <span>暂无数据~</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Share
