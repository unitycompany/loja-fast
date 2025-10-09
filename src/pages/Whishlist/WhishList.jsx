import styled from "styled-components";
import WishMain from "./Sections/Main";

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
    return (
        <>
            <Container>
                <WishMain />
            </Container>
        </>
    )
}