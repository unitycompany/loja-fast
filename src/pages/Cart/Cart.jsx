import styled from "styled-components";
import MainCart from "./Sections/Main";
import SEOHelmet from "../../components/seo/SEOHelmet";

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
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    
    return (
        <>
            <SEOHelmet
                title="Carrinho de Compras | Fast Sistemas Construtivos"
                description="Revise seus produtos selecionados e solicite um orçamento personalizado. Entrega rápida e preços competitivos."
                canonicalUrl={`${origin}/carrinho`}
                type="website"
                noindex={true}
            />
            <Container>
                <MainCart />
            </Container>
        </>
    )
}