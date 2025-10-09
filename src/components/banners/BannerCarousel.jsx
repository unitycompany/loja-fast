import styled from "styled-components";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation, A11y } from "swiper/modules";
import "swiper/css";
import Banner from "./Banner";
import { ArrowRightIcon, ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr";

const Wrapper = styled.div`
  width: 100%;
  height: ${({ $height }) => $height || "400px"};

  .swiper {
    width: 100%;
    height: 100%;
  }
  .swiper-slide {
    height: 100%;
  }
`;

const Control = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0px;
    position: absolute;
    bottom: 0;
    right: 0%;
    transform: translateX(0%);
    z-index: 2;
    height: 40px;
    background-color: var(--color--white);
    display: none;

    @media (max-width: 768px) {
        height: 36px;
    }

    & .swiper-button-prev, .swiper-button-next {
        padding: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        width: auto;
        position: relative;
        color: var(--color--black);
        cursor: pointer;
        border: 1px solid var(--color--gray-4);
        border-bottom: none;

        &:hover {
            & svg {
                color: var(--color--primary);
                transform: scale(0.95);
            }
        }

        & svg {
            width: 28px;
            height: 28px;
            transition: all 0.2s ease;

            @media (max-width: 768px) {
                width: 24px;
                height: 24px;
            }
        }
    }

    & .swiper-pagination {
        position: relative;
        display: flex;
        bottom: auto;
        align-items: center;
        justify-content: center;
        gap: 4px;
        padding: 4px 8px;
        height: 100%;
        width: auto;
        border-top: 1px solid var(--color--gray-4);

        @media (max-width: 768px) {
            padding: 4px 12px;
        }

    }

    & .swiper-pagination-bullet {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--color--gray-4);
        cursor: pointer;
    }

    & .swiper-pagination-bullet-active {
        background: var(--color--black);
    }
`

export default function BannerCarousel({
    items = [],
    height = '400px',
    autoplayDelay = 5000,
    loop = true,
}) { 

    if (!items?.length) return null;

    return (
        <>
            <Wrapper $height={height}>
                <Swiper
                    modules={[Autoplay, Pagination, Navigation, A11y]}
                    loop={loop}
                    autoplay={{ delay: autoplayDelay, disableOnInteraction: false }}
                    pagination={{
                        clickable: true,
                        el: '.swiper-pagination',
                    }}
                    navigation={{
                        nextEl: '.swiper-button-next',
                        prevEl: '.swiper-button-prev',
                    }}
                    slidesPerView={1}
                    spaceBetween={0}
                    a11y={{ enabled: true }}
                    // performance:
                    lazyPreloadPrevNext={1}
                >
                    {items.filter(item => item.type === 'home').map((item, idx) => (
                    <SwiperSlide key={idx}>
                        <Banner
                            urlMobile={item.urlMobile}
                            urlDesktop={item.urlDesktop}
                            alt={item.alt}
                            href={item.href}
                            loading={idx === 0 ? "eager" : "lazy"}
                            sizes="(max-width:768px) 100vw, 1200px"
                            local={item.type}
                        />
                    </SwiperSlide>
                    ))}

                    <Control>
                        <div className="swiper-button-prev">
                            <ArrowLeftIcon /> 
                        </div>
                        <div className="swiper-pagination"></div>
                        <div className="swiper-button-next">
                            <ArrowRightIcon /> 
                        </div>
                    </Control>
                </Swiper>
            </Wrapper>
        </>
    )
}