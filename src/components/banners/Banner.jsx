import styled from "styled-components";
import { addUTM } from "../../utils/url";

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

    // Build href with UTM parameters
    const finalHref = href ? addUTM(href) : undefined

    return (
        <>
            <Wrapper>
                {finalHref ? (
                    <Clickable href={finalHref} onClick={onClick} aria-label={alt} rel="noopener">
                        {content}
                    </Clickable>
                ) : (
                    content
                )}
            </Wrapper>
        </>
    )
}