import styled from "styled-components";
import WishMain from "./Sections/Main";
import SEOHelmet from "../../components/seo/SEOHelmet";

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
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    
    return (
        <>
            <SEOHelmet
                title="Lista de Desejos | Fast Sistemas Construtivos"
                description="Seus produtos favoritos salvos para compra futura. Organize sua lista de materiais de construção."
                canonicalUrl={`${origin}/lista-de-desejos`}
                type="website"
                noindex={true}
            />
            <Container>
                <WishMain />
            </Container>
        </>
    )
}