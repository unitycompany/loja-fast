import styled from "styled-components";
import WishMain from "./Sections/Main";
import SEOHelmet from "../../components/seo/SEOHelmet";
import { ROUTE_SEO, SITE_CONFIG } from '../../lib/seoConfig';

const Container = styled.main`
    display: flex;
    align-items: center;
    justify-content: flex-start;
    flex-direction: column;
    position: relative;
    width: 100%;
    max-width: 1440px;
    height: auto;
    margin: 0 auto;
    padding: 0 0;
`

export default function WhishList() {
    const favoritosSEO = ROUTE_SEO.favoritos
    
    return (
        <>
            <SEOHelmet
                title={favoritosSEO.title}
                description={favoritosSEO.description}
                canonicalUrl={`${SITE_CONFIG.url}${favoritosSEO.path}`}
                type="website"
                noindex={true}
            />
            <Container>
                <WishMain />
            </Container>
        </>
    )
}