import React from 'react'
import { Carousel } from 'antd'

interface BannerItem {
  title: string
  subtitle?: string
  bgColor?: string
  image?: string
}

interface CarouselBannerProps {
  items: BannerItem[]
  height?: number
}

const CarouselBanner: React.FC<CarouselBannerProps> = ({ items, height = 240 }) => {
  const defaultItems: BannerItem[] = [
    { title: '扬光AI商城', subtitle: '探索智能应用，提升工作效率', bgColor: '#111111' },
    { title: '海量AI应用', subtitle: '一站式AI应用平台，赋能每一天', bgColor: '#2a2a2a' },
    { title: '智能对话', subtitle: '与AI助手高效沟通，解锁无限可能', bgColor: '#111111' },
  ]
  const data = items.length > 0 ? items : defaultItems

  return (
    <div style={{
      borderRadius: 12,
      overflow: 'hidden',
      height,
      border: '1px solid #d3cec6',
    }}>
      <Carousel autoplay autoplaySpeed={4000} dots={{ className: 'carousel-dots' }}>
        {data.map((item, idx) => (
          <div key={idx}>
            <div style={{
              height,
              background: item.bgColor || '#111111',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              padding: '0 48px',
              position: 'relative',
              overflow: 'hidden',
            }}>
              <div style={{ fontSize: 24, fontWeight: 500, color: '#fff', marginBottom: 8, letterSpacing: '-0.3px' }}>
                {item.title}
              </div>
              {item.subtitle && (
                <div style={{ fontSize: 16, color: 'rgba(255,255,255,0.75)', fontWeight: 400 }}>
                  {item.subtitle}
                </div>
              )}
            </div>
          </div>
        ))}
      </Carousel>
    </div>
  )
}

export default CarouselBanner
