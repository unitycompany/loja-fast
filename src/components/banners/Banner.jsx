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

    console.log('🎯 Banner received href:', href)
    
    // Clean href - remove leading slash from external URLs
    let cleanHref = href
    if (href && href.startsWith('/http')) {
        cleanHref = href.substring(1) // Remove the leading slash
        console.log('🧹 Cleaned href from', href, 'to', cleanHref)
    }
    
    // Build href with UTM parameters
    const finalHref = cleanHref ? addUTM(cleanHref) : undefined
    
    console.log('🎯 Banner finalHref after addUTM:', finalHref)
    
    // Check if it's an external URL
    const isExternalUrl = finalHref && /^https?:\/\//i.test(finalHref)
    
    console.log('🎯 Banner isExternalUrl:', isExternalUrl)

    // Handle click - for external URLs, force native navigation
    const handleClick = (e) => {
        console.log('🖱️ Banner clicked! isExternalUrl:', isExternalUrl, 'finalHref:', finalHref)
        
        if (isExternalUrl) {
            // Prevent React Router from intercepting
            e.preventDefault()
            console.log('🚀 Opening external URL:', finalHref)
            // Navigate using window.location for external URLs
            window.open(finalHref, '_blank', 'noopener,noreferrer')
            return
        }
        if (onClick) {
            onClick(e)
        }
    }

    return (
        <>
            <Wrapper>
                {finalHref ? (
                    <Clickable 
                        href={finalHref} 
                        onClick={handleClick} 
                        aria-label={alt} 
                        rel={isExternalUrl ? "noopener noreferrer" : undefined}
                        target={isExternalUrl ? "_blank" : undefined}
                    >
                        {content}
                    </Clickable>
                ) : (
                    content
                )}
            </Wrapper>
        </>
    )
}