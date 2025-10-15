import styled from "styled-components";
import MainCart from "./Sections/Main";
import SEOHelmet from "../../components/seo/SEOHelmet";
import { ROUTE_SEO, SITE_CONFIG } from '../../lib/seoConfig';

const Container = styled.div`
    width: 100%;
    max-width: 1440px;
    left: 50%;
    transform: translateX(-50%);
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 16px;
`

export default function Cart() {
    const orcamentoSEO = ROUTE_SEO.orcamento
    
    return (
        <>
            <SEOHelmet
                title={orcamentoSEO.title}
                description={orcamentoSEO.description}
                canonicalUrl={`${SITE_CONFIG.url}${orcamentoSEO.path}`}
                type="website"
                noindex={true}
            />
            <Container>
                <MainCart />
            </Container>
        </>
    )
}