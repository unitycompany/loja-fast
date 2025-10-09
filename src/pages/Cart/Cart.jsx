import styled from "styled-components";
import MainCart from "./Sections/Main";

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
    return (
        <>
            <Container>
                <MainCart />
            </Container>
        </>
    )
}