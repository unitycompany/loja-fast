import styled from "styled-components";

const Wrapper = styled.div`
  position: relative;
  display: block;
  width: 100%;
  height: 100%;
  overflow: hidden;
`;

const Clickable = styled.a`
  display: block;
  width: 100%;
  height: 100%;
  text-decoration: none;
  color: inherit;
`;

const Media = styled.picture`
  display: block;
  width: 100%;
  height: 100%;
`;

const Img = styled.img`
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
`;

export default function Banner({
    urlMobile,
    urlDesktop,
    alt,
    href,
    loading = 'lazy',
    sizes = '(max-width: 768px) 100vw, 1200px',
    onClick,
}) {

    const content = (
        <Media>
            <source srcSet={urlMobile} media="(max-width: 768px)" />
            <source srcSet={urlDesktop} media="(min-width: 769px)" />
            <Img
                src={urlDesktop}
                alt={alt}
                loading={loading}
                sizes={sizes}
            />
        </Media>
    )

    return (
        <>
            <Wrapper>
                {href ? (
                    <Clickable href={href} onClick={onClick} aria-label={alt} rel="noopener">
                        {content}
                    </Clickable>
                ) : (
                    content
                )}
            </Wrapper>
        </>
    )
}